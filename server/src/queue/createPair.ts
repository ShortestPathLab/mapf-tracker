import { Worker as BullmqWorker, Job, QueueEvents } from "bullmq";
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
    async (job: Job<D>) => {
      const log = context(`${workerName} ${id}`);
      log.info(`Dispatching job ${job.id}`);
      const out = await r(job.data);
      log.info(`Job ${job.id} returned`);
      return out;
    },
    {
      concurrency: +process.env.WORKER_CONCURRENCY_COUNT || 1,
      connection: {
        host: server.host,
        port: server.port,
      },
    }
  );
  return { server, worker };
}
