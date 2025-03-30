import { Button, Card, Stack, Typography } from "@mui/material";
import { Floating } from "components/Floating";
import { Item } from "components/Item";
import { ConfirmDialog } from "components/dialog/Modal";
import { useXs } from "components/dialog/useSmallDisplay";
import { useSurface } from "components/surface/useSurface";
import { SubmitContactEmailForm } from "forms/SubmitContactEmailForm";
import { useNavigate } from "hooks/useNavigation";
import { useStableLocationState } from "hooks/useStableLocationState";
import { Layout } from "layout";
import { filter, map } from "lodash";
import pluralize from "pluralize";
import { requestByEmailQueryFn } from "queries/useRequestQuery";
import { useState } from "react";
import { paper } from "theme";
import { Section } from "./Section";

export type ContactEmailState = {
  contactEmail: string;
};

export default function index() {
  const navigate = useNavigate();
  const { contactEmail } = useStableLocationState<ContactEmailState>();
  const xs = useXs();
  const { open, dialog, close } = useSurface(ConfirmDialog, {
    variant: "modal",
    title: xs
      ? "Submission in review"
      : "You already have submissions in review",
  });
  const [checking, setChecking] = useState(false);
  return (
    <Layout
      disablePadding
      flat
      title="Your point of contact"
      render={Section}
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
          const requests = await requestByEmailQueryFn(values.email)();
          setChecking(false);
          const f = () =>
            navigate<object, ContactEmailState>(
              "/submit/2",
              {},
              {
                contactEmail: values.email,
              }
            );
          const pendingRequests = filter(
            requests,
            (c) => c.reviewStatus?.status === "not-reviewed"
          );
          if (pendingRequests.length) {
            open({
              hintText: (
                <Stack sx={{ gap: 2 }}>
                  We&apos;re still reviewing the following{" "}
                  {pluralize("request", pendingRequests.length)} from you.
                  {map(
                    pendingRequests,
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
              onAccept: () => {
                f();
                close();
              },
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
              {checking ? "Processing..." : "Continue"}
            </Button>
          </Floating>
        )}
      />
      {dialog}
    </Layout>
  );
}
