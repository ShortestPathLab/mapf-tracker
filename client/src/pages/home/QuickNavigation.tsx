import {
  alpha,
  Autocomplete,
  Avatar,
  Box,
  BoxProps,
  TextField,
} from "@mui/material";
import { useNavigationContent } from "components/appbar/useNavigationContent";
import { Item } from "components/Item";
import { appNameShort } from "core/config";
import { useNavigate } from "hooks/useNavigation";
import { flatMap, map } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { pages } from "pages/docs/pages";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { useAlgorithmsData } from "queries/useAlgorithmQuery";
import { useBenchmarksData } from "queries/useBenchmarksQuery";

export function QuickNavigation() {
  const { data: maps = [] } = useBenchmarksData();
  const { data: algorithms = [] } = useAlgorithmsData();
  const navigate = useNavigate();
  const content = useNavigationContent();
  return (
    <Autocomplete
      size="small"
      options={[
        ...map(maps, (source) => ({
          type: "map",
          name: source.map_name,
          render: () => <MapLabel mapId={source.id} />,
          navigate: () =>
            navigate<MapLevelLocationState>("/benchmarks", {
              mapId: source.id,
            }),
        })),
        ...map(algorithms, (source) => ({
          type: "algorithm",
          name: source.algo_name,
          render: () => (
            <Item
              icon={
                <Avatar
                  sx={{ mr: 1 }}
                  src={`https://api.dicebear.com/9.x/identicon/svg?seed=${source._id}`}
                />
              }
              primary={source.algo_name}
              secondary="Algorithm"
            />
          ),
          navigate: () => navigate(`/submissions/${source._id}`),
        })),
        ...map(
          flatMap(content.groups, (g) => g.items).filter((c) => c.url),
          (page) => ({
            type: "page",
            name: page.label,
            render: () => (
              <Item
                primary={page.label}
                secondary={page.description}
                icon={page.icon}
              />
            ),
            navigate: () => navigate(page.url),
          })
        ),
        ...map(pages(), (page) => ({
          type: "docs",
          name: page.label,
          render: () => (
            <Item primary={page.label} secondary="Docs" icon={page.icon} />
          ),
          navigate: () => navigate(`/docs/${page.value}`),
        })),
      ]}
      autoHighlight
      getOptionLabel={(d) => d.name}
      onChange={(e, v, reason) => {
        if (reason === "blur") return;
        v.navigate();
      }}
      sx={{
        "& label": { fontSize: "0.9rem" },
        "& .MuiOutlinedInput-root": {
          fontSize: "0.9rem",
          "& fieldset": { borderColor: (t) => t.palette.divider },
          bgcolor: (t) =>
            alpha(
              t.palette.background.default,
              t.palette.mode === "dark" ? 0.5 : 1
            ),
        },
      }}
      slotProps={{
        popupIndicator: { sx: { display: "none" } },
        popper: {
          sx: { minWidth: "min(100dvw, 480px)" },
          placement: "bottom-end",
          popperOptions: { strategy: "fixed" },
        },
      }}
      renderOption={({ key, ...props }, d) => (
        <Box key={key} {...(props as unknown as BoxProps)}>
          {d.render()}
        </Box>
      )}
      renderInput={(props) => (
        <TextField
          label={`Search ${appNameShort}...`}
          variant="outlined"
          size="small"
          fullWidth
          {...props}
        />
      )}
    />
  );
}
