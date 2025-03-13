import { request } from "./mutation";

export const toJson = (r: Response) => r.json();
export const toBlob = (r: Response) => r.blob();
export const toText = (r: Response) => r.text();

export const json = <T>(p: string) =>
  request(p, undefined, "get").then(toJson) as Promise<T>;
export const text = <T = string>(p: string) =>
  request(p, undefined, "get").then(toText) as Promise<T>;
export const blob = <T>(p: string) =>
  request(p, undefined, "get").then(toBlob) as Promise<T>;
