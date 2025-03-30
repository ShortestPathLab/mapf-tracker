import { useQuery } from "@tanstack/react-query";
import { find, map } from "lodash";
import {
  Map,
  CollectionWithInstanceCount,
  Instance as Instance,
  Scenario,
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

export const useMapsData = () => useQuery(mapsQuery());

export const useScenariosByMap = (id: number | string) =>
  useQuery(scenariosQuery(id));

export const useScenario = (id: number | string) => useQuery(scenarioQuery(id));

export const useInstancesByScenario = (id: number | string) =>
  useQuery({
    queryKey: ["instanceCollection", id],
    queryFn: () => json<Instance[]>(`${APIConfig.apiUrl}/instance/${id}`),
    enabled: !!id,
  });

export const useMapByName = (name: string = "") => {
  const { data } = useMapsData();
  return useQuery({
    queryKey: ["benchmarks", "name", name],
    queryFn: () => find(data, { map_name: name }) || null,
    enabled: !!data && !!name,
  });
};

export const useMapData = (id: string = "") => {
  const { data } = useMapsData();
  return useQuery({
    queryKey: ["benchmarks", id],
    queryFn: () => find(data, { id }) || null,
    enabled: !!data && !!id,
  });
};

export function mapsQuery() {
  return {
    queryKey: ["benchmarks"],
    queryFn: async () =>
      map(await json<Map[]>(`${APIConfig.apiUrl}/map`), incorporateProportions),
  };
}

export function scenariosQuery(id: string | number) {
  return {
    queryKey: ["instanceCollections", id],
    queryFn: async () =>
      map(
        await json<Scenario[]>(`${APIConfig.apiUrl}/scenario/map/${id}`),
        incorporateProportions
      ),
    enabled: !!id,
  };
}

export function scenarioQuery(id: string | number) {
  return {
    queryKey: ["scenario", id],
    queryFn: () => json<Scenario>(`${APIConfig.apiUrl}/scenario/id/${id}`),
    enabled: !!id,
  };
}
