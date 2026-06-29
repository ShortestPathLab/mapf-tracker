import api, { DataOf } from "hooks/useQuery";

export type CollectionWithInstanceCount = {
  instances?: number | null;
  instances_closed?: number | null;
  instances_solved?: number | null;
  id?: string | null;
};

// Derived from the server route (like Instance/Algorithm below) so the wire
// type is the single source of truth. `id`/`_id` are non-null strings (added by
// the toJSON helper); numeric/proportion fields are optional per the schema.
export type Map = DataOf<typeof api.api.map.get>[number];

export type Scenario = DataOf<ReturnType<typeof api.api.scenario.id>["get"]>;

// A single instance document (`/api/instance/id/:id`), inferred from the server.
export type Instance = DataOf<ReturnType<typeof api.api.instance.id>["get"]>;

// A per-agent-count instance summary for a scenario (`/api/instance/:id`).
export type InstanceSummary = DataOf<ReturnType<typeof api.api.instance>["get"]>[number];

export type Algorithm = DataOf<typeof api.api.algorithm.get>[number];

export type AlgorithmDetails = DataOf<typeof api.api.algorithm.allDetail.get>[number];

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
