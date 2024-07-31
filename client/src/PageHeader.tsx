import { Breadcrumbs, Link, Stack, Typography } from "@mui/material";
import { useNavigate } from "useNavigation";

export type PageHeaderProps = {
  path?: {
    name: string;
    url: string;
    state?: any;
  }[];
  current?: string;
};

export default function PageHeader({ path = [], current }: PageHeaderProps) {
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
            onClick={() => navigate(url, state)}
          >
            {name}
          </Link>
        ))}
        <Typography color="text.primary">{current}</Typography>
      </Breadcrumbs>
    </Stack>
  );
}
