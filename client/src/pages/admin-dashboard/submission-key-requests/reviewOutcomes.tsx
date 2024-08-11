import { MenuItem, Stack } from "@mui/material";
import { Field, Select } from "components/Field";
import { Form, Formik, FormikConfig, FormikProps } from "formik";
import { noop, startCase } from "lodash";
import { ReactNode } from "react";
import { ReviewOutcome } from "./useRequestsQuery";
import { StatusChip } from "./StatusChip";

export type SetReviewOutcomeFormProps = {
  submit: (state: FormikProps<ReviewOutcome>) => ReactNode;
} & Partial<FormikConfig<ReviewOutcome>>;

export const reviewOutcomes = [
  "not-reviewed",
  "approved",
  "rejected",
] as ReviewOutcome["status"][];
export function SetReviewOutcomeForm({
  submit = () => <></>,
  ...props
}: SetReviewOutcomeFormProps) {
  return (
    <Formik<ReviewOutcome>
      initialValues={{ status: "not-reviewed" }}
      onSubmit={noop}
      {...props}
    >
      {(state) => (
        <Form>
          <Stack gap={2}>
            <Field<ReviewOutcome, typeof Select>
              as={Select}
              name="status"
              label="Status"
              required
              SelectProps={{
                renderValue: (v: ReviewOutcome["status"]) => (
                  <StatusChip status={v} />
                ),
              }}
            >
              {reviewOutcomes.map((r) => (
                <MenuItem value={r}>{startCase(r)}</MenuItem>
              ))}
            </Field>
            <Field<ReviewOutcome>
              name="comments"
              label="Comments"
              multiline
              minRows={3}
            />
            {submit(state)}
          </Stack>
        </Form>
      )}
    </Formik>
  );
}
