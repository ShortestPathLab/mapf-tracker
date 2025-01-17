import { Button, Link, Stack, Typography } from "@mui/material";
import { Floating } from "components/Floating";
import { useXs } from "components/dialog/useSmallDisplay";
import { useLocationState, useNavigate } from "hooks/useNavigation";
import { Layout } from "layout";
import { SectionContent } from "./Section";
import { ContactEmailState } from "./step1";

const Render = ({ children, header }) => (
  <SectionContent>
    <Stack sx={{ gap: 4 }}>
      {header}
      {children}
    </Stack>
  </SectionContent>
);

export default function index() {
  const xs = useXs();
  const navigate = useNavigate();
  const { contactEmail } = useLocationState<ContactEmailState>();
  return (
    <Layout
      backBehaviour="back"
      disablePadding
      flat
      title="All done!"
      render={Render}
      path={[
        { name: "Home", url: "/" },
        { name: "New submission request", url: "/submit" },
      ]}
    >
      <Typography>
        You&apos;ll receive a confirmation in your inbox, {contactEmail}.
      </Typography>
      <Stack>
        <Typography variant="overline" color="text.secondary">
          What now?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Wait for the team to reply you with your submission (API) key. Once
          you have your API key, you can start submitting data{" "}
          <Link sx={{ cursor: "pointer" }} onClick={() => navigate("/track")}>
            here
          </Link>
          .
        </Typography>
      </Stack>

      <Floating>
        <Button
          fullWidth={xs}
          onClick={() => navigate("/")}
          variant="contained"
        >
          Go home
        </Button>
      </Floating>
    </Layout>
  );
}
