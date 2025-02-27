import { DownloadOutlined, RefreshOutlined } from "@mui-symbols-material/w400";
import { Button, Chip } from "@mui/material";

export const defaultExtras = [
  <Button key="download" startIcon={<DownloadOutlined />}>
    Download
  </Button>,
  <Button key="refresh" startIcon={<RefreshOutlined />}>
    Refresh
  </Button>,
];
export const defaultStatus = (
  <Chip sx={{ alignSelf: "flex-start" }} color="success" label="In Progress" />
);
export const defaultSummary = [
  { name: "Submitted", count: 42 },
  { name: "Validated", count: 24 },
  { name: "Failed", count: 0 },
  { name: "Not dominated", count: 5 },
];
export const defaultDetails = [
  {
    name: "Map Progress",
    stats: [
      { name: "Total", count: 2 },
      { name: "Valid", count: 2 },
      { name: "Error", count: 2 },
    ],
  },
  {
    name: "Scenario Progress",
    stats: [
      { name: "Total", count: 2 },
      { name: "Valid", count: 2 },
      { name: "Error", count: 2 },
    ],
  },
  {
    name: "Instance Progress",
    stats: [
      { name: "Total", count: 2 },
      { name: "Valid", count: 2 },
      { name: "Error", count: 2 },
    ],
  },
];
