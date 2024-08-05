import { createFilterOptions, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Autocomplete, Field } from "components/Field";
import { Form, Formik, FormikConfig, FormikProps } from "formik";
import { chain, noop } from "lodash";
import { json } from "queries/query";
import { Request, requestSchema } from "queries/useRequestQuery";
import { ReactNode } from "react";
import { paper } from "theme";

const defaultRequest: Request = {
  requesterName: "",
  requesterEmail: "",
  requesterAffilation: "",
  googleScholar: "",
  dblp: "",
  justification: "",
  algorithmName: "",
  authorName: "",
  paperReference: "",
  githubLink: "",
  comments: "",
};

const filterOptions = createFilterOptions({
  limit: 5,
  ignoreCase: true,
  matchFrom: "any",
  ignoreAccents: true,
});

const DISABLED_OPTION = "Keep typing to see suggestions";

const WORLD_UNIVERSITIES_API =
  "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";

export function SubmissionKeyRequestForm({
  submit = () => <></>,
  ...props
}: Partial<FormikConfig<Request>> & {
  submit?: (state: FormikProps<Request>) => ReactNode;
}) {
  const { data: options = [] } = useQuery({
    queryKey: ["universities"],
    queryFn: async () =>
      chain(await json<{ name: string }[]>(WORLD_UNIVERSITIES_API))
        .map("name")
        .uniq()
        .value(),
  });
  const renderLabel = (label: ReactNode) => (
    <Typography variant="h6" sx={{ fontSize: "1em", pt: 2 }}>
      {label}
    </Typography>
  );

  const renderRow = (...row: ReactNode[]) => (
    <Stack direction="row" gap={2} sx={{ gap: 2, "> *": { flex: 1 } }}>
      {row}
    </Stack>
  );

  return (
    <Formik<Request>
      validationSchema={requestSchema}
      onSubmit={noop}
      initialValues={defaultRequest}
      {...props}
    >
      {(state) => (
        <Form>
          <Stack gap={2}>
            {renderLabel("About you")}
            {renderRow(
              <Field<Request>
                name="requesterName"
                label="Name"
                placeholder="John Doe"
                required
              />,
              <Field<Request>
                name="requesterEmail"
                type="email"
                label="Contact email"
                placeholder="john.doe@example.com"
                required
              />
            )}
            <Field<Request, typeof Autocomplete>
              freeSolo
              as={Autocomplete}
              autoCompleteProps={{
                freeSolo: true,
                options,
                getOptionDisabled: (o) => o === DISABLED_OPTION,
                filterOptions: (o: string[], s) =>
                  s.inputValue.length > 2
                    ? filterOptions(o, s)
                    : [DISABLED_OPTION],
                ListboxProps: { sx: paper() },
              }}
              name="requesterAffilation"
              getOptionDisabled={(o) => o === DISABLED_OPTION}
              filterOptions={(o: string[], s) =>
                s.inputValue.length > 2
                  ? filterOptions(o, s)
                  : [DISABLED_OPTION]
              }
              label="Affiliation"
              placeholder="Monash University"
              required
            />
            {renderLabel("About your algorithm")}
            {renderRow(
              <Field<Request>
                name="algorithmName"
                label="Algorithm name"
                placeholder="Constraint-based search"
                required
              />,
              <Field<Request>
                name="authorName"
                label="Authors"
                placeholder="John Doe, Wei Zhang, Joe Smith"
                required
              />
            )}
            <Field<Request>
              name="paperReference"
              label="Paper references"
              multiline
              placeholder="APA references to papers describing your algorithm, separate with a new line"
              minRows={3}
              required
            />
            <Field<Request>
              name="googleScholar"
              type="url"
              label="Google Scholar link"
              required
            />
            <Field<Request> name="dblp" type="url" label="DBLP link" required />
            <Field<Request>
              name="githubLink"
              type="url"
              label="GitHub link"
              required
            />
            {renderLabel("Other info")}
            <Field<Request>
              multiline
              minRows={3}
              name="justification"
              label="Justification"
              placeholder="Why would you like to submit your algorithm to our tracker?"
              required
            />
            <Field<Request>
              name="comments"
              label="Comments"
              fullWidth
              minRows={4}
              multiline
            />
            {submit(state)}
          </Stack>
        </Form>
      )}
    </Formik>
  );
}
