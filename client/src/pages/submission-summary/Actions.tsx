import {
  ContentPasteOutlined,
  DataObjectOutlined,
  FileUploadOutlined,
  TableChartOutlined,
} from "@mui/icons-material";
import {
  Box,
  ButtonBase,
  Card,
  CardActionArea,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { DetailsList } from "components/DetailsList";
import { useDialog } from "hooks/useDialog";
import { Grid, Prose } from "layout";
import { useRequestData } from "queries/useRequestQuery";
import SubmitWithApiContent from "./submitWithApi.mdx";
import SubmitAsCsvContent from "./submitAsCsv.mdx";
import { SubmissionRequestGlance } from "./SubmissionRequestGlance";
import { FileUploader } from "react-drag-drop-files";
import { useState } from "react";

export function RestApiDialog({ apiKey }: { apiKey?: string | number }) {
  return (
    <>
      <SubmissionRequestGlance apiKey={apiKey} />
      <Divider sx={{ my: 2 }} />
      <Prose>
        <SubmitWithApiContent apiKey={apiKey} />
      </Prose>
    </>
  );
}
export function SpreadsheetDialog({ apiKey }: { apiKey?: string | number }) {
  const [dragging, setDragging] = useState(false);
  return (
    <>
      <SubmissionRequestGlance apiKey={apiKey} />
      <Divider sx={{ my: 2 }} />
      <Prose>
        <SubmitAsCsvContent />
      </Prose>
      <FileUploader
        multiple
        name="csv"
        types={["text/csv"]}
        onDraggingStateChange={setDragging}
        dropMessageStyle={{ display: "none" }}
      >
        <ButtonBase
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            borderRadius: 1,
            height: 240,
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            border: (t) =>
              `1px solid ${
                dragging ? t.palette.primary.main : t.palette.divider
              }`,
            transition: (t) => t.transitions.create("border-color"),
          }}
        >
          <FileUploadOutlined color={dragging ? "primary" : "disabled"} />
          <Typography color="text.secondary">
            {dragging
              ? "Drop files here"
              : "Tap to choose files or drop them here"}
          </Typography>
        </ButtonBase>
      </FileUploader>
    </>
  );
}

export function JsonApiDialog({ apiKey }: { apiKey?: string | number }) {
  return (
    <>
      <SubmissionRequestGlance apiKey={apiKey} />
      <Divider sx={{ my: 2 }} />
    </>
  );
}

export const Actions = ({ apiKey }: { apiKey?: string | number }) => {
  const { open: openRestApiDialog, dialog: restApiDialog } = useDialog(
    RestApiDialog,
    {
      padded: true,
      title: "Submit via REST API",
      slotProps: { modal: { width: 720 } },
    }
  );
  const { open: openJsonApiDialog, dialog: jsonApiDialog } = useDialog(
    JsonApiDialog,
    {
      padded: true,
      title: "Submit via JSON",
      slotProps: { modal: { width: 720 } },
    }
  );
  const { open: openSpreadSheetDialog, dialog: spreadSheetDialog } = useDialog(
    SpreadsheetDialog,
    {
      padded: true,
      title: "Submit via CSV",
      slotProps: { modal: { width: 720 } },
    }
  );
  return (
    <Grid gap={2}>
      {[
        {
          label: "REST API",
          icon: <DataObjectOutlined />,
          description: "Programmatically submit results via the REST API",
          action: () => openRestApiDialog({ apiKey }),
        },
        {
          label: "Upload",
          icon: <TableChartOutlined />,
          description: "Submit results as one or more CSV or JSON files",
          action: () => openSpreadSheetDialog({ apiKey }),
        },
        {
          label: "Copy and paste",
          icon: <ContentPasteOutlined />,
          description: "Submit results as CSV or JSON",
          action: () => openJsonApiDialog({ apiKey }),
        },
      ].map((c, i) => (
        <Card key={i} onClick={() => c.action()}>
          <CardActionArea
            sx={{
              p: 2,
              height: "100%",
              justifyContent: "flex-start",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ color: "text.secondary", pb: 2 }}>{c.icon}</Box>
            <Typography variant="h6">{c.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {c.description}
            </Typography>
          </CardActionArea>
        </Card>
      ))}
      {restApiDialog}
      {spreadSheetDialog}
      {jsonApiDialog}
    </Grid>
  );
};
