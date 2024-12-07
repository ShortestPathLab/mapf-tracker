import {
  DeleteOutlined,
  EditOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useMutation } from "@tanstack/react-query";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { Item } from "components/Item";
import { useSnackbar } from "components/Snackbar";
import {
  DataGrid,
  cellRendererText,
  useDataGridActions,
} from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { useSm } from "components/dialog/useSmallDisplay";
import { APIConfig } from "core/config";
import { AddKeyForm } from "forms/AddKeyForm";
import { useDialog } from "hooks/useDialog";
import { useNavigate } from "hooks/useNavigation";
import Layout from "layout/Layout";
import { merge, some, zipWith } from "lodash";
import { Status } from "pages/submission-summary/Status";
import { get } from "queries/mutation";
import { Request, useRequestsData } from "queries/useRequestQuery";
import { useLocalStorageList } from "../../hooks/useLocalStorageList";
import { SubmissionKeyRequestFormDialog } from "./SubmissionKeyRequestFormDialog";
import { SubmissionLocationState } from "./SubmissionLocationState";
import { handleRequestDetailUpdated } from "./handleRequestDetailUpdated";
import { topbarHeight } from "layout/topbarHeight";
import Enter from "components/dialog/Enter";

export default function TrackSubmission() {
  const sm = useSm();
  const navigate = useNavigate();
  const { open: showRequestDetails, dialog: requestDetails } = useDialog(
    SubmissionKeyRequestFormDialog,
    {
      slotProps: { modal: { width: 640, variant: "default" } },
      padded: true,
      title: "Edit request details",
    }
  );
  const { mutateAsync: checkKey, isPending: isChecking } = useMutation({
    mutationFn: (key: string) =>
      get(`${APIConfig.apiUrl}/submission_key/${key}`),
    mutationKey: ["checkKey"],
  });

  const [keys, { push, filter }] =
    useLocalStorageList<string>("submission-keys");
  const results = useRequestsData(keys);

  const isLoading = some(results, { isLoading: true });

  const rows = zipWith(keys, results, (key, { data }) => ({
    ...data,
    id: key,
  })).filter((c) => c.key);

  const notify = useSnackbar();

  function navigateToDetails(key: string | number) {
    navigate<SubmissionLocationState>("/submissionSummary", {
      apiKey: key,
    });
  }

  const handleApiFormSubmit = async ({ key }, { resetForm }) => {
    notify("Checking your key");
    const { ok } = await checkKey(key);
    if (ok) {
      resetForm();
      push(key);
      notify("Your submission key was added");
      navigateToDetails(key);
      return;
    }
    notify("Your submission key was invalid");
  };

  // ─────────────────────────────────────────────────────────────────────
  const actions = useDataGridActions<Request & { id: string; key: string }>({
    items: [
      {
        icon: <EditOutlined />,
        name: "Edit request details",
        action: (row) =>
          showRequestDetails({
            initialValues: row,
            onSubmit: (values) => {
              handleRequestDetailUpdated(merge(row, values));

              notify("Saved successfully");
            },
          }),
      },
    ],
    menuItems: [
      {
        icon: <DeleteOutlined />,
        name: "Remove key",
        action: (row) => {
          filter((k) => k !== row.key);
          notify("Removed key");
        },
      },
    ],
  });

  const columns: GridColDef<Request & { id: string; key: string }>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: () => <IconCard icon={<FileUploadOutlined />} />,
      flex: 0,
      fold: true,
    },
    {
      field: "algorithmName",
      headerName: "Algorithm",
      width: 180,
      renderCell: ({ row }) => (
        <Item secondary={row.key?.slice?.(-8)} primary={row.algorithmName} />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 220,
      renderCell: ({ row }) =>
        cellRendererText({ formattedValue: <Status apiKey={row.key} /> }),
    },
    {
      field: "requesterName",
      headerName: "Requester",
      width: 160,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "requesterEmail",
      headerName: "Email",
      width: 200,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "requesterAffiliation",
      headerName: "Affiliation",
      width: 180,
      fold: true,
      renderCell: cellRendererText,
    },
    actions,
  ];
  const minimal = !sm && !rows.length;
  const header = [
    <AddKeyForm
      key="add-key"
      keys={keys}
      onSubmit={handleApiFormSubmit}
      submit={({ isValid }) => (
        <Button
          type="submit"
          variant="contained"
          disabled={isChecking || !isValid}
        >
          {isChecking ? "Checking key" : "Add key"}
        </Button>
      )}
    />,
    <Typography variant="body2" color="text.secondary" key="no-key">
      Don&apos;t have a submission (API) key? You need one to submit data.{" "}
      <Link sx={{ cursor: "pointer" }} onClick={() => navigate("/contributes")}>
        Request one here.
      </Link>
    </Typography>,
  ];
  const table = [
    <FlatCard key="table">
      <DataGrid
        clickable
        columns={columns}
        rows={rows}
        onRowClick={({ row }) => navigateToDetails(row.key)}
      />
    </FlatCard>,
  ];
  return (
    !isLoading && (
      <Layout
        slotProps={sm && { content: { sx: { bgcolor: "background.paper" } } }}
        title="My submissions"
        path={[{ name: "Submit", url: "/submit" }]}
        render={minimal ? ({ children }) => children : undefined}
      >
        {minimal ? (
          <Enter in>
            <Stack
              sx={{
                m: sm ? -2 : -3,
                alignItems: "center",
                height: `calc(100dvh - ${topbarHeight(sm)}px)`,
                justifyContent: "center",
              }}
            >
              <Stack sx={{ gap: 4, p: 2, alignItems: "center", mb: 8 }}>
                <Typography variant="h2">Submit data to the tracker</Typography>
                <Stack
                  sx={{
                    textAlign: "center",
                    width: 720,
                    maxWidth: "100%",
                    gap: 4,
                  }}
                >
                  {header}
                </Stack>
              </Stack>
            </Stack>
          </Enter>
        ) : (
          <>
            <Stack sx={{ gap: 2, mb: 2 }}>{header}</Stack>
            {table}
          </>
        )}
        {requestDetails}
      </Layout>
    )
  );
}
