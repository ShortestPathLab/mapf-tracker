import { Worker as BullmqWorker, Job } from "bullmq";
import { context } from "logging";
import { createQueue } from "queue/createQueue";

export async function createPair<D, N extends string, O>(
  id: string,
  r: (d: D) => Promise<O>,
  queueName: string,
  workerName: string
) {
  const name = `${queueName}-${id}`;
  const server = await createQueue<D, {}, N>({
    name,
  });
  const worker = new BullmqWorker(
    name,
    async (job: Job<D>) => await r(job.data),
    {
      lockDuration: 1000 * 60 * 60, // 1 hour lock duration
      concurrency: +(process.env.WORKER_CONCURRENCY_COUNT ?? 1) || 1,
      connection: {
        host: server.host,
        port: server.port,
      },
    }
  );
  return { server, worker };
}
