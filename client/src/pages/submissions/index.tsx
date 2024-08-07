import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EmailOutlined,
} from "@mui/icons-material";
import { Card, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useMutation } from "@tanstack/react-query";
import { DataGrid, makeDataGridActions } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { Dialog } from "components/dialog";
import { IconCard } from "components/IconCard";
import { useSnackbar } from "components/Snackbar";
import { APIConfig } from "core/config";
import { AddKeyForm } from "forms/AddKeyForm";
import { SubmissionKeyRequestForm } from "forms/SubmissionKeyRequestForm";
import { useNavigate } from "hooks/useNavigation";
import Layout from "layout/Layout";
import { zipWith } from "lodash";
import { get } from "queries/mutation";
import { Request, useRequestsData } from "queries/useRequestQuery";
import { cloneElement } from "react";
import { useLocalStorageList } from "../../hooks/useLocalStorageList";
import { SubmissionLocationState } from "./SubmissionLocationState";

export default function TrackSubmission() {
  const navigate = useNavigate();

  const { mutateAsync: checkKey, isPending: isChecking } = useMutation({
    mutationFn: (key: string) =>
      get(`${APIConfig.apiUrl}/submission_key/${key}`),
    mutationKey: ["checkKey"],
  });

  const [keys, { push, filter }] =
    useLocalStorageList<string>("submission-keys");

  const results = useRequestsData(keys);

  const rows = zipWith(keys, results, (key, { data }) => ({
    id: key,
    ...data,
  }));

  const notify = useSnackbar();

  const handleRequestDetailUpdated = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    try {
      const response = await fetch(
        `${APIConfig.apiUrl}/request/update/${values.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Request updated successfully:", data);
      } else {
        console.error("Error updating request:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setSubmitting(false);
    push("Saved successfully");
  };

  const handleApiFormSubmit = async (
    { key: key },
    { setSubmitting, resetForm }
  ) => {
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

  const columns: GridColDef<Request & { id: string }>[] = [
    {
      field: "Icon",
      renderCell: () => <IconCard icon={<EmailOutlined />} />,
      flex: 0,
    },
    { field: "id", headerName: "Key", width: 80 },
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
          render: (row, trigger) => (
            <Dialog
              slotProps={{ modal: { width: 640 } }}
              padded
              title="Edit request details"
              trigger={(onClick) => cloneElement(trigger, { onClick })}
            >
              <SubmissionKeyRequestForm
                initialValues={row}
                onSubmit={handleRequestDetailUpdated}
                submit={({ isSubmitting }) => (
                  <Button
                    fullWidth
                    sx={{ mt: 4 }}
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={<CheckOutlined />}
                  >
                    {isSubmitting ? "Saving changes..." : "Save changes"}
                  </Button>
                )}
              />
            </Dialog>
          ),
        },
      ],
      menuItems: [
        {
          icon: <DeleteOutlined />,
          name: "Remove key",
          action: (row) => filter((k) => k !== row.id),
        },
      ],
    }),
  ];
  return (
    <Layout
      width={960}
      title="Track Submissions"
      path={[{ name: "MAPF Tracker", url: "/" }]}
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
      <Typography color="text.secondary">
        Don't have a submission (API) key?{" "}
        <Link
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/contributes")}
        >
          Request one here.
        </Link>
      </Typography>
      <Card>
        <DataGrid
          slotProps={{ row: { style: { cursor: "pointer" } } }}
          columns={columns}
          rows={rows}
          onRowClick={(row) =>
            navigate<SubmissionLocationState>("/submissionSummary", {
              apiKey: row.id,
            })
          }
        />
      </Card>
    </Layout>
  );
}
