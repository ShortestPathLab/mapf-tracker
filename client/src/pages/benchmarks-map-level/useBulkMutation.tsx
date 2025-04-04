import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { BlobWriter, TextReader, ZipWriter } from "@zip.js/zip.js";
import { queryClient } from "App";
import { APIConfig } from "core/config";
import { AlgorithmDetails, Map, Scenario } from "core/types";
import download from "downloadjs";
import { json2csv } from "json-2-csv";
import { find, flatMap, kebabCase, keyBy } from "lodash";
import { nanoid } from "nanoid";
import { parallel, series } from "promise-tools";
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
const resultQuery = (id: string, solutions: boolean) => ({
  queryKey: ["bulk-results", id, solutions],
  enabled: !!id,
  queryFn: () =>
    post(`${APIConfig.apiUrl}/bulk/results`, {
      scenario: id,
      solutions,
    }).then(toJson),
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

function createZipWriter({
  chunkSize = CHUNK_SIZE_B,
  inParts = true,
  name = "export",
}: {
  chunkSize?: number;
  inParts?: boolean;
  name?: string;
}) {
  let part = 0;
  let runningSize = 0;

  let blobWriter = new BlobWriter();
  let zipWriter = new ZipWriter(blobWriter);

  const flush = async (more: boolean) => {
    const data = await zipWriter.close();
    download(data, `${name}-${part}.zip`, "application/zip");
    runningSize = 0;
    part++;
    if (more) {
      blobWriter = new BlobWriter();
      zipWriter = new ZipWriter(blobWriter);
    }
  };

  const tryFlush = async (size: number) => {
    runningSize += size;
    if (runningSize > chunkSize && inParts) {
      await flush(true);
    }
  };

  const writeOne = async (path: string, contents: string) => {
    const reader = new TextReader(contents);
    const meta = await zipWriter.add(path, reader);
    await tryFlush(meta.compressedSize);
  };

  const close = async () => {
    await flush(false);
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
  setProgress: React.Dispatch<
    React.SetStateAction<{ current: number; total: number }>
  >
) => {
  setProgress({
    current: 0,
    total: summaries.length + submissions.length,
  });

  const { writeOne, close } = createZipWriter({
    chunkSize: CHUNK_SIZE_B,
    inParts: downloadInParts,
    name: `bulk-submission-${nanoid(6)}`,
  });

  // ─── Export Summaries ────────────────────────────────────────────────

  const algorithmsDetails = await queryClient.fetchQuery(
    algorithmDetailsQuery()
  );

  const algorithmIndex = keyBy(algorithmsDetails, "id");

  const algoName1 = (a: AlgorithmDetails) =>
    `${kebabCase(a.algo_name)}-${a.id}`;

  await series(
    summaries.map((id) => async () => {
      const details = find(algorithmsDetails, { id });
      const csv = json2csv([details], { emptyFieldValue: "" });
      await writeOne(`summary/${algoName1(details)}.csv`, csv);
      setProgress((p) => ({ current: p.current + 1, total: p.total }));
    })
  );

  const s3 = await parallel(
    submissions.map((id) => async () => {
      const { algorithm, resource: scenario } = decodeAlgorithmResource(id);

      setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
      const result = await queryClient.fetchQuery(
        algorithmScenarioQuery(algorithm, scenario)
      );
      return { id, result };
    }),
    PARALLEL_LIMIT
  );

  await series(
    s3.map(({ id, result }) => async () => {
      const { algorithm, resource: scenario } = decodeAlgorithmResource(id);
      const details = algorithmIndex[algorithm];
      const scenarioDetails = scensIndex[scenario];
      const mapDetails = mapsIndex[scenarioDetails.map_id];
      const csv = json2csv(result, { emptyFieldValue: "" });

      await writeOne(
        `submission/${algoName1(details)}/${mapDetails.map_name}-${
          scenarioDetails.scen_type
        }-${scenarioDetails.type_id}.csv`,
        csv
      );
      setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
    })
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
  setProgress: React.Dispatch<
    React.SetStateAction<{ current: number; total: number }>
  >
) => {
  setProgress({
    current: 0,
    total: maps.length + scens.length + results.length,
  });

  const { writeOne, close } = createZipWriter({
    chunkSize: CHUNK_SIZE_B,
    inParts: downloadInParts,
    name: `bulk-${nanoid(6)}`,
  });

  // ─── Export Maps ─────────────────────────────────────

  const mapNames = maps.map((m) => mapsIndex[m]?.map_name);
  const mapContents = await parallel(
    mapNames.map((m) => async () => {
      const contents = await text<string>(`/assets/maps/${m}.map`);
      setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
      return {
        contents,
        name: m,
      };
    }),
    PARALLEL_LIMIT
  );

  await series(
    mapContents.map(({ name, contents }) => async () => {
      await writeOne(`maps/${name}.map`, contents);
      setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
    })
  );

  // ─── Export Scenarios ────────────────────────────────

  const scensContents = await parallel(
    scens.map((s) => async () => {
      const { scen_type, type_id, map_id } = scensIndex[s];
      const mapName = mapsIndex[map_id]?.map_name;
      const contents = await text(
        `./assets/scens/${mapName}-${scen_type}-${type_id}.scen`
      );
      setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
      return {
        contents,
        mapName,
        scen_type,
        type_id,
      };
    }),
    PARALLEL_LIMIT
  );

  await series(
    scensContents.map(
      ({ contents, mapName, scen_type, type_id }) =>
        async () => {
          await writeOne(
            `scenarios/${mapName}-${scen_type}-${type_id}.scen`,
            contents
          );
          setProgress((p) => ({
            current: p.current + 0.5,
            total: p.total,
          }));
        }
    )
  );

  // ─── Export Results ──────────────────────────────────

  const resultsData = await parallel(
    results.map((r) => async () => {
      const results = await queryClient.fetchQuery(
        resultQuery(r, includeSolutions)
      );
      setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
      return {
        results,
        name: r,
      };
    }),
    PARALLEL_LIMIT
  );

  await series(
    resultsData.map(({ results, name }) => async () => {
      const csv = json2csv(results, { emptyFieldValue: "" });
      const scen = scensIndex[name];
      const map = mapsIndex[scen.map_id];
      await writeOne(
        `results/${map.map_name}-${scen.scen_type}-${scen.type_id}.csv`,
        csv
      );
      setProgress((p) => ({ current: p.current + 0.5, total: p.total }));
    })
  );

  await close();
};

function useBulkMutationProvider() {
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const mutation = useMutation({
    mutationKey: ["bulk-download"],
    mutationFn: async (func: () => Promise<void>) => {
      await func();
    },
  });
  return { mutation, progress, setProgress };
}

export const BulkDownloadContext = createContext<{
  mutation: UseMutationResult<void, unknown, () => Promise<void>>;
  progress: { current: number; total: number };
  setProgress: React.Dispatch<
    React.SetStateAction<{ current: number; total: number }>
  >;
} | null>(null);

export const BulkDownloadProvider = ({ children }: PropsWithChildren) => {
  const { mutation, progress, setProgress } = useBulkMutationProvider();
  return (
    <BulkDownloadContext.Provider value={{ mutation, progress, setProgress }}>
      {children}
    </BulkDownloadContext.Provider>
  );
};

export function useBulkMutation() {
  return useContext(BulkDownloadContext)!;
}
