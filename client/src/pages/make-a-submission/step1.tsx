import { Button, Card, Stack, Typography } from "@mui/material";
import { Floating } from "components/Floating";
import { Item } from "components/Item";
import { ConfirmDialog } from "components/dialog/Modal";
import { useXs } from "components/dialog/useSmallDisplay";
import { SubmitContactEmailForm } from "forms/SubmitContactEmailForm";
import { useSurface } from "components/surface/useSurface";
import { useLocationState, useNavigate } from "hooks/useNavigation";
import { Layout } from "layout";
import { filter, map } from "lodash";
import pluralize from "pluralize";
import { requestByEmailQueryFn } from "queries/useRequestQuery";
import { paper } from "theme";
import { RenderSection } from "./Section";
import { useState } from "react";
import { useStableLocationState } from "hooks/useStableLocationState";

export type ContactEmailState = {
  contactEmail: string;
};

export default function index() {
  const navigate = useNavigate();
  const { contactEmail } = useStableLocationState<ContactEmailState>();
  const xs = useXs();
  const { open, dialog } = useSurface(ConfirmDialog, {
    slotProps: { modal: { variant: "default" } },
    title: xs
      ? "Submission in review"
      : "You already have a submission in review",
    padded: true,
  });
  const [checking, setChecking] = useState(false);
  return (
    <Layout
      disablePadding
      flat
      title="Your point of contact"
      render={RenderSection}
      path={[
        { name: "Home", url: "/" },
        { name: "New submission request", url: "/submit" },
      ]}
    >
      <Typography>To continue, we need your email address.</Typography>
      <SubmitContactEmailForm
        validateOnMount
        initialValues={{ email: contactEmail }}
        onSubmit={async (values) => {
          setChecking(true);
          const a = await requestByEmailQueryFn(values.email)();
          setChecking(false);
          const f = () =>
            navigate<object, ContactEmailState>(
              "/submit/2",
              {},
              {
                contactEmail: values.email,
              }
            );
          const as = filter(
            a,
            (c) => c.reviewStatus?.status === "not-reviewed"
          );
          if (as.length) {
            open({
              hintText: (
                <Stack sx={{ gap: 2 }}>
                  We&apos;re still reviewing the following{" "}
                  {pluralize("request", as.length)} from you.
                  {map(
                    as,
                    ({
                      algorithmName,
                      requesterName,
                      requesterAffiliation = "personal",
                    }) => (
                      <Card sx={{ ...paper(0), p: 2 }}>
                        <Item
                          primary={algorithmName}
                          secondary={`${requesterName}, ${requesterAffiliation}`}
                        />
                      </Card>
                    )
                  )}
                  You&apos;ll receive an API key once they&apos;re approved.
                  This usually takes 2-3 days. Do you want to continue to making
                  a new request?
                </Stack>
              ),
              acceptLabel: xs
                ? "Continue"
                : "Continue making a new submission request",
              closeLabel: "Cancel",
              acceptColor: "primary",
              onAccept: f,
            });
          } else {
            f();
          }
        }}
        submit={({ submitForm, isValid }) => (
          <Floating>
            <Button
              sx={{ mt: 4 }}
              disabled={!isValid || checking}
              fullWidth={xs}
              onClick={submitForm}
              variant="contained"
            >
              {checking ? "Checking..." : "Next"}
            </Button>
          </Floating>
        )}
      />
      {dialog}
    </Layout>
  );
}
