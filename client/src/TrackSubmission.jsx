import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import { Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { Field, Form, Formik } from "formik";
import PropTypes from "prop-types";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";
import { APIConfig } from "./config";

const angle = {
  Warehouse: -40,
  City: 0,
  Empty: 50,
  Game: 110,
  Maze: 0,
  Random: 0,
  Room: -110,
};

function CustomizedLabel(props) {
  const { x, y, cx, cy, payload } = props;
  return (
    <g transform={`translate(${x + (x - cx) / 16},${y + (y - cy) / 16})`}>
      <text
        x={2}
        y={0}
        fontFamily="Roboto Slab"
        textAnchor={"middle"}
        transform={`rotate(${
          angle[payload.value] === undefined ? 0 : angle[payload.value]
        })`}
      >
        {payload.value}
      </text>
    </g>
  );
}

function descendingComparator(a, b, orderBy) {
  if (orderBy === "map_size") {
    var string_a = a[orderBy].split("x");
    var string_b = b[orderBy].split("x");
    var value_a = parseInt(string_a[0]) * parseInt(string_a[1]);
    var value_b = parseInt(string_b[0]) * parseInt(string_b[1]);
    if (value_b < value_a) {
      return -1;
    }
    if (value_b > value_a) {
      return 1;
    }
    return 0;
  } else {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "requesterName",
    numeric: false,
    disablePadding: false,
    label: "Requester Name",
    sortable: false,
    alignment: "center",
  },
  {
    id: "requesterEmail",
    numeric: false,
    disablePadding: false,
    label: "Email",
    sortable: false,
    alignment: "center",
  },

  {
    id: "algo_name",
    numeric: false,
    disablePadding: false,
    label: "Algorithm Name",
    sortable: false,
    alignment: "center",
  },
  {
    id: "requestDetails",
    numeric: false,
    disablePadding: false,
    label: "Details",
    sortable: false,
    alignment: "center",
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignment}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={!headCell.sortable}
              sx={{
                "&.MuiTableSortLabel-root": {
                  pointerEvents: headCell.sortable ? "auto" : "none",
                },
                "&.MuiTableSortLabel-root:hover": {},
                "&.Mui-active": {},
                "& .MuiTableSortLabel-icon": {},
              }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

export default function TrackSubmission() {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("map_type");
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [data, setData] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [searched, setSearched] = React.useState("");
  const navigate = useNavigate();

  const navigateToSubmissionSummary = (event) => {
    const apiKey = "dnw";
    navigate("/submissionSummary", {
      state: {
        apiKey,
      },
    });
    event.stopPropagation();
  };

  // for retriveing all the requests api insert from the user
  const [requestIdList, setRequestIdList] = React.useState([]);
  const [openRequestDetail, setOpenRequestDetail] = React.useState(false);
  const [requestData, setRequestData] = React.useState();
  const [edit, setEdit] = React.useState(false);

  const handleOpenRequestDetail = (data) => {
    setOpenRequestDetail(true);
    setRequestData(data);
  };
  const handleCloseRequestDetail = () => {
    setOpenRequestDetail(false);
  };

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
    setEdit(false);
  };

  // for searching by name or whatever
  const requestSearch = (searchedVal) => {
    const filteredRows = data.filter((row) => {
      return row.requesterName
        .toLowerCase()
        .includes(searchedVal.toLowerCase());
    });
    setRows(filteredRows);
    setSearched(searchedVal);
  };

  const cancelSearch = (searchedVal) => {
    setSearched("");
    requestSearch("");
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleApiFormSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(false);
    await checkApiKey(values.api_key);
    resetForm({ api_key: "" });
  };

  const refreshRequests = async (callback) => {
    const request_details = [];
    const fetchPromises = requestIdList.map((request_id) =>
      fetch(`${APIConfig.apiUrl}/request/id/${request_id}`, { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          request_details.push(data);
        })
        .catch((err) => console.error(err))
    );

    // Wait for all fetch operations to complete
    await Promise.all(fetchPromises);

    // Call the callback with the collected request details
    callback(request_details);
  };

  React.useEffect(() => {
    // Initial data fetch
    refreshRequests((d) => {
      setData(d);
      setRows(d);
    });

    // Set interval for periodic refresh
    const interval = setInterval(() => {
      refreshRequests((d) => {
        setData(d);
        setRows(d);
      });
    }, 1200000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [requestIdList, requestData]);
  // ----------------------------------------------------------------------------------------
  const checkApiKey = async (api_key) => {
    try {
      const response = await fetch(
        `${APIConfig.apiUrl}/submission_key/${api_key}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(response);
      if (response.ok) {
        setRequestIdList((prevList) => [...prevList, data.request_id]);
      } else {
        console.error("Error finding the submission key", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Stack sx={{ mx: "auto", gap: 4, py: 6 }}>
      <Stack sx={{ maxWidth: "960" }}>
        <PageHeader
          current="Track Submissions"
          path={[{ name: "MAPF Tracker", url: "/" }]}
        />
        <Formik initialValues={{ api_key: "" }} onSubmit={handleApiFormSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  justifyContent: "flex-end",
                }}
              >
                <Field
                  as={TextField}
                  name="api_key"
                  label="Enter your API key"
                  variant="standard"
                  required
                  sx={{ width: "250px" }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  sx={{ width: "100px", height: "35px" }}
                  disabled={isSubmitting}
                >
                  Show
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Stack>

      <Paper>
        <Stack direction="row" sx={{ p: 2, gap: 4 }}>
          <TextField
            id="outlined-basic"
            onChange={(searchVal) => requestSearch(searchVal.target.value)}
            variant="filled"
            label="Filter by requester name"
            value={searched}
            sx={{ width: 420 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterListOutlined />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searched === "" ? null : (
                    <IconButton
                      onClick={(searchVal) =>
                        cancelSearch(searchVal.target.value)
                      }
                    >
                      <CancelOutlined />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
          <Box flex={1}></Box>
          <Button
            sx={{ minWidth: "max-content" }}
            size="medium"
            onClick={() => {
              setDense(!dense);
            }}
          >
            {dense ? "Show sparse" : "Show dense"}
          </Button>
        </Stack>
        {/* ============================= start table================================  */}
        <TableContainer sx={{ width: "100%" }}>
          <Table
            // frozen table set max-content
            sx={{ minWidth: 600, width: "100%" }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
            style={{ tableLayout: "auto" }}
          >
            <colgroup>
              <col style={{ minWidth: "200px" }} width="20%" />
              <col style={{ minWidth: "200px" }} width="20%" />
              <col style={{ minWidth: "200px" }} width="15%" />
              <col style={{ minWidth: "100px" }} width="10%" />
            </colgroup>
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.id}
                      onClick={(event) => {
                        navigateToSubmissionSummary(event);
                      }}
                    >
                      <TableCell
                        id={labelId}
                        scope="row"
                        padding="normal"
                        align="center"
                      >
                        {row.requesterName}
                      </TableCell>
                      <TableCell align="center">{row.requesterEmail}</TableCell>
                      <TableCell align="center">{row.algorithmName}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenRequestDetail(row)}
                        >
                          <InfoIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={9} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <Dialog
          open={openRequestDetail}
          onClose={handleCloseRequestDetail}
          scroll="paper"
          aria-labelledby="form-dialog-title"
          fullWidth={true}
          maxWidth={"md"}
        >
          <DialogTitle id="form-dialog-title">Request Details</DialogTitle>
          <DialogContent sx={{ width: 850, display: "flex" }}>
            <Formik
              initialValues={requestData}
              onSubmit={handleRequestDetailUpdated}
            >
              {({ isSubmitting }) => (
                <Form style={{ width: "100%", marginTop: 10 }}>
                  <Box sx={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <Field
                      as={TextField}
                      name="requesterName"
                      label="Requester Name"
                      variant="standard"
                      fullWidth
                      disabled={!edit}
                    />
                    <Field
                      as={TextField}
                      name="requesterEmail"
                      label="Requester Email"
                      fullWidth
                      variant="standard"
                      disabled={!edit}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <Field
                      as={TextField}
                      name="requesterAffilation"
                      label="Affilation"
                      fullWidth
                      variant="standard"
                      disabled={!edit}
                    />
                    <Field
                      as={TextField}
                      name="authorName"
                      label="Author's Name"
                      fullWidth
                      variant="standard"
                      disabled={!edit}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <Field
                      as={TextField}
                      name="justification"
                      label="Justification"
                      variant="outlined"
                      fullWidth
                      multiline
                      disabled={!edit}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <Field
                      as={TextField}
                      name="algorithmName"
                      label="Algorithm Name"
                      fullWidth
                      variant="standard"
                      disabled={!edit}
                    />
                    <Field
                      as={TextField}
                      name="paperReference"
                      label="Paper References"
                      fullWidth
                      variant="standard"
                      disabled={!edit}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <Field
                      as={TextField}
                      name="comments"
                      label="Comments"
                      variant="outlined"
                      fullWidth
                      multiline
                      disabled={!edit}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <Field
                      as={TextField}
                      name="googleScholar"
                      type="url"
                      label="Google Scholar"
                      fullWidth
                      variant="standard"
                      disabled={!edit}
                    />
                    <Field
                      as={TextField}
                      name="dblp"
                      label="DBLP"
                      fullWidth
                      variant="standard"
                      disabled={!edit}
                    />
                    <Field
                      as={TextField}
                      name="githubLink"
                      type="url"
                      label="Github Link"
                      fullWidth
                      variant="standard"
                      disabled={!edit}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 5,
                      marginBottom: 5,
                      justifyContent: "center",
                    }}
                  >
                    {edit && (
                      <Button
                        type="submit"
                        color="primary"
                        disabled={isSubmitting}
                      >
                        Save
                      </Button>
                    )}
                    {!edit && (
                      <Button
                        type="button"
                        color="primary"
                        onClick={() => {
                          setEdit(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </Paper>
    </Stack>
  );
}
