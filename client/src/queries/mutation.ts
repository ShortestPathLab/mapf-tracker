export const request = <T = null>(
  p: string,
  body: T = undefined,
  method = "post"
) =>
  fetch(p, {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

export const post = <T = null>(p: string, t = null) => request<T>(p, t);
export const get = <T = null>(p: string) => request<T>(p, undefined, "get");
export const del = <T = null>(p: string) => request<T>(p, undefined, "delete");
