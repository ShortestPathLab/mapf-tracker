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
        gap: sm ? 1 : 2,
        mb: sm ? -1 : 0,
      }}
    >
      <Typography variant="h2">{current}</Typography>
      {description && (
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      )}
    </Stack>
  );
}
