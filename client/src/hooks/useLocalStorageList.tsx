import { useEffect } from "react";
import { useList, useLocalStorage } from "react-use";

export function useLocalStorageList<T>(name: string, initialValue: T[] = []) {
  const [data, setData] = useLocalStorage<T[]>(name, initialValue);
  const [list, actions] = useList<T>(data);

  useEffect(() => void setData(list), [list]);

  return [list, actions] as const;
}
