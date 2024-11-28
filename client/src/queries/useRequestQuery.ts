import { useQueries, useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { map } from "lodash";
import { InferType, object, string } from "yup";
import { json } from "./query";

export type Request = InferType<typeof requestSchema> & { id?: string };

export const requestSchema = object({
  requesterName: string().required("Requester name is required."),
  requesterEmail: string()
    .email("Please enter a valid email address.")
    .required("Contact email is required."),
  requesterAffilation: string().required("Affiliation is required."),
  googleScholar: string()
    .url("Please enter a valid URL.")
    .required("Google Scholar profile URL is required."),
  dblp: string().required("DBLP profile URL is required."),
  justification: string().required("Justification is required."),
  algorithmName: string().required("Algorithm name is required."),
  authorName: string().required("Author name is required."),
  paperReference: string().required("Paper reference is required."),
  githubLink: string()
    .url("Please enter a valid URL.")
    .required("GitHub link is required."),
  comments: string(),
});

const requestQuery = (key: string | number) => ({
  queryKey: ["submissionRequestDetails", key],
  queryFn: async () => ({
    ...(await json<Request>(`${APIConfig.apiUrl}/request/key/${key}`)),
    key,
  }),
  enabled: !!key,
});

export const useRequestData = (key: string | number) =>
  useQuery(requestQuery(key));

export const useRequestsData = (keys: string[]) =>
  useQueries({ queries: map(keys, requestQuery) });
