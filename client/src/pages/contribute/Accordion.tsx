import { ExpandMoreOutlined } from "@mui/icons-material";
import {
  AccordionSummary,
  Typography,
  AccordionDetails,
  Accordion as MuiAccordion,
} from "@mui/material";
import { Prose } from "layout";
import React, { ReactNode } from "react";

export default function Accordion({
  title,
  children,
}: {
  title?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <MuiAccordion elevation={0}>
      <AccordionSummary
        expandIcon={<ExpandMoreOutlined />}
        sx={{ px: 0, py: 2 }}
      >
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>{children}</AccordionDetails>
    </MuiAccordion>
  );
}
