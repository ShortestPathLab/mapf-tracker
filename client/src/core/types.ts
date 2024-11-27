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

export type Benchmark = {
  map_size: string;
  map_type: string;
  map_name: string;
  scen_type: string;
  type_id: number;
  scens: number;
  original_link?: string;
  papers?: string;
} & CollectionWithInstanceCount &
  CollectionWithProportions;

export type InstanceCollection = {
  type_id: number;
  scen_type: string;
  map_id: string;
} & CollectionWithInstanceCount;

export type Instance = {
  agents: number;
  id: string;
  map_id: string;
  scen_id: string;
  lower_algos: number;
  lower_cost: number;
  lower_date: string;
  solution_algos: number;
  solution_cost: number;
  solution_date: number;
  solution_path_id: string;
};

export type AlgorithmCollection = {
  algo_name: string;
};

export type AlgorithmCollectionCount = AlgorithmCollection & {
  count: number;
  total: number;
};

export type AlgorithmCollectionAggregate = AlgorithmCollection & {
  count: number;
  sum_value: number;
  total_ins: number;
};

export type SummaryByApiKeyResult = {
  maps: {
    name: string;
    id: string;
    count: {
      outdated: number;
      valid: number;
      invalid: number;
      queued: number;
      total: number;
    };
    scenarios: {
      type: string;
      typeId: number;
      id: string;
      count: {
        outdated: number;
        valid: number;
        invalid: number;
        queued: number;
        total: number;
      };
    }[];
  }[];
};
