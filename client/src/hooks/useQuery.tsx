import { APIConfig } from "core/config";
import { getAuth } from "queries/mutation";
import type { App } from "../../../server/src/createElysiaApp";
import { type Treaty, treaty } from "@elysiajs/eden";
import {
  type QueryKey,
  type UseQueryOptions,
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
    queryFn: async () => {
      const response = await treatyFn();

      if (response.error) {
        throw response.error;
      }

      if (response.data !== undefined) {
        return response.data as Treaty.Data<Treaty.TreatyResponse<T>>;
      }

      throw new Error("No data returned from API");
    },
    ...options,
  });
}

export default api;
