import {
  CircularProgress,
  listItemClasses,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { DetailsList } from "components/DetailsList";
import {
  APIConfig,
  appName,
  identifier,
  publisher,
  version,
} from "core/config";
import { Layout } from "layout";
import { toPairs } from "lodash";
import { json } from "queries/query";

function useInfo() {
  return useQuery({
    queryKey: ["info/environment"],
    queryFn: () =>
      json<{
        [K in string]: string | number;
      }>(`${APIConfig.apiUrl}/info/environment`),
  });
}

export default function index() {
  const { data: info, isLoading: isInfoLoading } = useInfo();

  const renderSection = (
    title: string,
    items: { label: string; value: string }[],
    loading?: boolean
  ) => (
    <Stack sx={{ gap: 2 }}>
      <Typography variant="h6">{title}</Typography>
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
        toPairs(info).map(([k, v]) => ({ label: k, value: `${v}` })),
        isInfoLoading
      )}
    </Layout>
  );
}
