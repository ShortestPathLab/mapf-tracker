import { now, omitBy } from "lodash";

export type ResultTicketStatus =
  | { status: "error"; error: any }
  | { status: "done"; result: any };

export type TicketStatus = (ResultTicketStatus | { status: "pending" }) & {
  dateReceived: number;
};

export const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export const withTicket =
  (pool: TicketPool) =>
  async (ticket: string, f: () => Promise<ResultTicketStatus>) => {
    const dateReceived = now();
    pool.tickets[ticket] = { status: "pending", dateReceived };
    try {
      const result = await f();
      pool.tickets[ticket] = { dateReceived, ...result };
    } catch (error) {
      pool.tickets[ticket] = { status: "error", dateReceived, error };
    } finally {
      pool.tickets = omitBy(
        pool.tickets,
        ({ status, dateReceived }) =>
          status !== "pending" && dateReceived < now() - ONE_DAY_MS
      );
    }
  };

export type TicketPool = { tickets: { [K in string]: TicketStatus } };
