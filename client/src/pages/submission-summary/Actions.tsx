import {
  ContentPasteOutlined,
  DataObjectOutlined,
  FileUploadOutlined,
  HelpOutlined,
  TableChartOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardActionArea,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useSnackbar } from "components/Snackbar";
import { useDialog } from "hooks/useDialog";
import { Grid, Prose } from "layout";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { paper } from "theme";
import { SubmissionRequestGlance } from "./SubmissionRequestGlance";
import { Tickets } from "./Tickets";
import SubmitWithApiContent from "docs/submitWithApi.mdx";
import { useSubmissionMutation } from "./useSubmissionMutation";

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
export function FileUploadDialog({ apiKey }: { apiKey?: string | number }) {
  const [dragging, setDragging] = useState(false);
  const { mutateAsync } = useSubmissionMutation({ apiKey });
  const notify = useSnackbar();
  return (
    <Stack sx={{ gap: 4, minWidth: "20vw" }}>
      <FileUploader
        multiple
        name="csv"
        types={["csv", "json", "yaml", "yml"]}
        onDraggingStateChange={setDragging}
        handleChange={(files: FileList) => {
          for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = async () => {
              notify(`Uploading ${file.name}`);
              await mutateAsync({
                content: reader.result as string,
                type: file.type,
                label: file.name,
                size: file.size,
              });
              notify("Upload done");
            };
            reader.readAsText(file);
          }
        }}
        dropMessageStyle={{ display: "none" }}
      >
        <ButtonBase
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            borderRadius: 1,
            height: 240,
            p: 4,
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
      <Tickets apiKey={apiKey} />
    </Stack>
  );
}

export function JsonApiDialog({ apiKey }: { apiKey?: string | number }) {
  return (
    <>
      <SubmissionRequestGlance apiKey={apiKey} />
      <Divider sx={{ my: 2 }} />
      Not implemented.
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
      title: "Submit via copy and paste",
      slotProps: { modal: { width: 720 } },
    }
  );
  const { open: openSpreadSheetDialog, dialog: spreadSheetDialog } = useDialog(
    FileUploadDialog,
    {
      padded: true,
      title: "Submit via upload",
      slotProps: { modal: { width: 720, variant: "default" } },
    }
  );
  return (
    <>
      <Grid gap={2} width={240}>
        {[
          {
            label: "Upload files",
            icon: <TableChartOutlined />,
            description: "Submit results as one or more CSV or JSON files",
            action: () => openSpreadSheetDialog({ apiKey }),
          },
          {
            label: "REST API",
            icon: <DataObjectOutlined />,
            description: "Programmatically submit results via the REST API",
            action: () => openRestApiDialog({ apiKey }),
          },
          {
            label: "Copy and paste",
            icon: <ContentPasteOutlined />,
            description: "Submit results as CSV or JSON",
            action: () => openJsonApiDialog({ apiKey }),
          },
        ].map((c, i) => (
          <Card key={i} onClick={() => c.action()} sx={paper(1)}>
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
      <Button sx={{ alignSelf: "flex-start" }} startIcon={<HelpOutlined />}>
        I need help submitting data
      </Button>
    </>
  );
};
