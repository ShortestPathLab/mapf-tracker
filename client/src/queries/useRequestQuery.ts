import { APIConfig } from "core/config";
import { json } from "./query";
import { useQueries, useQuery } from "@tanstack/react-query";
import * as Yup from "yup";
import { map } from "lodash";
export type Request = Yup.InferType<typeof requestSchema>;

export const requestSchema = Yup.object({
  requesterName: Yup.string().required("Requester name is required."),
  requesterEmail: Yup.string()
    .email("Please enter a valid email address.")
    .required("Contact email is required."),
  requesterAffilation: Yup.string().required("Affiliation is required."),
  googleScholar: Yup.string()
    .url("Please enter a valid URL.")
    .required("Google Scholar profile URL is required."),
  dblp: Yup.string().required("DBLP profile URL is required."),
  justification: Yup.string().required("Justification is required."),
  algorithmName: Yup.string().required("Algorithm name is required."),
  authorName: Yup.string().required("Author name is required."),
  paperReference: Yup.string().required("Paper reference is required."),
  githubLink: Yup.string()
    .url("Please enter a valid URL.")
    .required("GitHub link is required."),
  comments: Yup.string(),
});

const requestQuery = (id: string) => ({
  queryKey: ["benchmarks", id],
  queryFn: () => json<Request>(`${APIConfig.apiUrl}/request/id/${id}`),
  enabled: !!id,
});

export const useRequestData = (id: string) => useQuery(requestQuery(id));

export const useRequestsData = (ids: string[]) =>
  useQueries({ queries: map(ids, requestQuery) });
