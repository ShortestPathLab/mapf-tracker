import CancelIcon from "@mui/icons-material/CancelOutlined";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import LibraryAddIcon from "@mui/icons-material/LibraryAddOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import SendIcon from "@mui/icons-material/Send";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMapOutlined";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMapOutlined";
import { DialogTitle, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { Field, Form, Formik } from "formik";
import { useConfirm } from "material-ui-confirm";
import PropTypes from "prop-types";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";
import { APIConfig } from "./config";
import PageHeader from "./PageHeader";

const infoDescriptionText = {
  "domainCompare-#Instances Closed": {
    description:
      "This plot compares the number of instances closed " +
      "between selected algorithm and the state-of-the-art (i.e., all algorithms together) across different domains of the benchmark. " +
      "For a particular algorithm, the instance is closed if the algorithm reports the same lower bound and solution cost. " +
      "Algorithms that do not report lower bound data are omitted from this plot. " +
      "The number of instances closed indicates the performance of algorithms for finding and proving optimal solution (i.e., higher the better). ",
    c_axis:
      "The benchmark contains many different maps, each map is associate with domain. " +
      "The category-axis displays the names of the domains available in the benchmark.",
    v_axis:
      "The value-axis displays the number of instances closed for each domain. " +
      "The percentage ratio is shown, calculated based on the total number of instances in each domain.",
  },
  "domainCompare-#Instances Solved": {
    description:
      "This plot compares the number of instances solved " +
      "between selected algorithm and the state-of-the-art (i.e., all algorithms together) across different domains of the benchmark. " +
      "The number of instances solved indicates the performance of algorithms while ignoring solution quality (i.e., higher the better).",
    c_axis:
      "The benchmark contains many different maps, each map is associate with domain. " +
      "The category-axis displays the names of the domains available in the benchmark.",
    v_axis:
      "The value-axis displays the number of instances solved for each domain. " +
      "The percentage ratio is shown, calculated based on the total number of instances in each domain.",
  },
  "domainCompare-#Best Lower-bounds": {
    description:
      "This plot compares the number of instances that have achieved the best lower bound (reported by any algorithm) " +
      "between selected algorithm and the state-of-the-art (i.e., all algorithms together) across different domains of the benchmark. " +
      "The number of instances that achieve the best lower bound reflects the availability of algorithms for proving optimality (i.e., higher the better). " +
      "Algorithms that do not report lower bound data are omitted from this plot.",
    c_axis:
      "The benchmark contains many different maps, each map is associate with domain. " +
      "The category-axis displays the names of the domains available in the benchmark.",
    v_axis:
      "The value-axis displays the number of instances that have achieved the best lower bound for each domain. " +
      "The percentage ratio is shown, calculated based on the total number of instances in each domain. ",
    // "For instances where no lower bound is reported, no algorithm can achieve the best lower bound in such cases."
  },
  "domainCompare-#Best Solutions": {
    description:
      "This plot compares the number of instances that have achieved the best solution (reported by any algorithm) " +
      "between selected algorithm and the state-of-the-art (i.e., all algorithms together) across different domains of the benchmark. " +
      "The number of instances achieving the best solution reflects the solution quality reported by different algorithms (i.e., higher the better). ",
    c_axis:
      "The benchmark contains many different maps, each map is associate with domain. " +
      "The category-axis displays the names of the domains available in the benchmark.",
    v_axis:
      "The value-axis displays the number of instances that have achieved the best solution for each domain. " +
      "The percentage ratio is shown, calculated based on the total number of instances in each domain. ",
    // "For instances where no solution is reported, no algorithm can achieve the best solution in such cases."
  },
};
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
    const string_a = a[orderBy].split("x");
    const string_b = b[orderBy].split("x");
    const value_a = parseInt(string_a[0]) * parseInt(string_a[1]);
    const value_b = parseInt(string_b[0]) * parseInt(string_b[1]);
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
    id: "requestDetails",
    numeric: false,
    disablePadding: false,
    label: "Details",
    sortable: false,
    alignment: "center",
  },
  {
    id: "isApproved",
    numeric: false,
    disablePadding: false,
    label: "Status",
    sortable: true,
    alignment: "center",
  },
  {
    id: "sendResults",
    numeric: false,
    disablePadding: false,
    label: "Send Results",
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
            sx={{}}
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
                "& .MuiTableSortLabel-icon": {
                  color: "white !important",
                },
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

async function checkNameExist(id, name) {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": JSON.parse(localStorage.getItem("user")).accessToken,
    },
    body: JSON.stringify({
      algo_name: name,
    }),
  };
  if (name === "") {
    return false;
  }
  const response = await fetch(
    APIConfig.apiUrl + "/user/checkAlgo/" + id,
    requestOptions
  ).catch((err) => console.log(err));
  return response.status === 200;
}

const refreshAlgorithms = (callback) => {
  const requestOptions = {
    method: "GET",
    headers: {
      "x-access-token": JSON.parse(localStorage.getItem("user")).accessToken,
    },
  };

  // console.log(JSON.parse(localStorage.getItem('user')).id)
  fetch(
    APIConfig.apiUrl +
      "/userAlgo/" +
      JSON.parse(localStorage.getItem("user")).id,
    requestOptions
  )
    .then((response) => response.json())
    .then((data) => {
      callback(data);
    })
    .catch((err) => console.error(err));
};

const refreshRequests = (callback) => {
  const requestOptions = {
    method: "GET",
  };
  // console.log(JSON.parse(localStorage.getItem('user')).id)
  fetch(APIConfig.apiUrl + "/request/", requestOptions)
    .then((response) => response.json())
    .then((data) => {
      callback(data);
    })
    .catch((err) => console.error(err));
};


export default function Dashboard() {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("map_type");
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [data, setData] = React.useState([]);
  // const [csvData, setCsvData] = React.useState([]);
  // // const [csvFilename, setCsvFilename] = React.useState([]);
  // const csvLinkEl = useRef();
  // const [query_id, setQuery_id] = React.useState('');
  // const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [searched, setSearched] = React.useState("");
  const [openAlgoDetail, setOpenAlgoDetail] = React.useState(false);
  const [openAlgoModify, setOpenAlgoModify] = React.useState(false);
  const [scrollAlgoDetail, setScrollAlgoDetail] = React.useState("paper");
  const [domainQuery, setDomainQuery] = React.useState("#Instances Closed");
  const [algodata, setAlgodata] = React.useState([]);
  const [algoChartData, setAlgoChartData] = React.useState([]);
  const [openAlgoCreate, setOpenAlgoCreate] = React.useState(false);
  const [domainLoading, setDomainLoading] = React.useState(true);
  const [openMonitorDetail, setOpenMonitorDetail] = React.useState(false);
  const [infoDescription, setInfoDescription] = React.useState(0);

  // for open request details -------------=================================
  const [openRequestDetail, setOpenRequestDetail] = React.useState(false);
  const [requestData, setRequestData] = React.useState();

  const handleOpenRequestDetail = (event, data) => {
    setOpenRequestDetail(true);
    setRequestData(data);
    event.stopPropagation();
  };
  const handleCloseRequestDetail = () => {
    setOpenRequestDetail(false);
  };

  const handleRequestDetailUpdated = async (values, { setSubmitting }) => {
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
    handleCloseRequestDetail();
  };


  const handleStatusUpdated = (requestData, status)=>{
    

  }

  // for open send results -------------=================================
  const [submissionKey, setSubmissionKey] = React.useState();
  const [openSendResults, setOpenSendResults] = React.useState(false);
  const handleOpenSendResults = (event, data) => {
    setOpenSendResults(true);
    setRequestData(data);
    // check api keys exists
    if (data.reviewStatus.status === "Approved") {
      findSubmissionKey(data.id);
    }
    event.stopPropagation();
  };
  const handleCloseSendResults = () => {
    setOpenSendResults(false);
  };

  const findSubmissionKey = async (req_id) => {
    try {
      const response = await fetch(
        `${APIConfig.apiUrl}/submission_key/find/${req_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log("API keys found successfully:", data);
        console.log(data[0]);
        setSubmissionKey(data[0]);
      } else {
        console.error("Error updating request:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //=================================================================
  const handleOpenInfo = (key) => {
    setInfoDescription(infoDescriptionText[key]);
    setOpenMonitorDetail(true);
  };
  const confirm = useConfirm();

  const requestSearch = (searchedVal) => {
    const filteredRows = data.filter((row) => {
      return row.algo_name.toLowerCase().includes(searchedVal.toLowerCase());
    });
    setRows(filteredRows);
    setSearched(searchedVal);
  };

  const cancelSearch = (searchedVal) => {
    setSearched("");
    requestSearch("");
  };

  React.useEffect(() => {
    refreshRequests((data) => {
      setData(data);
      setRows(data);
    });

    const interval = setInterval(() => {
      refreshRequests((data) => {
        setData(data);
        setRows(data);
      });
    }, 12000);
    return () => clearInterval(interval);
  }, [data]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // var valid = false;
    checkNameExist(algodata.id, data.get("algoName")).then((result) => {
      if (result) {
        const requestOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": JSON.parse(localStorage.getItem("user"))
              .accessToken,
          },
          body: JSON.stringify({
            algo_name: data.get("algoName"),
            authors: data.get("algoAuthor"),
            github: data.get("algoGit"),
            papers: data.get("algoPaper"),
            comments: data.get("algoComments"),
          }),
        };
        // console.log(JSON.parse(localStorage.getItem('user')).id)
        fetch(
          APIConfig.apiUrl + "/user/updateAlgo/" + algodata.id,
          requestOptions
        )
          .then((response) => {
            if (response.status === 200) {
              // alert("Algorithm was updated successfully.")
              confirm({
                title: "",
                description: "Algorithm was updated successfully",
                cancellationButtonProps: { sx: { display: "none" } },
                dialogProps: { fullWidth: true, maxWidth: "xs" },
              });
              // setConfirmOpen(true);
              refreshAlgorithms((data) => {
                setData(data);
                setRows(data);
              });
              setOpenAlgoModify(false);
            }
          })
          .catch((err) => console.error(err));
      } else {
        confirm({
          title: "",
          description: `Invalid algorithm name: ${data.get("algoName")}`,
          cancellationButtonProps: { sx: { display: "none" } },
          dialogProps: { fullWidth: true, maxWidth: "xs" },
        });
      }
    });
  };

  const handleCreationSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // var valid = false;
    checkNameExist("-1", data.get("algoName")).then((result) => {
      if (result) {
        const requestOptions = {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": JSON.parse(localStorage.getItem("user"))
              .accessToken,
          },
          body: JSON.stringify({
            algo_name: data.get("algoName"),
            authors: data.get("algoAuthor"),
            github: data.get("algoGit"),
            papers: data.get("algoPaper"),
            comments: data.get("algoComments"),
            user_id: JSON.parse(localStorage.getItem("user")).id,
          }),
        };
        fetch(APIConfig.apiUrl + "/user/createAlgo/", requestOptions)
          .then((response) => {
            if (response.status === 200) {
              // alert("Algorithm was updated successfully.")
              confirm({
                title: "",
                description: "Algorithm was created successfully",
                cancellationButtonProps: { sx: { display: "none" } },
                dialogProps: { fullWidth: true, maxWidth: "xs" },
              });
              // setConfirmOpen(true);
              refreshAlgorithms((data) => {
                setData(data);
                setRows(data);
              });
              setOpenAlgoCreate(false);
            }
          })
          .catch((err) => console.error(err));
      } else {
        confirm({
          title: "",
          description: `Invalid algorithm name: ${data.get("algoName")}`,
          cancellationButtonProps: { sx: { display: "none" } },
          dialogProps: { fullWidth: true, maxWidth: "xs" },
        });
      }
    });
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

  // const handleChangeDense = () => {
  //     setDense(!dense);
  // };

  const navigate = useNavigate();

  const navigateToMaps = (event, algo_id, algo_name) => {
    // 👇️ navigate to /contacts
    // // console.log(id)
    // console.log(event.target);
    // console.log(event.target.getAttribute('type'));
    navigate("/user/maps", {
      state: { algo_id, algo_name },
      replace: false,
    });
    event.stopPropagation();
    // state={instance_id : id}, replace: false});
  };

  const handleSendButtonOnClick = async ()=>{
    // create the data first 
    const values = {
      requesterName: requestData.requesterName, 
      requesterEmail: requestData.requesterEmail, 
      status : requestData.reviewStatus.status,
      comments : requestData.reviewStatus.comments,
      api_key : requestData.reviewStatus.status === "Approved" ? submissionKey.api_key : undefined
    }
    console.log(values)

    // send email to the user
    try {
      const response = await fetch(
        `${APIConfig.apiUrl}/user/sendMail`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": JSON.parse(localStorage.getItem("user"))
            .accessToken,
          },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Email was sent : ", data);
        alert('Email was sent !')
      } else {
        console.error("Error sending email: ", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    
  }

  const handleAlgoModifyClose = () => {
    setOpenAlgoModify(false);
  };

  const handleAlgoDetailClose = () => {
    setOpenAlgoDetail(false);
    setDomainQuery("#Instances Closed");
  };
  React.useEffect(() => {
    if (openAlgoDetail) {
      setDomainLoading(true);
      fetch(
        APIConfig.apiUrl + "/algorithm/getClosedInfoGroup/" + algodata["id"],
        { method: "GET" }
      )
        .then((res) => res.json())
        .then((data) => {
          data.forEach(function (element) {
            if (element[algodata.algo_name] === undefined) {
              element[algodata.algo_name] = 0;
            }
            element.name =
              element.name.charAt(0).toUpperCase() + element.name.slice(1);
          });
          setAlgoChartData(data);
          setDomainLoading(false);
        })
        .catch((err) => console.error(err));
    }
  }, [openAlgoDetail]);

  const handleDomainQueryChange = (event) => {
    setDomainQuery(event.target.value);
    setDomainLoading(true);
    let domain_API = "";
    if (event.target.value === "#Instances Closed") {
      domain_API =
        APIConfig.apiUrl + "/algorithm/getClosedInfoGroup/" + algodata["id"];
    } else if (event.target.value === "#Instances Solved") {
      domain_API =
        APIConfig.apiUrl + "/algorithm/getSolvedInfoGroup/" + algodata["id"];
    } else if (event.target.value === "#Best Lower-bounds") {
      domain_API =
        APIConfig.apiUrl + "/algorithm/getLowerInfoGroup/" + algodata["id"];
    } else {
      domain_API =
        APIConfig.apiUrl + "/algorithm/getSolutionInfoGroup/" + algodata["id"];
    }
    fetch(domain_API, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        data.forEach(function (element) {
          if (element[algodata.algo_name] === undefined) {
            element[algodata.algo_name] = 0;
          }
          element.name =
            element.name.charAt(0).toUpperCase() + element.name.slice(1);
        });
        setAlgoChartData(data);
        setDomainLoading(false);
      })
      .catch((err) => console.error(err));
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Stack sx={{ mx: "auto", width: 1488, maxWidth: "100%", gap: 4, py: 6 }}>
      <PageHeader
        current="Dashboard"
        path={[{ name: "MAPF Tracker", url: "/" }]}
      />
      <Paper>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          }}
        >
          <IconButton
            size="medium"
            onClick={() => {
              setDense(!dense);
            }}
          >
            {dense ? (
              <ZoomOutMapIcon fontSize="medium" />
            ) : (
              <ZoomInMapIcon fontSize="medium" />
            )}
          </IconButton>

          <IconButton
            size="medium"
            onClick={() => {
              setOpenAlgoCreate(true);
            }}
          >
            <LibraryAddIcon fontSize="medium" />
          </IconButton>

          <Typography
            sx={{ flex: "1 1 100%", paddingLeft: "10px" }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            All Requests
          </Typography>
          <TextField
            id="outlined-basic"
            onChange={(searchVal) => requestSearch(searchVal.target.value)}
            variant="outlined"
            placeholder="Name"
            size="small"
            value={searched}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
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
                      <CancelIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Toolbar>
        {/*-------------------------------------  start table here------------------------------------------ */}
        <TableContainer sx={{ width: "100%" }}>
          <Table
            // frozen table set max-content
            sx={{ width: "100%" }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
            style={{ tableLayout: "auto" }}
          >
            <colgroup>
              <col style={{ minWidth: "200px" }} width="15%" />
              <col style={{ minWidth: "200px" }} width="15%" />
              <col style={{ minWidth: "100px" }} width="15%" />
              <col style={{ minWidth: "100px" }} width="15%" />
              <col style={{ minWidth: "100px" }} width="15%" />
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
                      sx={{ cursor: "pointer" }}
                      hover
                      tabIndex={-1}
                      key={row.id}
                      onClick={(event) =>
                        navigateToMaps(event, row.id, row.algo_name)
                      }
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
                      <TableCell align="center">
                        <IconButton
                          onClick={(event) =>
                            handleOpenRequestDetail(event, row)
                          }
                        >
                          <InfoIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                      <Select
                        name="reviewStatus.status"
                        labelId="status-label"
                        value={row.reviewStatus.status}
                        sx={{
                          color: "white",
                            backgroundColor:
                              row.reviewStatus.status === "Approved"
                                ? "green"
                                : row.reviewStatus.status === "Rejected"
                                ? "red"
                                : "grey",
                          
                        }}
                        onChange={handleStatusUpdated(row)}
                      >
                        <MenuItem value="Not Reviewed">Not Reviewed</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(event) => handleOpenSendResults(event, row)}
                        >
                          <SendIcon />
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
        {/* -------------------for openning request details-------------------- */}
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
                      disabled={true}
                    />
                    <Field
                      as={TextField}
                      name="requesterEmail"
                      label="Requester Email"
                      fullWidth
                      variant="standard"
                      disabled={true}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <Field
                      as={TextField}
                      name="requesterAffilation"
                      label="Affilation"
                      fullWidth
                      variant="standard"
                      disabled={true}
                    />
                    <Field
                      as={TextField}
                      name="authorName"
                      label="Author's Name"
                      fullWidth
                      variant="standard"
                      disabled={true}
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
                      disabled={true}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <Field
                      as={TextField}
                      name="algorithmName"
                      label="Algorithm Name"
                      fullWidth
                      variant="standard"
                      disabled={true}
                    />
                    <Field
                      as={TextField}
                      name="paperReference"
                      label="Paper References"
                      fullWidth
                      variant="standard"
                      disabled={true}
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
                      disabled={true}
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
                      disabled={true}
                    />
                    <Field
                      as={TextField}
                      name="dblp"
                      label="DBLP"
                      fullWidth
                      variant="standard"
                      disabled={true}
                    />
                    <Field
                      as={TextField}
                      name="githubLink"
                      type="url"
                      label="Github Link"
                      fullWidth
                      variant="standard"
                      disabled={true}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 5, marginBottom: 5 }}>
                    <FormControl fullWidth variant="standard">
                      <InputLabel id="status-label">Approval Status</InputLabel>
                      <Field
                        as={Select}
                        name="reviewStatus.status"
                        labelId="status-label"
                      >
                        <MenuItem value="Not Reviewed">Not Reviewed</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </Field>
                    </FormControl>
                    <Field
                      as={TextField}
                      name="reviewStatus.comments"
                      label="Comments"
                      variant="outlined"
                      fullWidth
                      multiline
                    />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      Save
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>

        {/* -------------------for openning send results-------------------- */}
        <Dialog
          open={openSendResults}
          onClose={handleCloseSendResults}
          scroll="paper"
          aria-labelledby="admin-dialog-title"
          fullWidth={true}
          maxWidth={"md"}
        >
          <DialogTitle id="admin-dialog-title">Send Results</DialogTitle>
          <DialogContent
            sx={{
              width: 850,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {requestData ? (
              <>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Email:{" "}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap", // Allow wrapping at whitespace
                    }}
                  >
                    {requestData.requesterEmail}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Status:
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      color: "white",
                      backgroundColor:
                        requestData.reviewStatus.status === "Approved"
                          ? "green"
                          : requestData.reviewStatus.status === "Rejected"
                          ? "red"
                          : "grey",
                    }}
                  >
                    {requestData.reviewStatus.status === "Approved"
                      ? "Approved"
                      : requestData.reviewStatus.status === "Rejected"
                      ? "Rejected"
                      : "Not Reviewed"}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Comments:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      width: "500px", // Set a fixed width
                      whiteSpace: "pre-wrap", // Allow wrapping at whitespace
                      overflowWrap: "break-word", // Break long words if necessary
                    }}
                  >
                    {requestData.reviewStatus.comments}
                  </Typography>
                </Box>
                {requestData.reviewStatus.status === "Approved" &&
                  submissionKey && (
                    <TableContainer
                      component={Paper}
                      sx={{ marginTop: 2, boxShadow: 3 }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              API Key
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Creation Date
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              Expiration Date
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow key={submissionKey}>
                            <TableCell>{submissionKey.api_key}</TableCell>
                            <TableCell>
                              {new Date(
                                submissionKey.creationDate
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                submissionKey.expirationDate
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 100,
                  }}
                >
                  <Button
                    variant="contained"
                    style={{ width: "200px" }}
                    endIcon={<SendIcon />}
                    onClick={handleSendButtonOnClick}
                  >
                    Send
                  </Button>
                </Box>
              </>
            ) : (
              <Typography variant="body1">No data available.</Typography>
            )}
          </DialogContent>
        </Dialog>
        {/* -------------------for openning alg details-------------------- */}

        <Dialog
          open={openAlgoDetail}
          onClose={handleAlgoDetailClose}
          scroll={scrollAlgoDetail}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
          fullWidth={true}
          maxWidth={"md"}
          disableScrollLock={true}
          PaperProps={{
            style: { mb: 2, borderRadius: 10 },
          }}
          // PaperProps={{ sx: { width: "100%"}}}
        >
          <DialogContent
            dividers={scrollAlgoDetail === "paper"}
            sx={{ width: 850, display: "flex" }}
          >
            <Table sx={{ width: 500 }}>
              <colgroup>
                {/*<col width="120" />*/}
                {/*<col width="150" />*/}
                {/*<col width="65" />*/}
                {/*<col width="200" />*/}
                <col width="120" />
                <col width="150" />
                <col width="50" />
                <col width="150" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                    Algorithm Name:
                  </TableCell>
                  <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                    {" "}
                    {algodata.algo_name}
                  </TableCell>
                  <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                    {" "}
                    Authors:{" "}
                  </TableCell>
                  <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                    {" "}
                    {algodata.authors}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                    {" "}
                    Github Link:{" "}
                  </TableCell>
                  <TableCell
                    style={{ paddingRight: 0, paddingLeft: 0 }}
                    colSpan={3}
                  >
                    <Link href={algodata.github} underline="hover">
                      {algodata.github}
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{
                      paddingRight: 0,
                      paddingLeft: 0,
                      verticalAlign: "top",
                    }}
                  >
                    {" "}
                    Paper Reference:{" "}
                  </TableCell>
                  <TableCell
                    style={{
                      paddingRight: 0,
                      paddingLeft: 0,
                      verticalAlign: "top",
                    }}
                    colSpan={3}
                  >
                    {" "}
                    {algodata.papers}{" "}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{
                      paddingRight: 0,
                      paddingLeft: 0,
                      verticalAlign: "top",
                    }}
                  >
                    {" "}
                    Comments:{" "}
                  </TableCell>
                  <TableCell
                    style={{
                      paddingRight: 0,
                      paddingLeft: 0,
                      verticalAlign: "top",
                    }}
                    colSpan={3}
                  >
                    {" "}
                    {algodata.comments}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {/*<ResponsiveContainer width={500} height={380}>*/}
            <div style={{ width: 30 }} />
            {/*<Paper   sx={{  width : 350, height: 464, mb: 2, }}>*/}
            <Box sx={{ width: 350, height: 464 }}>
              <Toolbar
                sx={{
                  pl: { sm: 2 },
                  pr: { xs: 1, sm: 1 },
                }}
              >
                <Typography
                  sx={{ flex: "1 1 100%" }}
                  variant="h8"
                  id="tableTitle"
                  component="div"
                >
                  Summary
                  <IconButton
                    onClick={() => {
                      handleOpenInfo(`domainCompare-${domainQuery}`);
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                </Typography>
                <FormControl
                  sx={{ m: 1, minWidth: 120, width: 300 }}
                  size="small"
                >
                  <Select
                    displayEmpty={true}
                    value={domainQuery}
                    onChange={handleDomainQueryChange}
                    inputProps={{ "aria-label": "Without label" }}
                  >
                    <MenuItem value={"#Instances Closed"}>
                      Instances Closed
                    </MenuItem>
                    <MenuItem value={"#Instances Solved"}>
                      Instances Solved
                    </MenuItem>
                    <MenuItem value={"#Best Lower-bounds"}>
                      Best Lower Bound
                    </MenuItem>
                    <MenuItem value={"#Best Solutions"}>Best Solution</MenuItem>
                  </Select>
                </FormControl>
              </Toolbar>
              {domainLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  width={350}
                  height={400}
                >
                  <CircularProgress size={80} />
                </Box>
              ) : (
                <RadarChart
                  width={350}
                  height={400}
                  cx="50%"
                  cy="60%"
                  outerRadius="80%"
                  data={algoChartData}
                >
                  {/*<text x="50%" y="0" dominantBaseline="hanging" fontSize="20"  textAnchor={'middle'} style = {{ fontFamily: "Roboto Slab" }}>Solution</text>*!/*/}
                  <Legend
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{
                      fontFamily: "Roboto Slab",
                    }}
                  />
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={<CustomizedLabel />}
                    style={{
                      fontFamily: "Roboto Slab",
                    }}
                  />
                  <Tooltip
                    wrapperStyle={{ fontFamily: "Roboto Slab" }}
                    formatter={(tick) => {
                      const value = tick * 100;
                      return `${value.toFixed(2)}%`;
                    }}
                  />
                  <PolarRadiusAxis
                    angle={38.5}
                    domain={[0, algoChartData.length > 0 ? "dataMax" : 1]}
                    tickFormatter={(tick) => {
                      const value = tick * 100;
                      return `${value.toFixed(0)}%`;
                    }}
                  />
                  <Radar
                    key={"State of The Art"}
                    dataKey={"State of The Art"}
                    fillOpacity={0.6}
                    stroke={`#87ceeb`}
                    fill={`#87ceeb`}
                  />
                  <Radar
                    key={algodata.algo_name}
                    dataKey={algodata.algo_name}
                    fillOpacity={0.6}
                    stroke={`#ff4500`}
                    fill={`#ff4500`}
                  />
                </RadarChart>
              )}
            </Box>
            {/*</Paper>*/}
            {/*</ResponsiveContainer>*/}
          </DialogContent>
          {/*<DialogActions>*/}
          {/*    <Button onClick={handleAlgoDetailClose}>Cancel</Button>*/}
          {/*</DialogActions>*/}
        </Dialog>

        <Dialog
          open={openAlgoModify}
          onClose={handleAlgoModifyClose}
          scroll={scrollAlgoDetail}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
          // fullWidth={true}
          maxWidth={"md"}
          disableScrollLock={true}
          PaperProps={{
            style: { mb: 2, borderRadius: 10 },
          }}
          // PaperProps={{ sx: { width: "100%"}}}
        >
          <DialogContent
            dividers={scrollAlgoDetail === "paper"}
            sx={{ width: 470, display: "flex" }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <Table sx={{ width: 470 }}>
                <colgroup>
                  <col width="120" />
                  <col width="150" />
                  <col width="50" />
                  <col width="150" />
                </colgroup>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                      Algorithm Name:
                    </TableCell>
                    <TableCell style={{ paddingRight: 10, paddingLeft: 10 }}>
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoName"
                        name="algoName"
                        size="small"
                        autoFocus
                        multiline
                        maxRows={1}
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                        defaultValue={algodata.algo_name}
                      />
                    </TableCell>
                    <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                      {" "}
                      Authors:{" "}
                    </TableCell>
                    <TableCell style={{ paddingRight: 10, paddingLeft: 10 }}>
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoAuthor"
                        name="algoAuthor"
                        size="small"
                        autoFocus
                        multiline
                        maxRows={1}
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                        defaultValue={algodata.authors}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                      {" "}
                      Github Link:{" "}
                    </TableCell>
                    <TableCell
                      style={{ paddingRight: 10, paddingLeft: 10 }}
                      colSpan={3}
                    >
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoGit"
                        name="algoGit"
                        size="small"
                        autoFocus
                        multiline
                        maxRows={1}
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                        defaultValue={algodata.github}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                    >
                      {" "}
                      Paper Reference:{" "}
                    </TableCell>
                    <TableCell
                      style={{
                        paddingRight: 10,
                        paddingLeft: 10,
                        verticalAlign: "top",
                      }}
                      colSpan={3}
                    >
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoPaper"
                        name="algoPaper"
                        maxRows={4}
                        size="small"
                        autoFocus
                        multiline
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                        defaultValue={algodata.papers}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                    >
                      {" "}
                      Comments:{" "}
                    </TableCell>
                    <TableCell
                      style={{
                        paddingRight: 10,
                        paddingLeft: 10,
                        verticalAlign: "top",
                      }}
                      colSpan={3}
                    >
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoComments"
                        name="algoComments"
                        maxRows={4}
                        size="small"
                        autoFocus
                        multiline
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                        defaultValue={algodata.comments}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Button
                type="submit"
                // fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
                style={{ float: "right" }}
              >
                Save Changes
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openAlgoCreate}
          onClose={() => {
            setOpenAlgoCreate(false);
          }}
          scroll={scrollAlgoDetail}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
          // fullWidth={true}
          maxWidth={"md"}
          disableScrollLock={true}
          PaperProps={{
            style: { mb: 2, borderRadius: 10 },
          }}
          // PaperProps={{ sx: { width: "100%"}}}
        >
          <DialogContent
            dividers={scrollAlgoDetail === "paper"}
            sx={{ width: 470, display: "flex" }}
          >
            <Box
              component="form"
              onSubmit={handleCreationSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <Table sx={{ width: 470 }}>
                <colgroup>
                  <col width="120" />
                  <col width="150" />
                  <col width="50" />
                  <col width="150" />
                </colgroup>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                      Algorithm Name:
                    </TableCell>
                    <TableCell style={{ paddingRight: 10, paddingLeft: 10 }}>
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoName"
                        name="algoName"
                        size="small"
                        autoFocus
                        multiline
                        maxRows={1}
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                      />
                    </TableCell>
                    <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                      {" "}
                      Authors:{" "}
                    </TableCell>
                    <TableCell style={{ paddingRight: 10, paddingLeft: 10 }}>
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoAuthor"
                        name="algoAuthor"
                        size="small"
                        autoFocus
                        multiline
                        maxRows={1}
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingRight: 0, paddingLeft: 0 }}>
                      {" "}
                      Github Link:{" "}
                    </TableCell>
                    <TableCell
                      style={{ paddingRight: 10, paddingLeft: 10 }}
                      colSpan={3}
                    >
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoGit"
                        name="algoGit"
                        size="small"
                        autoFocus
                        multiline
                        maxRows={1}
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                    >
                      {" "}
                      Paper Reference:{" "}
                    </TableCell>
                    <TableCell
                      style={{
                        paddingRight: 10,
                        paddingLeft: 10,
                        verticalAlign: "top",
                      }}
                      colSpan={3}
                    >
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoPaper"
                        name="algoPaper"
                        maxRows={4}
                        size="small"
                        autoFocus
                        multiline
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                    >
                      {" "}
                      Comments:{" "}
                    </TableCell>
                    <TableCell
                      style={{
                        paddingRight: 10,
                        paddingLeft: 10,
                        verticalAlign: "top",
                      }}
                      colSpan={3}
                    >
                      <TextField
                        margin="none"
                        required
                        fullWidth
                        id="algoComments"
                        name="algoComments"
                        maxRows={4}
                        size="small"
                        autoFocus
                        multiline
                        inputProps={{ style: { fontSize: 14 } }}
                        // variant="standard"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Button
                type="submit"
                // fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2, mr: 1 }}
                style={{ float: "right" }}
              >
                Create Algorithm
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
        <Dialog
          open={openMonitorDetail}
          onClose={() => setOpenMonitorDetail(false)}
          fullWidth={true}
          aria-labelledby="scroll-dialog-title"
          aria-describedby="scroll-dialog-description"
          maxWidth={"sm"}
          disableScrollLock={true}
          PaperProps={{
            style: { mb: 2, borderRadius: 10 },
          }}
          // PaperProps={{ sx: { width: "100%"}}}
        >
          <DialogContent sx={{ width: 550, display: "flex" }}>
            <Table sx={{ width: 550 }}>
              <colgroup>
                {/*<col width="120" />*/}
                {/*<col width="150" />*/}
                {/*<col width="65" />*/}
                {/*<col width="200" />*/}
                <col width="150" />
                <col width="150" />
                <col width="150" />
                <col width="50" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableCell
                    style={{
                      paddingRight: 0,
                      paddingLeft: 0,
                      verticalAlign: "top",
                    }}
                  >
                    {" "}
                    Description:{" "}
                  </TableCell>
                  <TableCell
                    style={{
                      paddingRight: 0,
                      paddingLeft: 0,
                      verticalAlign: "top",
                    }}
                    colSpan={3}
                  >
                    {infoDescription.description}
                  </TableCell>
                </TableRow>
                {infoDescription.c_axis != null ? (
                  <TableRow>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                    >
                      {" "}
                      Category-axis:{" "}
                    </TableCell>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                      colSpan={3}
                    >
                      {infoDescription.c_axis}
                    </TableCell>
                  </TableRow>
                ) : null}
                {infoDescription.v_axis != null ? (
                  <TableRow>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                    >
                      {" "}
                      Value-axis:{" "}
                    </TableCell>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                      colSpan={3}
                    >
                      {infoDescription.v_axis}
                    </TableCell>
                  </TableRow>
                ) : null}

                {infoDescription.x_axis != null ? (
                  <TableRow>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                    >
                      {" "}
                      X-axis:{" "}
                    </TableCell>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                      colSpan={3}
                    >
                      {infoDescription.x_axis}
                    </TableCell>
                  </TableRow>
                ) : null}
                {infoDescription.y_axis != null ? (
                  <TableRow>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                    >
                      {" "}
                      Y-axis:{" "}
                    </TableCell>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                      colSpan={3}
                    >
                      {infoDescription.y_axis}
                    </TableCell>
                  </TableRow>
                ) : null}
                {infoDescription.comment != null ? (
                  <TableRow>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                    >
                      {" "}
                      Comments:{" "}
                    </TableCell>
                    <TableCell
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                        verticalAlign: "top",
                      }}
                      colSpan={3}
                    >
                      {infoDescription.comment}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </Paper>
    </Stack>
  );
}
