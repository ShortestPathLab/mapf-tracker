import { MenuItem, Stack } from "@mui/material";
import { Field, Select } from "components/Field";
import { Form, Formik, FormikConfig, FormikProps } from "formik";
import { noop, once, startCase } from "lodash";
import { ReactNode, useMemo } from "react";
import { ReviewOutcome } from "../../../queries/useRequestsQuery";
import { StatusChip } from "./StatusChip";

export type SetReviewOutcomeFormProps = {
  submit: (state: FormikProps<ReviewOutcome>) => ReactNode;
  onTouched?: () => void;
} & Partial<FormikConfig<ReviewOutcome>>;

export const reviewOutcomes = [
  "not-reviewed",
  "approved",
  "rejected",
] as ReviewOutcome["status"][];
export function SetReviewOutcomeForm({
  submit = () => <></>,
  onTouched,
  ...props
}: SetReviewOutcomeFormProps) {
  const touch = useMemo(() => once(() => onTouched?.()), []);
  return (
    <Formik<ReviewOutcome>
      initialValues={{ status: "not-reviewed" }}
      onSubmit={noop}
      {...props}
    >
      {(state) => (
        <Form onChangeCapture={touch}>
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
