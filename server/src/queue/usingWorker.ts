import { once } from "lodash";

type WorkerConstructor = () => Worker;

type WorkerResult = { result: any } | { error: any };

export const usingWorkerReusable = <R>(w: WorkerConstructor) => {
  const getWorker = once(w);
  return async (task: (w: Worker) => Promise<R>) => {
    const worker = getWorker();
    const out = (await task(worker)) as WorkerResult;
    if ("error" in out) {
      console.error(out.error);
      throw new Error(out.error);
    }
    return out.result as R;
  };
};

export const usingWorker =
  <R>(w: WorkerConstructor) =>
  async (task: (w: Worker) => Promise<R>) => {
    const worker = w();
    const out = (await task(worker)) as WorkerResult;
    if ("error" in out) {
      console.error(out.error);
      throw new Error(out.error);
    }
    worker.terminate();
    return out.result as R;
  };

const a =
  (u = usingWorker) =>
  <T, R>(w: WorkerConstructor) =>
  (inp: T) =>
    u<R>(w)((worker) => {
      worker.postMessage(inp);
      return new Promise<R>((res, rej) => {
        worker.onmessage = (out) => {
          res(out.data as R);
        };
        worker.onerror = (e) => {
          console.error(e);
          rej(e);
        };
      });
    });

export const usingWorkerTask = a(usingWorker);

export const usingWorkerTaskReusable = a(usingWorkerReusable);

export const usingMessageHandler =
  <T, U>(f: (a: MessageEvent<T>) => Promise<U>) =>
  async (m: MessageEvent<T>) => {
    try {
      const output = await f(m);
      postMessage({ result: output });
    } catch (e) {
      postMessage({ error: e });
    }
  };
