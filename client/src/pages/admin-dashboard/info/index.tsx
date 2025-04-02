import {
  Box,
  Button,
  CircularProgress,
  listItemClasses,
  Stack,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { DetailsList } from "components/DetailsList";
import { Scroll } from "components/dialog/Scrollbars";
import { Title } from "components/StickyTitle";
import {
  APIConfig,
  appName,
  identifier,
  publisher,
  version,
} from "core/config";
import { Layout } from "layout";
import { capitalize, has, isObject, omit, startCase, toPairs } from "lodash";
import { json } from "queries/query";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { paper } from "theme";
import { tryChain } from "utils/tryChain";

import { useXs } from "components/dialog/useSmallDisplay";
import { useSurface } from "components/surface";
import jsonLang from "react-syntax-highlighter/dist/esm/languages/prism/json";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useStickToBottom } from "use-stick-to-bottom";

SyntaxHighlighter.registerLanguage("json", jsonLang);

function useInfo() {
  return useQuery({
    queryKey: ["info/general"],
    refetchInterval: 1000,
    queryFn: () =>
      json<{
        [K in string]: string | number;
      }>(`${APIConfig.apiUrl}/info/general`),
  });
}

function useEnvironment() {
  return useQuery({
    queryKey: ["info/environment"],
    queryFn: () =>
      json<{
        [K in string]: string | number;
      }>(`${APIConfig.apiUrl}/info/environment`),
  });
}

function useInfoLogs() {
  return useQuery({
    queryKey: ["info/logs"],
    refetchInterval: 1000,
    queryFn: () => json<string[]>(`${APIConfig.apiUrl}/info/logs`),
  });
}

function Logs() {
  const isDark = useTheme().palette.mode === "dark";
  const xs = useXs();
  const { data: logs, isLoading: isLogsLoading } = useInfoLogs();
  const { scrollRef, contentRef } = useStickToBottom();
  return (
    <>
      {isLogsLoading ? (
        <CircularProgress />
      ) : (
        <Stack
          sx={{
            ...paper(0),
            height: `calc(100dvh - ${xs ? 56 + 16 * 2 : 64 + 24 * 2}px)`,
          }}
        >
          <Scroll y ref={scrollRef}>
            <Stack sx={{ p: 2 }} ref={contentRef}>
              {logs?.map?.((l, i) =>
                tryChain(
                  () => {
                    const e = JSON.parse(`${l}`);
                    const { message, error } =
                      isObject(e) && has(e, "message")
                        ? { message: e.message, error: omit(e, "message") }
                        : { message: "", error: e };
                    return message ? (
                      <Box sx={{ whiteSpace: "pre-wrap" }} component="code">
                        {message}
                      </Box>
                    ) : (
                      <SyntaxHighlighter
                        language="json"
                        customStyle={{ padding: 0 }}
                        wrapLongLines
                        style={{
                          ...(isDark ? oneDark : oneLight),
                          'pre[class*="language-"]': {
                            background: "transparent !important",
                          },
                          'code[class*="language-"]': {
                            background: "transparent !important",
                          },
                        }}
                      >
                        {JSON.stringify(error, null, 2)}
                      </SyntaxHighlighter>
                    );
                  },
                  () => (
                    <Box
                      component="code"
                      sx={{
                        color: l.includes("ERROR:")
                          ? "error.main"
                          : "text.primary",
                      }}
                      key={i}
                    >
                      {l}
                    </Box>
                  )
                )
              )}
            </Stack>
          </Scroll>
        </Stack>
      )}
    </>
  );
}

export default function index() {
  const { data: info, isLoading: isInfoLoading } = useEnvironment();
  const { data: general, isLoading: isInfoLoading2 } = useInfo();
  const { dialog, open } = useSurface(Logs, {
    title: "Server logs",
    variant: "fullscreen",
  });

  const renderSection = (
    title: string,
    items: { label: string; value: string }[],
    loading?: boolean
  ) => (
    <Stack sx={{ gap: 0 }}>
      <Title sticky>{title}</Title>
      {loading ? (
        <CircularProgress />
      ) : (
        <DetailsList
          sx={{
            [`& > .${listItemClasses.root}`]: { p: 0, py: 0.5 },
          }}
          items={items}
        />
      )}
    </Stack>
  );
  return (
    <Layout
      flat
      title="Info"
      path={[
        { name: "More", url: "/more" },
        { name: "Sudo", url: "/sudo" },
      ]}
    >
      {renderSection("Client info", [
        { label: "App Name", value: appName },
        { label: "App ID", value: identifier },
        { label: "Publisher", value: publisher },
        { label: "Client version", value: version },
        { label: "API", value: APIConfig.apiUrl },
      ])}
      {renderSection(
        "Server info",
        toPairs(general).map(([k, v]) => ({
          label: capitalize(startCase(k)),
          value: `${v}`,
        })),
        isInfoLoading2
      )}
      {renderSection(
        "Environment variables",
        toPairs(info).map(([k, v]) => ({ label: k, value: `${v}` })),
        isInfoLoading
      )}
      <Stack sx={{ gap: 2 }}>
        <Title sticky>Server logs</Title>
        <Button
          variant="contained"
          sx={{ alignSelf: "flex-start" }}
          onClick={() => open()}
        >
          Show logs
        </Button>
      </Stack>
      {dialog}
    </Layout>
  );
}
