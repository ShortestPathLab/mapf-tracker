import {
  ArrowForwardOutlined,
  CheckOutlined,
  CreateOutlined,
  FileUploadOutlined,
  MailOutlined,
  PendingOutlined,
  TimerOutlined,
} from "@mui/icons-material";
import {
  Button,
  ButtonBase,
  Link,
  Stack,
  Step,
  StepIconProps,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
  useForkRef,
} from "@mui/material";
import { Item } from "components/Item";
import { appbarHeight } from "components/appbar";
import { useSm, useXs } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { Grid, Layout } from "layout";
import { bottomBarHeight } from "layout/navbarHeight";
import { find } from "lodash";
import { RequestAnAPIKeyContent } from "pages/contribute";
import { ArticleCard } from "pages/docs/ArticleCard";
import { pages } from "pages/docs/pages";
import { AddKey } from "pages/submissions";
import { MutableRefObject, ReactNode, useRef } from "react";
import { useHarmonicIntervalFn } from "react-use";

function Section({
  primary,
  secondary,
  icon,
  children,
  contentRef,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  contentRef?: React.ForwardedRef<HTMLDivElement>;
}) {
  const xs = useXs();
  const content = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLButtonElement>(null);
  const contentFork = useForkRef<HTMLDivElement>(content, contentRef);
  useHarmonicIntervalFn(
    () =>
      requestAnimationFrame(() => {
        if (title.current) {
          const titleRect = title.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          title.current.style.zIndex =
            titleRect && titleRect.top >= viewportHeight / 2
              ? `${
                  500 -
                  Array.prototype.indexOf.call(
                    title.current.parentElement.children,
                    title.current
                  )
                }`
              : `500`;
        }
      }),
    1000 / 15
  );

  return (
    <>
      <ButtonBase
        ref={title}
        onClick={() =>
          content?.current?.scrollIntoView?.({ behavior: "smooth" })
        }
        sx={{
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          "&:first-child": { borderTop: "none" },
          "&:last-child": { borderBottom: "none" },
          height: 72,
          position: "sticky",
          top: 0,
          bottom: 0,
          px: xs ? 2 : 3,
          alignItems: "center",
          bgcolor: "background.default",
          justifyContent: "flex-start",
        }}
      >
        <SectionTitle {...{ icon, primary, secondary }} />
      </ButtonBase>
      <Stack ref={contentFork} sx={{ scrollMarginTop: 72, gap: 2 }}>
        <SectionContent>
          <Typography sx={{ mb: 4 }} variant="h2">
            {primary}
          </Typography>

          {children}
        </SectionContent>
      </Stack>
    </>
  );
}

function SectionContent({ children }: { children?: ReactNode }) {
  const xs = useXs();
  const sm = useSm();
  return (
    <Stack
      sx={{
        width: 960,
        maxWidth: "100%",
        mx: "auto",
        py: xs ? 4 : 6,
        minHeight: `calc(100dvh - ${
          appbarHeight(sm) + 68 * 2 + bottomBarHeight(sm)
        }px)`,
      }}
    >
      <Stack sx={{ p: xs ? 2 : 3 }}>{children}</Stack>
    </Stack>
  );
}

function SectionTitle({
  primary,
  secondary,
  icon,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  icon?: ReactNode;
}) {
  const xs = useXs();
  return (
    <Stack sx={{ gap: 2, alignItems: "center", flex: 1 }} direction="row">
      {icon}
      <Typography>{primary}</Typography>
      {!xs && <Typography color="text.secondary">{secondary}</Typography>}
    </Stack>
  );
}

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

export default function MakeASubmissionPage() {
  const navigate = useNavigate();

  const step1Content = useRef<HTMLDivElement>(null);
  const step2Content = useRef<HTMLDivElement>(null);
  const xs = useXs();
  const docs = ["motivations", "how-to-submit"].map((value) =>
    find(pages(), { value })
  );

  function scrollIntoView(ref: MutableRefObject<HTMLDivElement>) {
    ref?.current?.scrollIntoView?.({ behavior: "smooth" });
  }

  return (
    <Layout
      flat
      disablePadding
      title="Submit data to the tracker"
      path={[{ name: "Home", url: "/" }]}
      render={({ children }) => children}
    >
      <SectionContent>
        <Stack sx={{ gap: 4 }}>
          <Typography variant="h2">Submit data to the tracker</Typography>
          <Typography>
            If you have data to submit to the tracker, you&apos;ve come to the
            right place. Here&apos;s a rundown of the process.
          </Typography>
          <Stepper activeStep={5} orientation="vertical">
            {[
              {
                icon: <CreateOutlined />,
                label: "Make a submission request",
                content:
                  "Before submitting solutions from your algorithm, you'll need a submission (API) key for it. This is a one-time use key that you can use to submit data to the tracker.",
                action: (
                  <Button
                    onClick={() => scrollIntoView(step1Content)}
                    variant="outlined"
                    sx={{ px: 2, py: 1, minWidth: "max-content" }}
                  >
                    Make a request
                  </Button>
                ),
              },
              {
                label: "The MAPF Tracker team reviews your request",
                content:
                  "The team will review your request and get back to you in a few days.",
                icon: <TimerOutlined sx={{ color: "action.disabled" }} />,
              },
              {
                label: "You receive an API key in your inbox",
                content:
                  "If your algorithm and submission request has been approved by the team, you will receive an API key in your contact email inbox.",
                icon: <MailOutlined sx={{ color: "action.disabled" }} />,
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
                    onClick={() => scrollIntoView(step2Content)}
                  >
                    Submit data now
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
            onClick={() => scrollIntoView(step1Content)}
            variant="contained"
            sx={{ alignSelf: "flex-start", py: 1.5, px: 3 }}
            endIcon={<ArrowForwardOutlined />}
          >
            I&apos;m ready, let&apos;s start
          </Button>
          {!xs && (
            <Stack sx={{ gap: 2, mt: 4 }}>
              <Typography variant="overline" color="text.secondary">
                Read the docs
              </Typography>
              <Grid width={280} sx={{ gap: 2 }}>
                {docs.map((page, i) => (
                  <Tooltip key={i} title="Open this article in a new tab">
                    <ArticleCard
                      page={page}
                      onClick={() => open(`/docs/${page.value}`, "_blank")}
                    />
                  </Tooltip>
                ))}
              </Grid>
            </Stack>
          )}
        </Stack>
      </SectionContent>
      <Section
        contentRef={step1Content}
        icon={<CreateOutlined color="action" />}
        primary="Make a submission request"
        secondary="Fill out this form and our team will get back to you with your submission key"
      >
        <RequestAnAPIKeyContent onClose={() => scrollIntoView(step2Content)} />
      </Section>
      <Section
        contentRef={step2Content}
        secondary="Enter your API key here to start submitting"
        primary="Submit data with your API key"
        icon={<FileUploadOutlined color="action" />}
      >
        <Stack sx={{ gap: 4, pb: 6 }}>
          <Typography>
            Received your submission key? Enter it here to start submitting for
            your algorithm.
          </Typography>
          <AddKey />
          <Stack sx={{ gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              An API key is a 32-character string of numbers 0-9 and lowercase
              letters a-f.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ pt: 4 }}>
              Don&apos;t have a submission (API) key? You need one to submit
              data.{" "}
              <Link
                sx={{ cursor: "pointer" }}
                onClick={() => scrollIntoView(step1Content)}
              >
                Request one here.
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all previous submissions.{" "}
              <Link
                sx={{ cursor: "pointer" }}
                onClick={() => navigate("/track")}
              >
                Open my submissions.
              </Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Something not right?{" "}
              <Link
                sx={{ cursor: "pointer" }}
                onClick={() =>
                  open(
                    "https://github.com/ShortestPathLab/winter-project-mapf-tracker/issues",
                    "_blank"
                  )
                }
              >
                Raise an issue on Github.
              </Link>
            </Typography>
          </Stack>
        </Stack>
      </Section>
    </Layout>
  );
}
