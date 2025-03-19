import {
  ArrowBackRounded,
  ArrowForwardRounded,
  ArrowUpwardRounded,
} from "@mui-symbols-material/w400";
import {
  Box,
  Breadcrumbs,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useHistory, useNavigate } from "hooks/useNavigation";
import { last } from "lodash";
import { PageHeaderProps } from "./PageHeader";
import { Scroll } from "components/dialog/Scrollbars";

export const Crumbs = ({ path, current }: PageHeaderProps) => {
  const { canForward, canGoBack } = useHistory();
  const navigate = useNavigate();
  console.log(canForward);
  return (
    <>
      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        <Scroll x fadeX>
          <Breadcrumbs sx={{ minWidth: "max-content", p: 3, py: 2, flex: 1 }}>
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
        </Scroll>
        <Stack
          direction="row"
          sx={{
            p: 3,
            py: 2,
            gap: 1,
          }}
        >
          <IconButton
            disabled={!canGoBack}
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowBackRounded />
          </IconButton>
          <IconButton
            disabled={!canForward}
            onClick={() => {
              navigate(1);
            }}
          >
            <ArrowForwardRounded />
          </IconButton>
          <IconButton
            disabled={!path.length}
            edge="end"
            onClick={() => {
              const { url, state } = last(path);
              navigate(url, state);
            }}
          >
            <ArrowUpwardRounded />
          </IconButton>
        </Stack>
      </Stack>
      <Divider />
    </>
  );
};
