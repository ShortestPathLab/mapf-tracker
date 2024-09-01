export type PipelineTaskData = {
  stage: string;
  variables: any;
};

export type PipelineTaskResult = {
  error?: any;
  variables?: any;
};
