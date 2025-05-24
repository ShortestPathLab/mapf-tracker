import { useEffect, useRef, useState } from "react";
import { useQueryClient, useQuery, QueryKey } from "@tanstack/react-query";

type UseRoundRobinQueriesResult<TCombined> = {
  data: TCombined | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  isFirstRun: boolean;
};

const INTERVAL_LOOP_MS = 2000;
const INTERVAL_SLOW_MS = 1000;

const roundRobinControllers: Record<
  string,
  { stop: () => void; refCount: number }
> = {};

export function useRoundRobinQueries<TChunkResult, TCombined>(
  key: string,
  createQuery: (i: number) => {
    queryKey: QueryKey;
    queryFn: () => Promise<TChunkResult>;
  },
  getLength: (result: TChunkResult) => number,
  combine: (chunks: TChunkResult[]) => TCombined
): UseRoundRobinQueriesResult<TCombined> {
  const queryClient = useQueryClient();
  const chunksRef = useRef<TChunkResult[]>([]);
  const mountedRef = useRef(true);
  const isFirstRunRef = useRef(true);
  const [isFirstRun, setIsFirstRun] = useState(true);

  const fullKey = ["round-robin", key];

  const fetchChunks = async () => {
    let i = 0;
    const chunks: TChunkResult[] = [];

    while (mountedRef.current) {
      const { queryKey, queryFn } = createQuery(i);

      try {
        const data = await queryClient.fetchQuery({
          queryKey,
          queryFn,
          staleTime: 1000,
        });

        if (getLength(data) === 0) break;

        chunks[i] = data;
        chunksRef.current = [...chunks]; // update ref
        queryClient.setQueryData(fullKey, combine(chunks));

        i++;

        if (!isFirstRunRef.current) {
          await new Promise((r) => setTimeout(r, INTERVAL_SLOW_MS));
        }
      } catch {
        break;
      }
    }

    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      setIsFirstRun(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    if (!roundRobinControllers[key]) {
      let stopped = false;

      const loop = async () => {
        while (!stopped && mountedRef.current) {
          await fetchChunks();
          await new Promise((r) => setTimeout(r, INTERVAL_LOOP_MS));
        }
      };

      loop();

      roundRobinControllers[key] = {
        stop: () => {
          stopped = true;
        },
        refCount: 1,
      };
    } else {
      roundRobinControllers[key].refCount++;
    }

    return () => {
      mountedRef.current = false;
      const controller = roundRobinControllers[key];
      if (controller) {
        controller.refCount--;
        if (controller.refCount === 0) {
          controller.stop();
          delete roundRobinControllers[key];
        }
      }
    };
  }, [key]);

  const { data, isLoading, isFetching, isError, error } = useQuery<TCombined>({
    queryKey: fullKey,
    queryFn: async () => combine(chunksRef.current),
    staleTime: Infinity,
    enabled: false,
  });

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    isFirstRun,
  };
}
