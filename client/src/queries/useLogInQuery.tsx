import { APIConfig } from "core/config";
import { useMutation, useQuery } from "@tanstack/react-query";
import { post } from "queries/mutation";
import { queryClient } from "App";
import { LogInFormData } from "components/appbar/LogInDialog";

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};
export function useCredentials() {
  return useQuery({
    queryKey: ["credentials"],
    queryFn: () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const decodedJwt = parseJwt(user.token);
        if (decodedJwt.exp * 1000 < Date.now()) {
          localStorage.removeItem("user");
          return null;
        } else {
          return user as Credentials;
        }
      }
      return null;
    },
  });
}
export function useLogInMutation() {
  const logIn = useMutation({
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["credentials"] }),
    mutationFn: async ({ username, password }: LogInFormData) => {
      const result = await post(`${APIConfig.apiUrl}/auth/login`, {
        username,
        password,
      });
      const { token } = (await result?.json?.()) ?? {};
      if (token) {
        localStorage.setItem("user", JSON.stringify({ token, username }));
        return true;
      }
      return false;
    },
  });
  const logOut = useMutation({
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["credentials"] }),
    mutationFn: async () => {
      localStorage.removeItem("user");
      return true;
    },
  });
  return { logIn, logOut };
}
export type Credentials = {
  username: string;
  token: string;
};
