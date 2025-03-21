import {
  ContentPasteRounded,
  DataObjectRounded,
  TableChartRounded,
  UploadFileRounded,
} from "@mui-symbols-material/w400";
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardActionArea,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { CodeBlock } from "components/CodeBlock";
import { useSnackbar } from "components/Snackbar";
import { useSurface } from "components/surface/useSurface";
import { Tip } from "components/Tip";
import { url } from "core/config";
import SubmitWithApiContent from "docs/submitWithApi.mdx";
import { Grid, Prose } from "layout";
import { find, findKey, some } from "lodash";
import { ArticleCard } from "pages/docs/ArticleCard";
import { pages } from "pages/docs/pages";
import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { paper } from "theme";
import { Tickets } from "./Tickets";
import { useSubmissionMutation } from "./useSubmissionMutation";

export function RestApiDialog({ apiKey }: { apiKey?: string | number }) {
  const page = find(pages(), { value: "how-to-submit" });
  return (
    <Stack sx={{ gap: 2, mt: -2 }}>
      <Stack>
        <Prose>
          <SubmitWithApiContent />
        </Prose>
        <CodeBlock language="plaintext">
          {`${url}/ongoing_submission/create/${apiKey}`}
        </CodeBlock>
      </Stack>
      <Stack sx={{ gap: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Read the docs
        </Typography>
        <Grid width={240}>
          <Tooltip title="Open this article in a new tab">
            <ArticleCard
              page={page}
              onClick={() => open(`/docs/${page.value}`, "_blank")}
            />
          </Tooltip>
        </Grid>
      </Stack>
    </Stack>
  );
}

const getFileType = (name: string) => {
  return findKey(
    {
      "application/json": [".json"],
      "text/csv": [".csv"],
      "application/yaml": [".yaml", ".yml"],
    },
    (extensions) =>
      some(extensions, (extension) => name.toLowerCase().endsWith(extension))
  );
};

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
                type: getFileType(file.name),
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
          <UploadFileRounded color={dragging ? "primary" : "disabled"} />
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function JsonApiDialog({ apiKey }: { apiKey?: string | number }) {
  return (
    <Typography color="text.secondary">This feature is coming soon.</Typography>
  );
}

export const Actions = ({ apiKey }: { apiKey?: string | number }) => {
  const { open: openRestApiDialog, dialog: restApiDialog } = useSurface(
    RestApiDialog,
    {
      title: "Submit via REST API",
    }
  );
  const { open: openJsonApiDialog, dialog: jsonApiDialog } = useSurface(
    JsonApiDialog,
    {
      title: "Submit via copy and paste",
    }
  );
  const { open: openSpreadSheetDialog, dialog: spreadSheetDialog } = useSurface(
    FileUploadDialog,
    {
      title: "Submit via upload",
    }
  );
  return (
    <>
      <Tip
        title="Upload data"
        description="Upload data for your algorithm. First, familiarise yourself with the submission format that we support. Then, choosing one of the three data submission methods."
        actions={
          <Button onClick={() => open("/docs/how-to-submit", "_blank")}>
            See the docs
          </Button>
        }
      />
      <Grid gap={2} width={240}>
        {[
          {
            label: "Upload files",
            icon: <TableChartRounded />,
            description: "Submit results as one or more CSV or JSON files",
            action: () => openSpreadSheetDialog({ apiKey }),
          },
          {
            label: "REST API",
            icon: <DataObjectRounded />,
            description: "Programmatically submit results via the REST API",
            action: () => openRestApiDialog({ apiKey }),
          },
          {
            label: "Copy and paste",
            icon: <ContentPasteRounded />,
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
    </>
  );
};
