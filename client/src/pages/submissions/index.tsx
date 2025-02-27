import { DeleteOutlined, UploadFileOutlined } from "@mui-symbols-material/w400";
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
import { APIConfig } from "core/config";
import { AddKeyForm } from "forms/AddKeyForm";
import { useNavigate } from "hooks/useNavigation";
import Layout from "layout/Layout";
import { zipWith } from "lodash";
import { Status } from "pages/submission-summary/Status";
import { get } from "queries/mutation";
import { Request, useRequestsData } from "queries/useRequestQuery";
import { object, string } from "yup";
import { useLocalStorageList } from "../../hooks/useLocalStorageList";
import { SubmissionLocationState } from "./SubmissionLocationState";

export function AddKey() {
  const navigate = useNavigate();
  const { mutateAsync: checkKey, isPending: isChecking } = useMutation({
    mutationFn: (key: string) =>
      get(`${APIConfig.apiUrl}/submission_key/${key}`),
    mutationKey: ["checkKey"],
  });

  const navigateToDetails = (key: string | number) =>
    navigate<SubmissionLocationState>("/submissionSummary", {
      apiKey: key,
    });
  const handleApiFormSubmit = async ({ key }, { resetForm }) => {
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
  const [keys, { push }] = useLocalStorageList<string>("submission-keys");

  const notify = useSnackbar();
  return (
    <AddKeyForm
      validationSchema={object({
        key: string()
          .required("Key is required")
          .notOneOf(keys, "Key already added")
          .length(32, "Key must be 32 characters")
          .test({
            message: "Key must only contain characters 0-9, a-f",
            test: (value) => /^[0-9a-f]+$/.test(value),
          })
          .test({
            test: async (value) => {
              const { ok } = await checkKey(value);
              return ok;
            },
            message: "Invalid key",
          }),
      })}
      key="add-key"
      onSubmit={handleApiFormSubmit}
      submit={({ isValid, isValidating }) => (
        <Button
          type="submit"
          variant="contained"
          disabled={isValidating || isChecking || !isValid}
        >
          Use this key
        </Button>
      )}
    />
  );
}

export default function TrackSubmission() {
  const navigate = useNavigate();

  const [keys, { filter }] = useLocalStorageList<string>("submission-keys");
  const results = useRequestsData(keys);

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

  // ─────────────────────────────────────────────────────────────────────
  const actions = useDataGridActions<Request & { id: string; key: string }>({
    items: [],
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
      renderCell: () => <IconCard icon={<UploadFileOutlined />} />,
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
  const header = [
    <Typography key="title" variant="h5">
      Add a key
    </Typography>,
    <Typography key="header1" color="text.secondary">
      Received your submission key? Enter it here to start submitting for your
      algorithm.
    </Typography>,
    <AddKey key="add-key" />,
    <Stack sx={{ gap: 1 }} key="description">
      <Typography variant="body2" color="text.secondary">
        An API key is a 32-character string of numbers 0-9 and lowercase letters
        a-f.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Don&apos;t have a submission (API) key? You need one to submit data.{" "}
        <Link sx={{ cursor: "pointer" }} onClick={() => navigate("/submit")}>
          Request one here.
        </Link>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Something not right?{" "}
        <Link
          sx={{ cursor: "pointer" }}
          onClick={() =>
            open(
              "https://github.com/ShortestPathLab/winter-project-mapf-tracker/issues",
              "_blank"
            )
          }
        >
          Raise an issue on Github.
        </Link>
      </Typography>
    </Stack>,
  ];
  return (
    <Layout
      flat
      title="Manage submissions and API keys"
      path={[{ name: "Home", url: "/" }]}
    >
      <Stack sx={{ gap: 2, mb: 2 }}>{header}</Stack>
      <Typography variant="h5">Previously used keys</Typography>
      <FlatCard>
        <DataGrid
          clickable
          columns={columns}
          rows={rows}
          onRowClick={({ row }) => navigateToDetails(row.key)}
        />
      </FlatCard>
    </Layout>
  );
}
