export function proportionOf<T>(xs: T[], f: (x: T) => boolean): number {
  return xs.filter(f).length / xs.length;
}
