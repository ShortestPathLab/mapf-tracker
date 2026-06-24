import { useQueries, useQuery } from "@tanstack/react-query";
import { map } from "lodash";
import { boolean, InferType, object, string } from "yup";
import api, { unwrap } from "hooks/useQuery";

export type Request = InferType<typeof requestSchema> & { id?: string };

export const requestSchema = object({
  isOptimal: boolean().default(false),
  requesterName: string().required("Requester name is required."),
  requesterEmail: string()
    .email("Please enter a valid email address.")
    .required("Contact email is required."),
  requesterAffiliation: string().required("Affiliation is required."),
  googleScholar: string().url("Please enter a valid URL."),
  dblp: string().url("Please enter a valid URL."),
  justification: string(),
  algorithmName: string().required("Algorithm name is required."),
  authorName: string().required("Author name is required."),
  paperReference: string().required("Paper reference is required."),
  githubLink: string().url("Please enter a valid URL."),
  comments: string(),
});

const requestQuery = (key: string | number) => ({
  queryKey: ["submissionRequestDetails", key],
  queryFn: async () => ({
    ...(await unwrap(api.api.request.key({ key: `${key}` }).get())),
    key,
  }),
  enabled: !!key,
});

export const useRequestData = (key: string | number) =>
  useQuery(requestQuery(key));

export const useRequestsData = (keys: string[]) =>
  useQueries({ queries: map(keys, requestQuery) });

export const requestByEmailQueryFn = (email: string) => () =>
  unwrap(api.api.request.email({ email }).get());

export const useRequestByEmailData = (email: string) =>
  useQuery({
    queryKey: ["submissionRequestDetails", "email", email],
    queryFn: requestByEmailQueryFn(email),
    enabled: !!email,
  });
