import { RedisMemoryServer } from "redis-memory-server";
import {
  Queue as BullMqQueue,
  QueueOptions as BullMqQueueOptions,
  QueueEvents,
} from "bullmq";
import { RedisMemoryServerOptsT } from "redis-memory-server/lib/RedisMemoryServer";
import { log } from "logging";

type QueueOptions = {
  name: string;
  server?: RedisMemoryServerOptsT;
  queue?: BullMqQueueOptions;
};

class Queue<
  DataType = any,
  ResultType = any,
  NameType extends string = string
> {
  server: RedisMemoryServer;
  queue: BullMqQueue<DataType, ResultType, NameType>;
  host: string;
  port: number;
  events: QueueEvents;
  constructor(private options: QueueOptions) {}
  async setup() {
    this.server = new RedisMemoryServer(this.options.server);
    this.host = await this.server.getHost();
    this.port = await this.server.getPort();
    log.info(
      `Queue '${this.options.name}' started at ${this.host}:${this.port}`
    );
    const options = {
      ...this.options?.queue,
      connection: { host: this.host, port: this.port },
    };
    this.queue = new BullMqQueue(this.options.name, options);
    this.events = new QueueEvents(this.options.name, options);
    this.queue.on("error", log.error);
  }
  async close() {
    if (!this.server) return;
    await this.queue.close();
    await this.server.stop();
    log.info(`Queue '${this.options.name}' closed`);
  }
}

export const createQueue = async <
  DataType = any,
  ResultType = any,
  NameType extends string = string
>(
  options: QueueOptions
) => {
  const queue = new Queue<DataType, ResultType, NameType>(options);
  await queue.setup();
  return queue;
};
