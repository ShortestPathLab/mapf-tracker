export function proportionOf<T>(xs: T[], f: (x: T) => boolean): number {
  console.log(xs)
  return xs.length ? xs.filter(f).length / xs.length : 0;
}
