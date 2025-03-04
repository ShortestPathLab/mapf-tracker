import {
  ArrowBackRounded,
  ArrowUpwardRounded,
  ShareRounded,
} from "@mui-symbols-material/w400";
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
import { appName } from "core/config";
import { paper } from "theme";

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

const RenderArticleLayout = ({ children }) => <>{children}</>;

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
      render={RenderArticleLayout}
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
            <ArrowBackRounded />
          </IconButton>
        )}
        <Hero primary={title} secondary={subtitle} />
      </Box>
      <Divider />
      <Stack direction={sm ? "column-reverse" : "row"} sx={{ gap: sm ? 2 : 6 }}>
        <Stack ref={ref} sx={{ flex: 1, gap: 4 }}>
          {author}
          <Stack
            sx={{
              gap: 4,
              "& .prose h1": { mt: 6, mb: 4, fontSize: "3.5rem" },
              "& .prose h2": { mt: 6, mb: 4, fontSize: "3rem" },
              "& .prose h3": { mt: 6, mb: 4, fontSize: "2.5rem" },
              "& .prose h4": { mt: 6, mb: 4, fontSize: "1.5rem" },
              "& .prose h5": { mb: 0, mt: 4 },
              "& .prose h6": { mb: 0, mt: 3 },
              "& .prose h1:first-child": { mt: 0 },
              "& .prose h2:first-child": { mt: 0 },
              "& .prose h3:first-child": { mt: 0 },
              "& .prose h4:first-child": { mt: 0 },
              "& .prose h5:first-child": { mt: 0 },
              "& .prose h6:first-child": { mt: 0 },
              " hr": { mt: 6 },
              " table": { ...paper(0), p: 2, my: 2, width: "100%" },
            }}
          >
            {children}
          </Stack>
          <Stack
            direction="row"
            onClick={() =>
              top.current?.scrollIntoView?.({ behavior: "smooth" })
            }
            sx={{
              gap: 1,
              alignSelf: "flex-start",
              alignItems: "center",
              my: 4,
            }}
          >
            <IconButton edge="start">
              <ArrowUpwardRounded />
            </IconButton>
            <Typography color="text.secondary">Back to top</Typography>
          </Stack>
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
                  text: `${appName} - ${title}\n${subtitle}\n\n${location.href}`,
                });
              }}
            >
              <ShareRounded sx={{ color: "text.secondary" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Layout>
  );
}
