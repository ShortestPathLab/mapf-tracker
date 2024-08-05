import { Stack } from "@mui/material";
import { Layout } from "layout";
import { Info } from "./Info";
import { SubmitRequestForm } from "./SubmitRequestForm";

export default function Page() {
  return (
    <Layout
      title="Submit an algorithm"
      width={1280}
      path={[{ name: "MAPF Tracker", url: "/" }]}
    >
      <Stack
        sx={{
          flexDirection: { md: "column", lg: "row" },
          alignItems: { md: "stretch", lg: "flex-start" },
          gap: 4,
        }}
      >
        <Info />
        <SubmitRequestForm />
      </Stack>
    </Layout>
  );
}
