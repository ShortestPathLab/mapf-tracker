import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EmailOutlined,
} from "@mui/icons-material";
import { Box, Stack, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "App";
import { DataGrid, makeDataGridActions } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { useSm } from "components/dialog/useSmallDisplay";
import { FlatCard } from "components/FlatCard";
import { IconCard } from "components/IconCard";
import { useSnackbar } from "components/Snackbar";
import { APIConfig } from "core/config";
import { AddKeyForm } from "forms/AddKeyForm";
import {
  SubmissionKeyRequestForm,
  SubmissionKeyRequestFormProps,
} from "forms/SubmissionKeyRequestForm";
import { DialogContentProps, useDialog } from "hooks/useDialog";
import { useNavigate } from "hooks/useNavigation";
import Layout from "layout/Layout";
import { merge, zipWith } from "lodash";
import { get } from "queries/mutation";
import { Request, useRequestsData } from "queries/useRequestQuery";
import { ReactNode } from "react";
import { useLocalStorageList } from "../../hooks/useLocalStorageList";
import { SubmissionLocationState } from "./SubmissionLocationState";

function Floating({ children }: { children?: ReactNode }) {
  const sm = useSm();
  const { spacing, zIndex } = useTheme();
  return (
    <>
      <Box
        sx={{
          visibility: sm ? "none" : "hidden",
          zIndex: zIndex.modal + 1,
          position: "fixed",
          bottom: spacing(2),
          left: spacing(2),
          right: spacing(2),
          width: "auto",
        }}
      >
        {children}
      </Box>
      <Box sx={{ visibility: sm ? "hidden" : "none" }}>{children}</Box>
    </>
  );
}

function SubmissionKeyRequestFormDialog({
  onProps,
  onClose,
  ...props
}: SubmissionKeyRequestFormProps & DialogContentProps) {
  const notify = useSnackbar();
  return (
    <Stack sx={{ mt: -2 }}>
      <SubmissionKeyRequestForm
        onTouched={() => onProps?.({ preventClose: true })}
        submit={({ isSubmitting, submitForm }) => (
          <Floating>
            <Button
              fullWidth
              sx={{ mt: 4, boxShadow: (t) => t.shadows[2] }}
              onClick={async () => {
                notify("Saving changes");
                await submitForm();
                notify("Changed saved");
                onClose?.();
              }}
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={<CheckOutlined />}
            >
              Save changes
            </Button>
          </Floating>
        )}
        {...props}
      />
    </Stack>
  );
}

export default function TrackSubmission() {
  const sm = useSm();
  const navigate = useNavigate();
  const { open: showRequestDetails, dialog: requestDetails } = useDialog(
    SubmissionKeyRequestFormDialog,
    {
      slotProps: { modal: { width: 640 } },
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

  const rows = zipWith(keys, results, (key, { data }) => ({
    ...data,
    id: key,
  }));

  const notify = useSnackbar();

  const handleRequestDetailUpdated = async ({
    key,
    id,
    ...values
  }: Request & { id: string; key: string }) => {
    try {
      const response = await fetch(`${APIConfig.apiUrl}/request/update/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (response.ok) {
        queryClient.invalidateQueries({
          queryKey: ["submissionRequestDetails", key],
        });
      } else {
        console.error("Error updating request:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    notify("Saved successfully");
  };

  const handleApiFormSubmit = async ({ key }, { resetForm }) => {
    notify("Checking your key");
    const { ok } = await checkKey(key);
    if (ok) {
      resetForm();
      push(key);
      notify("Your submission key was added");
      return;
    }
    notify("Your submission key was invalid");
  };

  // ─────────────────────────────────────────────────────────────────────

  const columns: GridColDef<Request & { id: string; key: string }>[] = [
    {
      field: "Icon",
      renderCell: () => <IconCard icon={<EmailOutlined />} />,
      flex: 0,
      fold: true,
    },
    { field: "key", headerName: "Key", width: 80 },
    {
      field: "requesterName",
      headerName: "Requester",
      width: 160,
      fold: true,
    },
    { field: "requesterEmail", headerName: "Email", width: 180, fold: true },
    { field: "algorithmName", headerName: "Algorithm", width: 180, fold: true },
    makeDataGridActions({
      items: [
        {
          icon: <EditOutlined />,
          name: "Edit request details",
          action: (row) =>
            showRequestDetails({
              initialValues: row,
              onSubmit: (values) =>
                handleRequestDetailUpdated(merge(row, values)),
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
    }),
  ];
  return (
    <Layout
      slotProps={sm && { content: { sx: { bgcolor: "background.paper" } } }}
      title="Track Submissions"
      description={
        <>
          Once you have an API key, you can upload and submit your solutions
          here. Don't have a submission (API) key?{" "}
          <Link
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/contributes")}
          >
            Request one here.
          </Link>
        </>
      }
      path={[{ name: "Home", url: "/" }]}
    >
      <Stack>
        <AddKeyForm
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
        />
      </Stack>
      <FlatCard>
        <DataGrid
          clickable
          columns={columns}
          rows={rows}
          onRowClick={({ row }) =>
            navigate<SubmissionLocationState>("/submissionSummary", {
              apiKey: row.key,
            })
          }
        />
      </FlatCard>
      {requestDetails}
    </Layout>
  );
}
