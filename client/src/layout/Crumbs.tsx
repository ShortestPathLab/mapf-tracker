import {
  Box,
  Breadcrumbs,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "hooks/useNavigation";
import { PageHeaderProps } from "./PageHeader";
import { ArrowUpwardOutlined } from "@mui-symbols-material/w400";
import { last } from "lodash";

export const Crumbs = ({ path, current }: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <>
      <Stack direction="row" sx={{ gap: 2, p: 3, py: 2, alignItems: "center" }}>
        <Breadcrumbs sx={{ overflowX: "auto" }}>
          {path.map(({ name, url, state }) => (
            <Link
              key={name}
              sx={{ cursor: "pointer" }}
              underline="hover"
              color="inherit"
              onClick={() => navigate(url, state)}
            >
              <Typography variant="body1">{name}</Typography>
            </Link>
          ))}
          <Typography color="text.primary" variant="body1">
            {current}
          </Typography>
        </Breadcrumbs>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          disabled={!path.length}
          edge="end"
          onClick={() => {
            const { url, state } = last(path);
            navigate(url, state);
          }}
        >
          <ArrowUpwardOutlined />
        </IconButton>
      </Stack>
      <Divider />
    </>
  );
};
