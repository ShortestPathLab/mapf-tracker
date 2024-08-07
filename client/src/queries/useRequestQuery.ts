import { useQueries, useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { map } from "lodash";
import { InferType, object, string } from "yup";
import { json } from "./query";

export type Request = InferType<typeof requestSchema>;

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

const requestQuery = (id: string) => ({
  queryKey: ["benchmarks", id],
  queryFn: () => json<Request>(`${APIConfig.apiUrl}/request/id/${id}`),
  enabled: !!id,
});

export const useRequestData = (id: string) => useQuery(requestQuery(id));

export const useRequestsData = (ids: string[]) =>
  useQueries({ queries: map(ids, requestQuery) });
