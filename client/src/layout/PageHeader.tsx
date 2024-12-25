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
        gap: 2,
        mb: sm ? -1 : 0,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontSize: sm ? "2rem" : "2.25rem",
          pt: sm ? 3 : 0,
        }}
      >
        {current}
      </Typography>
      {description && (
        <Typography
          color="text.secondary"
          variant="subtitle2"
          sx={{ maxWidth: "80%" }}
        >
          {description}
        </Typography>
      )}
    </Stack>
  );
}
