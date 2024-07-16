import { Stack, Typography, Breadcrumbs, Link } from "@mui/material";
import React from "react";

export default function PageHeader({
  path = [],
  current,
}: {
  path?: { name: string; url: string }[];
  current?: string;
}) {
  return (
    <Stack sx={{ gap: 2, mb: 2 }}>
      <Typography variant="h2">{current}</Typography>
      <Breadcrumbs>
        {path.map(({ name, url }) => (
          <Link underline="hover" color="inherit" href={url}>
            {name}
          </Link>
        ))}
        <Typography color="text.primary">{current}</Typography>
      </Breadcrumbs>
    </Stack>
  );
}
