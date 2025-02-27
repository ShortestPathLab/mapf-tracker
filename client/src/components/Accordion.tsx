import { ExpandOutlined } from "@mui-symbols-material/w400";
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
import { useSm } from "./dialog/useSmallDisplay";

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
  const sm = useSm();
  return (
    <MuiAccordion elevation={0} {...props} slotProps={slotProps}>
      <AccordionSummary
        {...merge(
          { expandIcon: <ExpandOutlined />, sx: { px: 0, py: 2 } },
          slotProps?.summary
        )}
      >
        <Typography
          {...merge(
            { variant: sm ? "body1" : "h6", sx: { mr: 2 } },
            slotProps?.label
          )}
        >
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>{children}</AccordionDetails>
    </MuiAccordion>
  );
}
