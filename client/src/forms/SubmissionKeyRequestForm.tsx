import { createFilterOptions, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Autocomplete, Field } from "components/Field";
import { Form, Formik, FormikConfig, FormikProps } from "formik";
import { chain, noop, once } from "lodash";
import { json } from "queries/query";
import { Request, requestSchema } from "queries/useRequestQuery";
import { ReactNode, useMemo } from "react";
import { paper } from "theme";

const defaultRequest: Request = {
  requesterName: "",
  requesterEmail: "",
  requesterAffiliation: "",
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

export type SubmissionKeyRequestFormProps = Partial<FormikConfig<Request>> & {
  disabled?: boolean;
  onTouched?: () => void;
  disabledValues?: { [K in keyof Request]?: boolean };
  submit?: (state: FormikProps<Request>) => ReactNode;
};

export function SubmissionKeyRequestForm({
  submit = () => <></>,
  disabled,
  onTouched,
  disabledValues,
  ...props
}: SubmissionKeyRequestFormProps) {
  const touch = useMemo(() => once(() => onTouched?.()), []);
  const { data: options = [] } = useQuery({
    queryKey: ["universities"],
    queryFn: async () =>
      chain(await json<{ name: string }[]>(WORLD_UNIVERSITIES_API))
        .map("name")
        .uniq()
        .value(),
  });
  const renderLabel = (label: ReactNode, secondary?: ReactNode) => (
    <Stack sx={{ pb: 1, pt: 2, gap: 1 }}>
      <Typography
        variant="h6"
        sx={{
          fontSize: "1em",
          color: disabled ? "text.secondary" : "text.primary",
        }}
      >
        {label}
      </Typography>
      {secondary && (
        <Typography sx={{ color: "text.secondary" }}>{secondary}</Typography>
      )}
    </Stack>
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
        <Form onChangeCapture={touch}>
          <Stack gap={2}>
            {renderLabel("Point of contact")}
            <Field<Request>
              name="requesterEmail"
              disabled={disabled || disabledValues?.requesterEmail}
              type="email"
              label="Contact email"
              placeholder="john.doe@example.com"
              required
            />
            {renderLabel("About you")}
            {renderRow(
              <Field<Request>
                name="requesterName"
                disabled={disabled || disabledValues?.requesterName}
                label="Name"
                placeholder="John Doe"
                required
              />,
              <Field<Request, typeof Autocomplete>
                freeSolo
                disabled={disabled || disabledValues?.requesterAffiliation}
                as={Autocomplete}
                autoCompleteProps={{
                  defaultValue: state.initialValues?.requesterAffiliation,
                  freeSolo: true,
                  options,
                  getOptionDisabled: (o) => o === DISABLED_OPTION,
                  filterOptions: (o: string[], s) =>
                    s.inputValue.length > 2
                      ? filterOptions(o, s)
                      : [DISABLED_OPTION],
                  ListboxProps: { sx: paper(2) },
                }}
                name="requesterAffiliation"
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
            )}
            {renderLabel(
              "About your algorithm",
              "Tell us about this algorithm you would like to submit results for."
            )}
            {renderRow(
              <Field<Request>
                name="algorithmName"
                disabled={disabled || disabledValues?.algorithmName}
                label="Algorithm name"
                placeholder="Constraint-based search"
                required
              />,
              <Field<Request>
                name="authorName"
                disabled={disabled || disabledValues?.authorName}
                label="Authors"
                placeholder="John Doe, Wei Zhang, Joe Smith"
                required
              />
            )}
            <Field<Request>
              name="paperReference"
              disabled={disabled || disabledValues?.paperReference}
              label="Paper references"
              multiline
              placeholder="APA references to papers describing your algorithm, separate with a new line"
              minRows={3}
              required
            />
            {renderLabel(
              "Where your algorithm is published",
              "Make it easier for people to find your work once we list your results on our platform."
            )}
            <Field<Request>
              name="googleScholar"
              disabled={disabled || disabledValues?.googleScholar}
              type="url"
              label="Google Scholar link"
            />
            <Field<Request>
              name="dblp"
              type="url"
              label="DBLP link"
              disabled={disabled || disabledValues?.dblp}
            />
            <Field<Request>
              name="githubLink"
              disabled={disabled || disabledValues?.githubLink}
              type="url"
              label="GitHub link"
            />
            {renderLabel(
              "Other info",
              "Let us know why you would like to submit your algorithm to our tracker, as well as any other helpful information."
            )}
            <Field<Request>
              multiline
              disabled={disabled || disabledValues?.justification}
              minRows={3}
              name="justification"
              label="Justification"
              placeholder="Why would you like to submit your algorithm to our tracker?"
            />
            <Field<Request>
              name="comments"
              disabled={disabled || disabledValues?.comments}
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
