import { Typography } from "@mui/material";
import { useLocationState, useNavigate } from "hooks/useNavigation";
import { Layout } from "layout";
import { SubmitRequestForm } from "pages/contribute/SubmitRequestForm";
import { useEffect } from "react";
import { RenderSection } from "./Section";
import { ContactEmailState } from "./step1";
import { defer } from "lodash";

export default function index() {
  const navigate = useNavigate();
  const { contactEmail } = useLocationState<ContactEmailState>();
  useEffect(() => {
    if (!contactEmail) navigate("/submit/1");
  }, [contactEmail]);
  return (
    !!contactEmail && (
      <Layout
        backBehaviour="back"
        disablePadding
        flat
        title="About your submission"
        render={RenderSection}
        path={[
          { name: "Home", url: "/" },
          { name: "New submission request", url: "/submit" },
        ]}
      >
        <Typography>Tell us about you and your algorithm.</Typography>
        <SubmitRequestForm
          initialValues={{
            requesterEmail: contactEmail,
          }}
          onSubmit={async () =>
            defer(() => navigate("/submit/3", {}, { contactEmail }))
          }
          disabledValues={{ requesterEmail: true }}
          floatingSubmitButton
        />
      </Layout>
    )
  );
}
