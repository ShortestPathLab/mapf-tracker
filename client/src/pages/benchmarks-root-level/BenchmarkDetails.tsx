import { Box, Link, List, ListItem, ListItemText } from "@mui/material";
import Grid from "layout/Grid";
import { useMapDataByName } from "queries/useBenchmarksQuery";
import { downloadBenchmarks } from "./download";

export default function BenchmarkDetails({
  benchmark,
}: {
  benchmark?: string;
}) {
  const { data } = useMapDataByName(benchmark);

  const items = [
    { label: "Name", content: data?.map_name },
    {
      label: "Download benchmark",
      content: (
        <Link href="#" onClick={() => downloadBenchmarks(data)}>
          {`${data?.map_name}.zip`}
        </Link>
      ),
    },
    { label: "Scenario count", content: data?.scens },
    { label: "Instance count", content: data?.instances },
    { label: "Snapshot date", content: Date() },
    {
      label: "Original link",
      wordBreak: "break-all",
      content: <Link href={data?.original_link}>{data?.original_link}</Link>,
    },
    { label: "References", content: data?.papers },
  ];

  return (
    <Grid>
      <Box sx={{ p: 2 }}>
        <Box
          component="img"
          sx={{ borderRadius: 1, width: "100%", maxWidth: 320 }}
          src={`/mapf-svg/${data?.map_name}.svg`}
        />
      </Box>
      <List>
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              secondary={item.label}
              primary={item.content}
              sx={{ overflow: "hidden", wordBreak: item.wordBreak ?? "normal" }}
            />
          </ListItem>
        ))}
      </List>
    </Grid>
  );
}
