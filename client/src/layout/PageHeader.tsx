import { Stack, Typography } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { ReactNode } from "react";

export type PageHeaderProps = {
  path?: {
    name: string;
    url: string;
    state?: object;
  }[];
  current?: string;
  description?: ReactNode;
};

export default function PageHeader({
  current = "",
  description = "",
}: PageHeaderProps) {
  const sm = useSm();
  return (
    <Stack
      sx={{
        gap: 1,
        mb: sm ? -1 : 0,
      }}
    >
      <Typography variant="h2">{current}</Typography>
      {description && (
        <Typography color="text.secondary" variant="subtitle1">
          {description}
        </Typography>
      )}
    </Stack>
  );
}
