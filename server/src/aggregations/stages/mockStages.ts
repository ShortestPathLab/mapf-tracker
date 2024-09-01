import { PipelineStage } from "../pipeline";

const wait = (n: number) => new Promise((resolve) => setTimeout(resolve, n));

export const mockStageB: PipelineStage = {
  dependents: [],
  run: async () => {
    await wait(5000);
    return { result: "ok" };
  },
  key: "mockStageB",
};
export const mockStageCExpectError: PipelineStage = {
  dependents: [],
  run: async () => {
    await wait(1000);
    throw new Error("mock error");
  },
  key: "mockStageCExpectError",
};

export const mockStageA: PipelineStage = {
  dependents: [mockStageB, mockStageCExpectError],
  run: async () => {
    await wait(5000);
    return { result: "ok" };
  },
  key: "mockStageA",
};
