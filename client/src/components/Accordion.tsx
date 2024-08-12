import { ExpandMoreOutlined } from "@mui/icons-material";
import {
  AccordionDetails,
  AccordionProps as MuiAccordionProps,
  AccordionSummary,
  Accordion as MuiAccordion,
  Typography,
  AccordionSummaryProps,
  TypographyProps,
} from "@mui/material";
import { merge } from "lodash";
import { ReactNode } from "react";

export default function Accordion({
  label,
  children,
  slotProps,
  ...props
}: {
  slotProps?: { summary?: AccordionSummaryProps; label?: TypographyProps };
  label?: ReactNode;
  children?: ReactNode;
} & MuiAccordionProps) {
  return (
    <MuiAccordion elevation={0} {...props} slotProps={slotProps}>
      <AccordionSummary
        {...merge(
          { expandIcon: <ExpandMoreOutlined />, sx: { px: 0, py: 2 } },
          slotProps?.summary
        )}
      >
        <Typography {...merge({ variant: "h6" }, slotProps?.label)}>
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>{children}</AccordionDetails>
    </MuiAccordion>
  );
}
