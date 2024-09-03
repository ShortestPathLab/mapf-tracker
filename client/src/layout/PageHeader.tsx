import { ArrowBackOutlined } from "@mui/icons-material";
import {
  AppBar,
  Breadcrumbs,
  Divider,
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

export default function PageHeader({ current }: PageHeaderProps) {
  const sm = useSm();
  return (
    <Stack
      sx={{
        gap: 2,
        mb: sm ? -1 : 0,
      }}
    >
      <Typography variant="h2">{startCase(current)}</Typography>
    </Stack>
  );
}
