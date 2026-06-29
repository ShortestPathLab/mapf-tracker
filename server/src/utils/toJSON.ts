import { Document, Types } from "mongoose";

export type Identity<T> = T extends object
  ? {} & {
      [P in keyof T]: T[P];
    }
  : T;
/**
 * Maps a raw Mongoose document type to its JSON wire shape: `ObjectId` and
 * `Date` fields (which Elysia serialises to strings on the wire) become
 * `string`, recursively through arrays and nested objects. This is the single
 * place that controls the client-inferred type of `toJSON`'d responses, so the
 * Eden client infers what actually arrives over HTTP.
 */
export type Serialized<T> = T extends Types.ObjectId
  ? string
  : T extends Date
    ? string
    : T extends (infer U)[]
      ? Serialized<U>[]
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

type Hydrated<D> = Document<unknown, {}, D> & D;

/** Mongoose `Document` instance members (methods/internals like `$assertPopulated`). */
type DocumentKeys = keyof Document<unknown, {}, unknown> | "__v";

/**
 * The plain data shape of a document — schema fields only. Strips the Mongoose
 * `Document` instance members (and `_id`, re-added below as a string) so a
 * hydrated doc type collapses to its serialised wire fields rather than leaking
 * `$clone`/`$assertPopulated`/etc. into the inferred client type.
 */
type Plain<D> = Omit<D, DocumentKeys>;

export function toJSON<D>(r: Hydrated<D> | null | undefined) {
  if (!r) return null;
  const doc = r.toJSON() as D & { _id?: unknown };
  return {
    // Add `id` alias that makes a lot of things easier.
    id: String("_id" in doc ? doc._id : undefined),
    ...doc,
  } as Identity<{ id: string; _id: string } & Serialized<Plain<D>>>;
}

export function allToJSON<D>(r: Hydrated<D>[] | null | undefined) {
  if (!r) return null;
  return r.map((a) => toJSON(a)!);
}
