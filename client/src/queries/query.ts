import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "./mutation";
import { queryClient } from "App";

export const toJson = (r: Response) => r.json();
export const toBlob = (r: Response) => r.blob();
export const toText = (r: Response) => r.text();

export const json = <T>(p: string) =>
  request(p, undefined, "get").then(toJson) as Promise<T>;
export const text = <T = string>(p: string) =>
  request(p, undefined, "get").then(toText) as Promise<T>;
export const blob = <T>(p: string) =>
  request(p, undefined, "get").then(toBlob) as Promise<T>;

export const basic = <T>(p: string) => ({
  all: () => json<T[]>(p),
  one: (id: string) => json<T>(`${p}/${id}`),
  write: (item: T) => request(`${p}/write`, item).then(toJson),
  delete: (id: string) => request(`${p}/delete`, { id }).then(toJson),
});

export function useBasic<T>(p: string) {
  const b = basic<T>(p);
  function useAll() {
    "use no memo";
    return useQuery({
      queryKey: ["all", p],
      queryFn: b.all,
    });
  }
  function useOne(id: string) {
    "use no memo";
    return useQuery({
      queryKey: ["one", p, id],
      queryFn: () => b.one(id),
    });
  }
  const invalidate = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["all", p] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: ["one", p, id] });
    }
  };
  function useWrite() {
    "use no memo";
    return useMutation({
      mutationFn: (item: T & { id?: string }) => b.write(item),
      onSuccess: (_, item) => invalidate(item.id),
    });
  }
  function useDelete() {
    "use no memo";
    return useMutation({
      mutationFn: (id: string) => b.delete(id),
      onSuccess: () => invalidate(),
    });
  }
  return {
    useAll,
    useOne,
    useWrite,
    useDelete,
  };
}
