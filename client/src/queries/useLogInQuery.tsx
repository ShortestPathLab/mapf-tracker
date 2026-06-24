import { useMutation, useQuery } from "@tanstack/react-query";
import api from "hooks/useQuery";
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
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : null;
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
      const { data, error } = await api.api.auth.login.post({
        username,
        password,
      });
      if (error) throw error;
      const { token } = data ?? {};
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
