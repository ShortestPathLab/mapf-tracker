import {
  ArrowBackOutlined,
  ArrowUpwardOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemAvatar,
  Stack,
  Typography,
} from "@mui/material";
import { Item } from "components/Item";
import { useSm } from "components/dialog/useSmallDisplay";
import { useNavigate } from "hooks/useNavigation";
import Layout, { LayoutProps } from "layout/Layout";
import { last } from "lodash";
import { ReactNode, useEffect, useRef, useState } from "react";
import { name } from "../../public/manifest.json";

function useHeaders() {
  const ref = useRef<HTMLDivElement>(null);
  const [headers, setTitles] = useState<HTMLElement[]>([]);
  useEffect(() => {
    if (ref.current) {
      const h3s = ref.current.querySelectorAll("h1, h2, h3, h4");
      setTitles(Array.from(h3s) as HTMLElement[]);
    }
  }, [ref.current]);
  return { headers, ref };
}

function Hero({
  primary,
  secondary,
  tertiary,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  tertiary?: ReactNode;
}) {
  const sm = useSm();
  return (
    <Stack sx={{ py: sm ? 2 : 4, gap: 2 }}>
      <Typography
        variant="h1"
        sx={{ fontSize: sm ? "2.5rem" : "3.5rem", fontWeight: 500 }}
      >
        {primary}
      </Typography>
      {secondary && (
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {secondary}
        </Typography>
      )}
      {tertiary && (
        <Typography variant="body1" sx={{ mt: 4 }}>
          {tertiary}
        </Typography>
      )}
    </Stack>
  );
}

export function ArticleLayout({
  children,
  title,
  subtitle,
  author = (
    <ListItem disableGutters>
      <ListItemAvatar>
        <Avatar>S</Avatar>
      </ListItemAvatar>
      <Item primary="ShortestPathLab team" secondary="pathfinding.ai" />
    </ListItem>
  ),
  path,
  ...props
}: LayoutProps & { subtitle?: string; author?: ReactNode }) {
  const { headers, ref } = useHeaders();
  const top = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const sm = useSm();
  return (
    <Layout
      title={title}
      width={1200}
      render={({ children }) => <>{children}</>}
      flat
      path={path}
      {...props}
    >
      <Box ref={top}>
        {!sm && (
          <IconButton
            sx={{ mt: 2, alignSelf: "flex-start" }}
            edge="start"
            onClick={() => {
              const { state, url } = last(path);
              navigate(url, state);
            }}
          >
            <ArrowBackOutlined />
          </IconButton>
        )}
        <Hero primary={title} secondary={subtitle} />
      </Box>
      <Divider />
      <Stack direction={sm ? "column-reverse" : "row"} sx={{ gap: sm ? 2 : 6 }}>
        <Stack ref={ref} sx={{ flex: 1, gap: 4 }}>
          {author}
          {children}
          <IconButton
            edge="start"
            onClick={() =>
              top.current?.scrollIntoView?.({ behavior: "smooth" })
            }
            sx={{ alignSelf: "flex-start", my: 4 }}
          >
            <ArrowUpwardOutlined />
          </IconButton>
        </Stack>
        <Stack
          sx={{
            flex: 0.5,
            gap: 4,
            ...(!sm && {
              height: "max-content",
              position: "sticky",
              top: (t) => t.spacing(3),
            }),
          }}
        >
          <Stack sx={{ gap: 2 }}>
            <Typography variant="overline" color="text.secondary">
              On this page
            </Typography>
            {headers.map((title) => (
              <Typography
                key={title.textContent}
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  title.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                {title.textContent}
              </Typography>
            ))}
          </Stack>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 2 }}>
            <IconButton
              edge="start"
              onClick={() => {
                navigator.share?.({
                  text: `${name} - ${title}\n${subtitle}\n\n${location.href}`,
                });
              }}
            >
              <ShareOutlined sx={{ color: "text.secondary" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Layout>
  );
}
