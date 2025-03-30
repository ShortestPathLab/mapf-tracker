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
  scen_type: string;
  type_id: number;
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

export type Algorithm = {
  _id: string;
  algo_name: string;
};

export type AlgorithmDetails = Algorithm &
  CollectionWithInstanceCount & {
    comments: string;
    authors: string;
    best_lower: number;
    best_solution: number;
    github?: string;
    instances_closed: number;
    instances_solved: number;
    papers?: string;
    request_id: string;
  };

export type AlgorithmCollectionCount = Algorithm & {
  count: number;
  total: number;
};

export type AlgorithmCollectionAggregate = Algorithm & {
  count: number;
  sum_value: number;
  total_ins: number;
};

export type SummarySlice = {
  outdated: number;
  valid: number;
  invalid: number;
  queued: number;
  tie: number;
  dominated: number;
  best: number;
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
