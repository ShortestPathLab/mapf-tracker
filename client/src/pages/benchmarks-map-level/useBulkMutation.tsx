import { useMutation } from "@tanstack/react-query";
import {
  BlobWriter,
  TextReader,
  ZipWriter,
  ZipWriterConstructorOptions,
} from "@zip.js/zip.js";
import { queryClient } from "App";
import { APIConfig } from "core/config";
import { AlgorithmDetails, Map, Scenario } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import {
  ceil,
  delay,
  find,
  flatMap,
  kebabCase,
  keyBy,
  last,
  once,
  range,
  sumBy,
} from "lodash";
import { nanoid } from "nanoid";
import prettyBytes from "pretty-bytes";
import { parallel } from "promise-tools";
import { post } from "queries/mutation";
import { text, toJson } from "queries/query";
import {
  algorithmDetailsQuery,
  algorithmScenarioQuery,
} from "queries/useAlgorithmQuery";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { CHUNK_SIZE_B, useBenchmarksAll } from "./DownloadOptions";
import { decodeAlgorithmResource } from "./encodeAlgorithmResource";

type UseBulkMutationArgs = {
  maps?: string[];
  scens?: string[];
  results?: string[];
  includeSolutions?: boolean;
  downloadInParts?: boolean;
};
const PARALLEL_LIMIT = 5;
const CHUNK_LIMIT = 500;

const resultQuery = (
  id: string,
  limit: number,
  solutions: boolean,
  onProgress?: (p: number) => void
) => ({
  queryKey: ["bulk-results", id, solutions],
  enabled: !!id,
  queryFn: async () => {
    const all = [];
    const chunks = ceil(limit / CHUNK_LIMIT);
    for (const c of range(chunks)) {
      const res = await post(`${APIConfig.apiUrl}/bulk/results`, {
        scenario: id,
        solutions,
        limit: CHUNK_LIMIT,
        skip: c * CHUNK_LIMIT,
      }).then(toJson);
      all.push(...res);
      onProgress?.(chunks ? (c + 1) / chunks : 0);
    }
    return all;
  },
});

export function useIndexAll() {
  const { data: all, isLoading } = useBenchmarksAll();
  const mapsIndex = useMemo(() => keyBy(flatMap(all, "maps"), "id"), [all]);
  const scensIndex = useMemo(
    () => keyBy(flatMap(flatMap(all, "maps"), "scenarios"), "id"),
    [all]
  );
  return { all, mapsIndex, scensIndex, isLoading };
}

const zipOptions: ZipWriterConstructorOptions = {
  compressionMethod: 8,
  level: 5,
  bufferedWrite: true,
};

class Zip {
  private jobs: Promise<unknown>[] = [];
  constructor(
    public writer: ZipWriter<Blob>,
    public options: {
      name: string;
      part: number;
    },
    public size: number = 0
  ) {}

  flush = once(async () => {
    await Promise.all(this.jobs);
    const data = await this.writer.close();
    download(
      data,
      `${this.options.name}-${this.options.part}.zip`,
      "application/zip"
    );
  });

  async write(path: string, reader: TextReader) {
    this.size += reader.size;
    const job = this.writer.add(path, reader);
    this.jobs.push(job);
    return await job;
  }
}

function createZipWriter({
  chunkSize = CHUNK_SIZE_B,
  inParts = true,
  name = "export",
}: {
  chunkSize?: number;
  inParts?: boolean;
  name?: string;
}) {
  const zips: Zip[] = [];

  async function acquire() {
    const zip = last(zips);
    const sizeExceeded = zip && inParts && zip.size > chunkSize;
    if (!zip || sizeExceeded) {
      if (sizeExceeded) {
        await zip.flush();
      }
      zips.push(
        new Zip(new ZipWriter(new BlobWriter(), zipOptions), {
          name,
          part: zips.length,
        })
      );
      return acquire();
    }
    return zip;
  }

  const writeOne = async (path: string, contents: string) => {
    const zip = await acquire();
    const reader = new TextReader(contents);
    return await zip.write(path, reader);
  };

  const close = async () => {
    await parallel(zips.map((z) => () => z.flush()));
  };
  return { writeOne, close };
}

export const bulkDownloadAlgorithms = async (
  {
    summaries = [],
    submissions = [],
    downloadInParts = true,
  }: { summaries: string[]; downloadInParts?: boolean; submissions: string[] },

  mapsIndex: Record<string, Map>,
  scensIndex: Record<string, Scenario>,
  addJob: R2
) => {
  const { writeOne, close } = createZipWriter({
    chunkSize: CHUNK_SIZE_B,
    inParts: downloadInParts,
    name: `bulk-algo-${nanoid(6)}`,
  });

  // ─── Export Summaries ────────────────────────────────────────────────

  const algorithmsDetails = await queryClient.fetchQuery(
    algorithmDetailsQuery()
  );

  const algorithmIndex = keyBy(algorithmsDetails, "id");

  const getAlgoName = (a: AlgorithmDetails) =>
    `${kebabCase(a.algo_name)}-${a.id}`;

  await parallel(
    summaries.map((id) => async () => {
      const details = find(algorithmsDetails, { id });
      const csv = json2csv([details], { emptyFieldValue: "" });
      const { set } = addJob({
        label: `${details.algo_name}.csv`,
        status: "Downloading",
      });
      const meta = await writeOne(`summary/${getAlgoName(details)}.csv`, csv);
      set({
        progress: 0.75,
        status: `Compressing, ${prettyBytes(meta.compressedSize)}`,
      });
      set({ progress: 1, status: "Done" });
    }),
    PARALLEL_LIMIT
  );

  // ─── Export Submissions ────────────────────────────────────────────────

  await parallel(
    submissions.map((id) => async () => {
      const { algorithm, resource: scenario } = decodeAlgorithmResource(id);
      const details = algorithmIndex[algorithm];
      const scenarioDetails = scensIndex[scenario];
      const mapDetails = mapsIndex[scenarioDetails.map_id];
      const fullName = `${mapDetails.map_name}-${scenarioDetails.scen_type}-${scenarioDetails.type_id}.csv`;
      const { set } = addJob({
        label: `${details.algo_name}: ${fullName}`,
        status: "Downloading",
      });
      set({ progress: 0.25, status: "Downloading" });
      const result = await queryClient.fetchQuery(
        algorithmScenarioQuery(algorithm, scenario)
      );
      set({ progress: 0.5, status: "Compressing" });
      const csv = json2csv(result, { emptyFieldValue: "" });
      const meta = await writeOne(
        `submission/${getAlgoName(details)}/${fullName}`,
        csv
      );
      set({
        progress: 0.75,
        status: `Compressing, ${prettyBytes(meta.compressedSize)}`,
      });
      set({ progress: 1, status: "Done" });
      return { id, result };
    }),
    PARALLEL_LIMIT
  );

  await close();
};

export const bulkDownloadMaps = async (
  {
    maps = [],
    scens = [],
    results = [],
    includeSolutions = false,
    downloadInParts = true,
  }: UseBulkMutationArgs,
  mapsIndex: Record<string, Map>,
  scensIndex: Record<string, Scenario>,
  addJob: R2
) => {
  const { writeOne, close } = createZipWriter({
    chunkSize: CHUNK_SIZE_B,
    inParts: downloadInParts,
    name: `bulk-${nanoid(6)}`,
  });

  // ─── Export Maps ─────────────────────────────────────

  const mapNames = maps.map((m) => mapsIndex[m]?.map_name);
  await parallel(
    mapNames.map((name) => async () => {
      const fullName = `${name}.map`;
      const { set } = addJob({ label: fullName, status: "Downloading" });
      const contents = await text<string>(`/assets/maps/${fullName}`);
      set({ progress: 0.75, status: "Compressing" });
      const meta = await writeOne(`maps/${fullName}`, contents);
      set({ progress: 1, status: `Done, ${prettyBytes(meta.compressedSize)}` });
    }),
    PARALLEL_LIMIT
  );

  // ─── Export Scenarios ────────────────────────────────

  await parallel(
    scens.map((s) => async () => {
      const { scen_type, type_id, map_id } = scensIndex[s];
      const mapName = mapsIndex[map_id]?.map_name;
      const fullName = `${mapName}-${scen_type}-${type_id}.scen`;
      const { set } = addJob({
        label: fullName,
        status: "Downloading",
      });
      const contents = await text(`./assets/scens/${fullName}`);
      set({ progress: 0.75, status: "Compressing" });
      const meta = await writeOne(`scenarios/${fullName}`, contents);
      set({ progress: 1, status: `Done, ${prettyBytes(meta.compressedSize)}` });
    }),
    PARALLEL_LIMIT
  );

  // ─── Export Results ──────────────────────────────────

  await parallel(
    results.map((name) => async () => {
      const scen = scensIndex[name];
      const map = mapsIndex[scen.map_id];
      const fullName = `${map.map_name}-${scen.scen_type}-${scen.type_id}.csv`;
      const { set } = addJob({
        label: fullName,
        status: "Downloading",
      });
      const results = await queryClient.fetchQuery(
        resultQuery(name, scen.instances, includeSolutions, (d) => {
          set({ progress: 0.25 + d / 2, status: "Downloading" });
        })
      );
      const csv = json2csv(results, { emptyFieldValue: "" });
      set({ progress: 0.8, status: "Compressing" });
      const meta = await writeOne(`results/${fullName}`, csv);
      set({
        progress: 1,
        status: `Done, ${prettyBytes(meta.compressedSize)}`,
      });
    }),
    PARALLEL_LIMIT
  );

  await close();
};
export type Job = {
  id: string;
  label: string;
  status: string;
  progress: number | undefined;
};

function useBulkMutationProvider() {
  const [jobs, dispatch] = useState<Job[]>([]);
  const mutation = useMutation({
    mutationKey: ["bulk-download"],
    mutationFn: async (func: () => Promise<void>) => {
      await func();
    },
  });
  return {
    mutation,
    jobs,
    summary: {
      current: sumBy(jobs, "progress"),
      total: jobs.length,
    },
    setProgress: dispatch,
    add: (s: Partial<Job>) => {
      const id = nanoid();
      dispatch((p) => [
        ...p,
        { id, label: "Job", status: "Waiting", progress: 0.1, ...s },
      ]);
      return {
        id,
        remove: (d = 2000) => {
          delay(() => {
            dispatch((p) => p.filter((x) => x.id !== id));
          }, d);
        },
        set: (s: Partial<Job>) => {
          dispatch((xs) => xs.map((x) => (x.id === id ? { ...x, ...s } : x)));
        },
      };
    },
  };
}

type R1 = ReturnType<typeof useBulkMutationProvider>;
type R2 = R1["add"];
export const BulkDownloadContext = createContext<R1>(null);

export const BulkDownloadProvider = ({ children }: PropsWithChildren) => {
  const value = useBulkMutationProvider();
  return (
    <BulkDownloadContext.Provider value={value}>
      {children}
    </BulkDownloadContext.Provider>
  );
};

export function useBulkMutation() {
  return useContext(BulkDownloadContext)!;
}
