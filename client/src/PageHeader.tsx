import { Stack, Typography, Breadcrumbs, Link } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function PageHeader({
  path = [],
  current,
}: {
  path?: { name: string; url: string; state?: any }[];
  current?: string;
}) {
  const navigate = useNavigate();
  return (
    <Stack sx={{ gap: 2, mb: 2 }}>
      <Typography variant="h2">{current}</Typography>
      <Breadcrumbs>
        {path.map(({ name, url, state }) => (
          <Link
            sx={{ cursor: "pointer" }}
            underline="hover"
            color="inherit"
            onClick={() => navigate(url, { state })}
          >
            {name}
          </Link>
        ))}
        <Typography color="text.primary">{current}</Typography>
      </Breadcrumbs>
    </Stack>
  );
}
