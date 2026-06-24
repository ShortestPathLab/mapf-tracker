import { APIConfig } from "core/config";
import { getAuth } from "queries/mutation";
import type { App } from "../../../server/src/createElysiaApp";
import { type Treaty, treaty } from "@elysiajs/eden";
import {
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation as useTanstackMutation,
  useQuery as useTanstackQuery,
} from "@tanstack/react-query";

const apiUrl = APIConfig.apiUrl.replace(/\/api\/?$/, "");

export const api = treaty<App>(apiUrl, {
  headers: () => getAuth(),
});

export function useQuery<
  T extends Record<number, unknown> = Record<number, unknown>
>(
  queryKey: QueryKey,
  treatyFn: () => Promise<Treaty.TreatyResponse<T>>,
  options?: Omit<
    UseQueryOptions<
      Treaty.Data<Treaty.TreatyResponse<T>>,
      Treaty.Error<Treaty.TreatyResponse<T>>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useTanstackQuery<
    Treaty.Data<Treaty.TreatyResponse<T>>,
    Treaty.Error<Treaty.TreatyResponse<T>>
  >({
    queryKey,
    queryFn: () => unwrap(treatyFn()),
    ...options,
  });
}

/**
 * Eden-oriented `useMutation`, the mutation counterpart to `useQuery` above.
 * Pass a treaty call (e.g. `(id) => api.api.request.basic.delete.post({ id })`);
 * the response is unwrapped (throwing on error) so `data`/`onSuccess` receive
 * the typed value inferred end-to-end from the server route.
 */
export function useMutation<
  T extends Record<number, unknown> = Record<number, unknown>,
  V = void
>(
  treatyFn: (variables: V) => Promise<Treaty.TreatyResponse<T>>,
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<Treaty.TreatyResponse<T>>,
      Treaty.Error<Treaty.TreatyResponse<T>>,
      V
    >,
    "mutationFn"
  >
) {
  return useTanstackMutation<
    Treaty.Data<Treaty.TreatyResponse<T>>,
    Treaty.Error<Treaty.TreatyResponse<T>>,
    V
  >({
    mutationFn: (variables: V) => unwrap(treatyFn(variables)),
    ...options,
  });
}

/** The element/data type a treaty `get`/`post` route resolves to (sans null). */
export type DataOf<
  F extends (...args: never[]) => Promise<{ data: unknown }>
> = NonNullable<Awaited<ReturnType<F>>["data"]>;

/**
 * Unwraps an Eden treaty response into its data, throwing on error. Use in any
 * `queryFn`/`mutationFn`/imperative call site where the typed value is needed
 * directly (the type is inferred end-to-end from the server route).
 */
export async function unwrap<T extends Record<number, unknown>>(
  response: Treaty.TreatyResponse<T> | Promise<Treaty.TreatyResponse<T>>
): Promise<Treaty.Data<Treaty.TreatyResponse<T>>> {
  const { data, error } = await response;
  if (error) {
    throw error;
  }
  if (data === undefined) {
    throw new Error("No data returned from API");
  }
  return data as Treaty.Data<Treaty.TreatyResponse<T>>;
}

/**
 * TODO(eden): interim bridge for server routes that are NOT yet typed — their
 * handlers return `any`/raw Mongoose documents, so Eden infers `unknown`/`{}`/
 * `Document<...>` instead of a clean wire shape. This unwraps the response and
 * asserts the expected client shape `T`.
 *
 * Each `untyped<T>(...)` call site marks a route to revisit: once the server
 * route returns a typed response (see `MapRecord` in `routes/map.ts` for the
 * pattern), replace `untyped<T>(...)` with `unwrap(...)` and delete the local
 * `T` so the type is inferred end-to-end. Grep `untyped<` for the remaining
 * routes that still need server-side typing.
 */
export async function untyped<T>(
  response:
    | { data: unknown; error: unknown }
    | Promise<{ data: unknown; error: unknown }>
): Promise<T> {
  const { data, error } = await response;
  if (error) {
    throw error;
  }
  return data as T;
}

export default api;
