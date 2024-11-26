import { Elysia } from "elysia";

export const createServer = (database: any) => new Elysia();

export type treaty = ReturnType<typeof createServer>;
