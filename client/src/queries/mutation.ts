export const getAuth = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const parsed = JSON.parse(user);
    if ("token" in parsed) {
      return { Authorization: `Bearer ${parsed.token}` };
    }
  }
};

export const request = <T = null>(
  p: string,
  body: T = undefined,
  method = "post",
  type = "application/json"
) =>
  fetch(p, {
    method,
    body: type === "application/json" ? JSON.stringify(body) : `${body}`,
    headers: { "Content-Type": type, ...getAuth() },
  });

export const post = <T = null>(p: string, t = null) => request<T>(p, t);
export const get = <T = null>(p: string) => request<T>(p, undefined, "get");
export const del = <T = null>(p: string) => request<T>(p, undefined, "delete");
