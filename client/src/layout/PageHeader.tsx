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
import { ReactNode } from "react";

export type PageHeaderProps = {
  path?: {
    name: string;
    url: string;
    state?: any;
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
      <Typography variant="h2">{startCase(current)}</Typography>
      {description && (
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      )}
    </Stack>
  );
}
