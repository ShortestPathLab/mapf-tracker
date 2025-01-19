import {
  CheckOutlined,
  CreateOutlined,
  FileUploadOutlined,
  HelpOutlined,
  PendingOutlined,
  TimerOutlined,
} from "@mui/icons-material";
import {
  Button,
  Chip,
  Stack,
  Step,
  StepIconProps,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Floating } from "components/Floating";
import { Item } from "components/Item";
import { useXs } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { Layout } from "layout";
import { ReactNode } from "react";
import { SectionContent } from "./Section";
type BulletProps = {
  index?: number;
  icon?: ReactNode;
} & StepIconProps;

function Bullet({ icon }: BulletProps) {
  return (
    <Stack sx={{ width: 48 }}>
      {icon ? icon : <PendingOutlined sx={{ color: "action.disabled" }} />}
    </Stack>
  );
}
const RenderChildrenOnly = ({
  children,
}: {
  header?: ReactNode;
  children?: ReactNode;
}): ReactNode => children;
export default function index() {
  const navigate = useNavigate();

  const xs = useXs();

  return (
    <Layout
      flat
      disablePadding
      title="New submission request"
      path={[{ name: "Home", url: "/" }]}
      render={RenderChildrenOnly}
    >
      <SectionContent>
        <Stack sx={{ gap: 4 }}>
          <Typography variant="h2">Make a new submission request</Typography>
          <Typography>
            If you have data to submit to the tracker, you&apos;ve come to the
            right place. Here&apos;s a rundown of the process.
          </Typography>
          <Stepper activeStep={5} orientation="vertical">
            {[
              {
                icon: <CreateOutlined />,
                label: (
                  <>
                    {"Make a new submission request"}{" "}
                    <Chip size="small" label="You're here" />
                  </>
                ),
                content:
                  "Before submitting solutions from your algorithm, you'll need to submit a request to do so. This will provide you with a one-time use API key that you can use to submit data to the tracker.",
              },
              {
                label: "The MAPF Tracker team replies with an API key",
                content:
                  "The team will review your request and get back to you in a few days. If approved, you will receive an API key in your contact email inbox.",
                icon: <TimerOutlined sx={{ color: "action.disabled" }} />,
              },
              {
                icon: <FileUploadOutlined />,
                label: "Submit data with your API key",
                content:
                  "Once you have your API key, you can use it to submit data to the tracker. As long as you have your API key, you can submit from any machine.",
                action: (
                  <Button
                    variant="outlined"
                    sx={{ px: 2, py: 1, minWidth: "max-content" }}
                    onClick={() => navigate("/track")}
                  >
                    Enter your API key
                  </Button>
                ),
              },
              {
                label: "All done!",
                content:
                  "Once you finalise your submission, you should see your results listed on this platform in minutes.",
                icon: <CheckOutlined sx={{ color: "action.disabled" }} />,
              },
            ].map((step, i) => (
              <Step key={i}>
                <StepLabel
                  StepIconComponent={Bullet}
                  StepIconProps={{ icon: step.icon } as BulletProps}
                >
                  <Stack
                    direction={xs ? "column" : "row"}
                    sx={{
                      gap: xs ? 2 : 6,
                      alignItems: xs ? "flex-start" : "center",
                    }}
                  >
                    <Item primary={step.label} secondary={step.content} />
                    {xs ? (
                      step.action
                    ) : (
                      <Stack sx={{ minWidth: 160, alignItems: "flex-end" }}>
                        {step.action}
                      </Stack>
                    )}
                  </Stack>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Button
            sx={{ alignSelf: "flex-start" }}
            startIcon={<HelpOutlined />}
            onClick={() => open("/docs/how-to-submit", "_blank")}
          >
            I need help making a submission
          </Button>
          <Floating>
            <Button
              onClick={() => navigate("/submit/1")}
              variant="contained"
              fullWidth={xs}
            >
              Continue
            </Button>
          </Floating>
        </Stack>
      </SectionContent>
    </Layout>
  );
}
