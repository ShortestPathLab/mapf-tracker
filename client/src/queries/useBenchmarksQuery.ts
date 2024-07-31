import { useQuery } from "@tanstack/react-query";
import { find, map } from "lodash";
import {
  Benchmark,
  CollectionWithInstances,
  Scenario,
  ScenarioCollection,
} from "core/types";
import { APIConfig } from "core/config";
import { json } from "./query";

const incorporateProportions = <T extends CollectionWithInstances>(
  item: T
) => ({
  ...item,
  solved_percentage: item.instances_solved / item.instances,
  closed_percentage: item.instances_closed / item.instances,
});

export const useBenchmarksData = () =>
  useQuery({
    queryKey: ["benchmarks"],
    queryFn: async () =>
      map(
        await json<Benchmark[]>(`${APIConfig.apiUrl}/map`),
        incorporateProportions
      ),
  });

export const useScenarioCollectionsData = (id: number | string) =>
  useQuery({
    queryKey: ["scenarioCollections", id],
    queryFn: async () =>
      map(
        await json<ScenarioCollection[]>(
          `${APIConfig.apiUrl}/scenario/map/${id}`
        ),
        incorporateProportions
      ),
    enabled: !!id,
  });
export const useScenarioCollectionData = (id: number | string) =>
  useQuery({
    queryKey: ["scenarioCollection", id],
    queryFn: () => json<Scenario[]>(`${APIConfig.apiUrl}/instance/${id}`),
    enabled: !!id,
  });

export const useBenchmarkData = (id: string = "") => {
  const { data } = useBenchmarksData();
  return useQuery({
    queryKey: ["benchmarks", id],
    queryFn: () => find(data, { map_name: id }) || null,
    enabled: !!data,
  });
};
