import { ExpandMoreOutlined } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import PageHeader from "layout/PageHeader";
import { ReactNode } from "react";
import {
  defaultExtras,
  defaultStatus,
  defaultSummary,
  defaultDetails,
} from "./defaults";
import { paper } from "theme";
import { Grid } from "layout";
import { AnimateInteger } from "components/AnimateInteger";
import { useSm } from "components/dialog/useSmallDisplay";

export type Props = {
  extras?: ReactNode;
  status?: ReactNode;
  apiKey?: ReactNode;
  summaryStats?: { label: string; values: { name: string; count: number }[] }[];
  detailStats?: { name: string; stats: { name: string; count: number }[] }[];
  children?: ReactNode;
};

export default function SubmissionSummary({
  extras = defaultExtras,
  status = defaultStatus,
  apiKey = "sample_api_key",
  summaryStats = [],
  detailStats = defaultDetails,
  children,
}: Props) {
  const sm = useSm();
  return (
    <>
      {/* <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        {status}
        <Box sx={{ flex: 1 }} />
        {extras}
      </Stack> */}
      <Grid
        width={230}
        sx={{
          gap: 2,
          mt: 2,
        }}
      >
        {summaryStats?.map?.(({ label, values }) => (
          <Stack sx={{ p: 2, ...paper(0) }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ mt: -1, mb: 1 }}
            >
              {label}
            </Typography>
            <Grid width={100} sx={{ gap: 1 }}>
              {values.map(({ name, count }) => (
                <ListItemText
                  primary={<AnimateInteger value={count} />}
                  secondary={name}
                />
              ))}
            </Grid>
          </Stack>
        ))}
      </Grid>
      {!!detailStats?.length && (
        <Stack
          sx={{
            my: 4,
            ...paper(),
            border: "none",
            boxShadow: "none",
            "> *:not(:last-child)": {
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
            },
          }}
        >
          {detailStats.map(({ name, stats }) => (
            <Accordion
              disableGutters
              sx={{
                backdropFilter: "none",
                boxShadow: "none",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreOutlined />}
                sx={{ py: 2 }}
              >
                <Typography sx={{ fontWeight: 500 }}>{name}</Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  px: 0,
                  pb: 4,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-evenly",
                    alignItems: "flex-start",
                  }}
                >
                  {stats.map(({ name, count }) => (
                    <Stack sx={{ gap: 1 }}>
                      <Typography variant="h4" component="h2">
                        {count}
                      </Typography>
                      <Typography color="text.secondary">{name}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
      {children}
    </>
  );
}
