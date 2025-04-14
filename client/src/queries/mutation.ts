export const getAuth = () => {
  try {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      if ("token" in parsed) {
        return { Authorization: `Bearer ${parsed.token}` };
      }
    }
  } catch {
    return;
  }
};

export const request = async <T = null>(
  p: string,
  body: T = undefined,
  method = "post",
  type = "application/json"
) => {
  const req = await fetch(p, {
    method,
    body: type === "application/json" ? JSON.stringify(body) : `${body}`,
    headers: { "Content-Type": type, ...getAuth() },
  });
  if (req.ok) {
    return req;
  } else {
    const error = await req.json();
    throw error ?? new Error(req.statusText);
  }
};

export const post = <T = null>(p: string, t = null) => request<T>(p, t);
export const get = <T = null>(p: string) => request<T>(p, undefined, "get");
export const del = <T = null>(p: string) => request<T>(p, undefined, "delete");
