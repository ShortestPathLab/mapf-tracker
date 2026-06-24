import { useQuery } from "@tanstack/react-query";
import { find, map } from "lodash";
import { CollectionWithInstanceCount } from "core/types";
import api, { unwrap } from "hooks/useQuery";

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
    queryFn: () => unwrap(api.api.instance({ id: `${id}` }).get()),
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
    queryFn: async () => {
      const { data, error } = await api.api.map.get();
      if (error) throw error;
      return map(data ?? [], incorporateProportions);
    },
  };
}

export function scenariosQuery(id: string | number) {
  return {
    queryKey: ["instanceCollections", id],
    queryFn: async () => {
      const { data, error } = await api.api.scenario.map({ id: `${id}` }).get();
      if (error) throw error;
      return map(data ?? [], incorporateProportions);
    },
    enabled: !!id,
  };
}

export function scenarioQuery(id: string | number) {
  return {
    queryKey: ["scenario", id],
    queryFn: async () => {
      const { data, error } = await api.api.scenario.id({ id: `${id}` }).get();
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!id,
  };
}
