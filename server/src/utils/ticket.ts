import { now, omitBy } from "lodash";

export type ResultTicketStatus = (
  | { status: "error"; error: any }
  | { status: "done"; result: any }
) & {
  message?: any;
};

export type TicketStatus<Meta> = (
  | ResultTicketStatus
  | { status: "pending" }
) & {
  dateReceived: number;
} & Meta;

export const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export const withTicket =
  <Meta>(pool: TicketPool<Meta>) =>
  async (ticket: string, f: () => Promise<ResultTicketStatus>, meta?: Meta) => {
    const dateReceived = now();
    pool.tickets[ticket] = { status: "pending", dateReceived, ...meta };
    try {
      const result = await f();
      pool.tickets[ticket] = { dateReceived, ...result, ...meta };
    } catch (error) {
      pool.tickets[ticket] = { status: "error", dateReceived, error, ...meta };
    } finally {
      pool.tickets = omitBy(
        pool.tickets,
        ({ status, dateReceived }) =>
          status !== "pending" && dateReceived < now() - ONE_DAY_MS
      );
    }
  };

export type TicketPool<Meta> = {
  tickets: { [K in string]: TicketStatus<Meta> };
};

export function createPool<Meta>() {
  const pool: TicketPool<Meta> = { tickets: {} };
  return {
    pool,
    withTicket: withTicket<Meta>(pool),
  };
}
