import { map } from "lodash";

export async function waitMap<T, U>(
  t: Iterable<T>,
  f: (t: T, i: number) => Promise<U>
) {
  const out: U[] = [];
  let i = 0;
  for (const item of t) {
    out.push(await f(item, i));
    i++;
  }
  return out;
}

export async function asyncMap<T, U>(
  t: Iterable<T>,
  f: (t: T, i: number) => Promise<U>
) {
  return await Promise.all([...t].map(f));
}
