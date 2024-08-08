type WorkerConstructor = () => Worker;

type WorkerResult = { result: any } | { error: any };

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

export const usingWorkerTask =
  <T, R>(w: WorkerConstructor) =>
  (inp: T) =>
    usingWorker<R>(w)((worker) => {
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
