import { ArrowBackOutlined } from "@mui/icons-material";
import {
  AppBar,
  Breadcrumbs,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import { last, startCase } from "lodash";

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
  const sm = useSm();
  return (
    <Stack sx={{ gap: 2, mb: sm ? 0 : 2 }}>
      <Breadcrumbs sx={{ overflowY: "auto" }}>
        {path.map(({ name, url, state }) => (
          <Link
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
      <Typography variant={sm ? "h3" : "h2"}>{current}</Typography>
    </Stack>
  );
}
