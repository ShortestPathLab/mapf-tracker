import { useQuery } from "@tanstack/react-query";
import { find, map } from "lodash";
import {
  Benchmark,
  CollectionWithInstanceCount,
  Instance as Instance,
  InstanceCollection,
} from "core/types";
import { APIConfig } from "core/config";
import { json } from "./query";

const incorporateProportions = <T extends CollectionWithInstanceCount>(
  item: T
) => ({
  ...item,
  solved_percentage: item.instances_solved / item.instances,
  closed_percentage: item.instances_closed / item.instances,
});

export const useBenchmarksData = () => useQuery(benchmarksQuery());

export const useInstanceScenarioData = (id: number | string) =>
  useQuery(instanceScenarioQuery(id));

export const useScenarioDetailsData = (id: number | string) =>
  useQuery(scenarioDetailsQuery(id));

export const useInstanceCollectionData = (id: number | string) =>
  useQuery({
    queryKey: ["instanceCollection", id],
    queryFn: () => json<Instance[]>(`${APIConfig.apiUrl}/instance/${id}`),
    enabled: !!id,
  });

export const useMapDataByName = (name: string = "") => {
  const { data } = useBenchmarksData();
  return useQuery({
    queryKey: ["benchmarks", "name", name],
    queryFn: () => find(data, { map_name: name }) || null,
    enabled: !!data && !!name,
  });
};

export const useMapData = (id: string = "") => {
  const { data } = useBenchmarksData();
  return useQuery({
    queryKey: ["benchmarks", id],
    queryFn: () => find(data, { id }) || null,
    enabled: !!data && !!id,
  });
};

export function benchmarksQuery() {
  return {
    queryKey: ["benchmarks"],
    queryFn: async () =>
      map(
        await json<Benchmark[]>(`${APIConfig.apiUrl}/map`),
        incorporateProportions
      ),
  };
}

export function instanceScenarioQuery(id: string | number) {
  return {
    queryKey: ["instanceCollections", id],
    queryFn: async () =>
      map(
        await json<InstanceCollection[]>(
          `${APIConfig.apiUrl}/scenario/map/${id}`
        ),
        incorporateProportions
      ),
    enabled: !!id,
  };
}

export function scenarioDetailsQuery(id: string | number) {
  return {
    queryKey: ["scenario", id],
    queryFn: () =>
      json<InstanceCollection>(`${APIConfig.apiUrl}/scenario/id/${id}`),
    enabled: !!id,
  };
}
