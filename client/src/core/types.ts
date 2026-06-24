import api, { DataOf } from "hooks/useQuery";

export type CollectionWithInstanceCount = {
  instances: number;
  instances_closed: number;
  instances_solved: number;
  id: string;
};

export type CollectionWithProportions = {
  proportion_instances_closed: number;
  proportion_instances_solved: number;
};

export type Map = {
  map_size: string;
  map_type: string;
  map_name: string;
  // scen_type/type_id are scenario fields; the /api/map endpoint does not
  // return them, so they are optional on a map record.
  scen_type?: string;
  type_id?: number;
  scens: number;
  original_link?: string;
  papers?: string;
} & CollectionWithInstanceCount &
  CollectionWithProportions;

export type Scenario = {
  type_id: number;
  scen_type: string;
  map_id: string;
} & CollectionWithInstanceCount;

// A single instance document (`/api/instance/id/:id`), inferred from the server.
export type Instance = DataOf<
  ReturnType<typeof api.api.instance.id>["get"]
>;

// A per-agent-count instance summary for a scenario (`/api/instance/:id`).
export type InstanceSummary = DataOf<
  ReturnType<typeof api.api.instance>["get"]
>[number];

export type Algorithm = DataOf<typeof api.api.algorithm.get>[number];

export type AlgorithmDetails = DataOf<
  typeof api.api.algorithm.all_detail.get
>[number];

export type SummarySlice = {
  outdated: number;
  valid: number;
  invalid: number;
  queued: number;
  tie: number;
  dominated: number;
  best: number;
  lb_tie: number;
  lb_dominated: number;
  lb_best: number;
  total: number;
};

export type SummaryResult = {
  maps: {
    name: string;
    id: string;
    count: SummarySlice;
    scenarios: {
      type: string;
      typeId: number;
      id: string;
      count: SummarySlice;
    }[];
  }[];
};
