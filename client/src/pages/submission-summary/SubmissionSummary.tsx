import { ExpandMoreOutlined } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
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

export type Props = {
  extras?: ReactNode;
  status?: ReactNode;
  apiKey?: ReactNode;
  summaryStats?: { name: string; count: number }[];
  detailStats?: { name: string; stats: { name: string; count: number }[] }[];
  children?: ReactNode;
};

export default function SubmissionSummary({
  extras = defaultExtras,
  status = defaultStatus,
  apiKey = "sample_api_key",
  summaryStats = defaultSummary,
  detailStats = defaultDetails,
  children,
}: Props) {
  return (
    <>
      <Stack direction="row" sx={{ mt: 2, gap: 2, alignItems: "center" }}>
        {status}
        <Box sx={{ flex: 1 }} />
        {extras}
      </Stack>
      <Stack
        direction="row"
        sx={{
          gap: 4,
          p: 8,
          mt: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 1,
          justifyContent: "space-around",
        }}
      >
        {summaryStats.map(({ name, count }) => (
          <Stack sx={{ gap: 1 }}>
            <Typography variant="h4" component="h2">
              {count}
            </Typography>
            <Typography color="text.secondary">{name}</Typography>
          </Stack>
        ))}
      </Stack>
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
      {children}
    </>
  );
}
