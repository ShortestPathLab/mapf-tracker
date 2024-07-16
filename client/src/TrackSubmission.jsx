import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import { visuallyHidden } from "@mui/utils";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import CancelIcon from "@mui/icons-material/Cancel";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import InfoIcon from "@mui/icons-material/Info";
import DialogContent from "@mui/material/DialogContent";
import Link from "@mui/material/Link";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { APIConfig } from "./config";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import { Formik, Form, Field } from "formik";
import Button from "@mui/material/Button";

const angle = {
    'Warehouse': -40,
    'City': 0,
    'Empty': 50,
    'Game': 110,
    'Maze': 0,
    'Random': 0,
    'Room': -110
}

const infoDescriptionText = {
    'domainCompare-#Instances Closed': {
        'description': "This plot compares the number of instances closed " +
            "between selected algorithm and the state-of-the-art (i.e., all algorithms together) across different domains of the benchmark. " +
            "For a particular algorithm, the instance is closed if the algorithm reports the same lower bound and solution cost. " +
            "Algorithms that do not report lower bound data are omitted from this plot. " +
            "The number of instances closed indicates the performance of algorithms for finding and proving optimal solution (i.e., higher the better). ",
        'c_axis': "The benchmark contains many different maps, each map is associate with domain. " +
            "The category-axis displays the names of the domains available in the benchmark.",
        'v_axis': "The value-axis displays the number of instances closed for each domain. " +
            "The percentage ratio is shown, calculated based on the total number of instances in each domain."
    },
    'domainCompare-#Instances Solved': {
        'description': "This plot compares the number of instances solved " +
            "between selected algorithm and the state-of-the-art (i.e., all algorithms together) across different domains of the benchmark. " +
            "The number of instances solved indicates the performance of algorithms while ignoring solution quality (i.e., higher the better).",
        'c_axis': "The benchmark contains many different maps, each map is associate with domain. " +
            "The category-axis displays the names of the domains available in the benchmark.",
        'v_axis': "The value-axis displays the number of instances solved for each domain. " +
            "The percentage ratio is shown, calculated based on the total number of instances in each domain."
    },
    'domainCompare-#Best Lower-bounds': {
        'description': "This plot compares the number of instances that have achieved the best lower bound (reported by any algorithm) " +
            "between selected algorithm and the state-of-the-art (i.e., all algorithms together) across different domains of the benchmark. " +
            "The number of instances that achieve the best lower bound reflects the availability of algorithms for proving optimality (i.e., higher the better). " +
            "Algorithms that do not report lower bound data are omitted from this plot.",
        'c_axis': "The benchmark contains many different maps, each map is associate with domain. " +
            "The category-axis displays the names of the domains available in the benchmark.",
        'v_axis': "The value-axis displays the number of instances that have achieved the best lower bound for each domain. " +
            "The percentage ratio is shown, calculated based on the total number of instances in each domain. "
        // "For instances where no lower bound is reported, no algorithm can achieve the best lower bound in such cases."
    },
    'domainCompare-#Best Solutions': {
        'description': "This plot compares the number of instances that have achieved the best solution (reported by any algorithm) " +
            "between selected algorithm and the state-of-the-art (i.e., all algorithms together) across different domains of the benchmark. " +
            "The number of instances achieving the best solution reflects the solution quality reported by different algorithms (i.e., higher the better). ",
        'c_axis': "The benchmark contains many different maps, each map is associate with domain. " +
            "The category-axis displays the names of the domains available in the benchmark.",
        'v_axis': "The value-axis displays the number of instances that have achieved the best solution for each domain. " +
            "The percentage ratio is shown, calculated based on the total number of instances in each domain. "
        // "For instances where no solution is reported, no algorithm can achieve the best solution in such cases."
    },
}

function CustomizedLabel(props) {
    const { x, y, cx, cy, payload } = props;
    return (
        <g transform={`translate(${x + (x - cx) / 16},${y + (y - cy) / 16})`}>
            <text x={2} y={0}
                fontFamily="Roboto Slab" textAnchor={'middle'} transform={`rotate(${angle[payload.value] === undefined ? 0 : angle[payload.value]})`}>
                {payload.value}
            </text>
        </g>
    );
}

function descendingComparator(a, b, orderBy) {
    if (orderBy === 'map_size') {
        var string_a = a[orderBy].split("x");
        var string_b = b[orderBy].split("x");
        var value_a = parseInt(string_a[0]) * parseInt(string_a[1])
        var value_b = parseInt(string_b[0]) * parseInt(string_b[1])
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
        id: 'requesterName',
        numeric: false,
        disablePadding: false,
        label: 'Requester Name',
        sortable: false,
        alignment: 'center'
    },
    {
        id: 'requesterEmail',
        numeric: false,
        disablePadding: false,
        label: 'Email',
        sortable: false,
        alignment: 'center'
    },

    {
        id: 'algo_name',
        numeric: false,
        disablePadding: false,
        label: 'Algorithm Name',
        sortable: false,
        alignment: 'center'
    },
    {
        id: 'requestDetails',
        numeric: false,
        disablePadding: false,
        label: 'Details',
        sortable: false,
        alignment: 'center'
    },
];



function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

    return (
        <TableHead sx={{ backgroundColor: "black" }}>
            <TableRow >
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.alignment}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ backgroundColor: "black", color: "white", fontWeight: 'bold' }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                            hideSortIcon={!headCell.sortable}
                            sx={
                                {
                                    '&.MuiTableSortLabel-root': {
                                        color: 'white',
                                        pointerEvents: headCell.sortable ? "auto" : "none"
                                    },
                                    '&.MuiTableSortLabel-root:hover': {
                                        color: 'white',
                                    },
                                    '&.Mui-active': {
                                        color: 'white',
                                    },
                                    '& .MuiTableSortLabel-icon': {
                                        color: 'white !important',
                                    },
                                }
                            }
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('map_type');
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [data, setData] = React.useState([])
    const [rows, setRows] = React.useState([]);
    const [searched, setSearched] = React.useState("");
    const [openApiForm, setOpenApiForm] = React.useState(false);


    // for retriveing all the requests api insert from the user
    const [requestIdList, setRequestIdList] = React.useState([]);

    // for searching by name or whatever
    const requestSearch = (searchedVal) => {
        const filteredRows = data.filter((row) => {
            return row.requesterName.toLowerCase().includes(searchedVal.toLowerCase());
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


    // ----------------------------------------------------------------------------------------
    const checkApiKey = async (api_key) => {
        try {
            const response = await fetch(`${APIConfig.apiUrl}/submission_key/${api_key}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            if (response.ok) {
                setRequestIdList((prevList) => [...prevList, data.request_id]);
            } else {
                console.error('Error finding the submission key', data);
            }
        } catch (error) {
            console.error('Error:', error);
        }

    }

    const handleOpenApiForm = () => {
        setOpenApiForm(true)

    }
    const handleCloseApiForm = () => {
        setOpenApiForm(false)
    }

    const handleApiFormSubmit = async (values, { setSubmitting }) => {
        setSubmitting(false);
        setOpenApiForm(false); // Close the dialog after submission
        await checkApiKey(values.api_key)
        // createNewApiKey()
    }


    const refreshRequests = async (callback) => {
        const request_details = [];
        const fetchPromises = requestIdList.map(request_id =>
            fetch(`${APIConfig.apiUrl}/request/id/${request_id}`, { method: 'GET' })
                .then(res => res.json())
                .then(data => {
                    request_details.push(data);
                })
                .catch(err => console.error(err))
        );
    
        // Wait for all fetch operations to complete
        await Promise.all(fetchPromises);
    
        // Call the callback with the collected request details
        callback(request_details);
    }



    React.useEffect(() => {
        refreshRequests((d) => {
            setData(d);
            setRows(d);
        });

        const interval = setInterval(() => {
            refreshRequests((d) => {
                setData(d);
                setRows(d);
            })
        }, 1200000);
        return () => clearInterval(interval);
    }, [requestIdList]);


  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <Box
            sx={{
                minWidth: 600, position: "absolute", width: '96%', paddingLeft: "2%", top: "300px", opacity: "0.95"
            }}>
            <Paper elevation={12} sx={{ width: '100%', mb: 2, borderRadius: 5 }}>
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 }
                    }}
                >
                    <IconButton
                        size='medium'
                        onClick={() => { setDense(!dense) }
                        } >
                        {dense ? <ZoomOutMapIcon fontSize='medium' /> : <ZoomInMapIcon fontSize='medium' />}
                    </IconButton>

                    <IconButton aria-label="Add to Library" onClick={handleOpenApiForm}>
                        <LibraryAddIcon />
                    </IconButton>
                    <Dialog open={openApiForm} onClose={handleCloseApiForm}>
                        <DialogContent>
                            <Formik
                                initialValues={{ api_key: '' }}
                                onSubmit={handleApiFormSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <Box sx={{
                                            marginBottom: '20px'
                                        }}>
                                            <Field
                                                as={TextField}
                                                name="api_key"
                                                label="Enter your API key"
                                                variant="standard"
                                                fullWidth
                                                required
                                            />

                                        </Box>
                                        <Box sx={{
                                            justifyContent: 'center', alignContent:'center'
                                        }}>
                                        <Button type="submit" variant="contained" color="success" sx = {{width: '50px'}} disabled={isSubmitting}>
                                            Show
                                        </Button>
                                        </Box>

                                    </Form>
                                )}
                            </Formik>
                        </DialogContent>
                    </Dialog>


                    <Typography
                        sx={{ flex: '1 1 100%', paddingLeft: '10px' }}
                        variant="h6"
                        id="tableTitle"
                        component="div"
                    >
                        Tracking Submissions
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
                                    {searched === "" ? null :
                                        <IconButton onClick={(searchVal) => cancelSearch(searchVal.target.value)} >
                                            <CancelIcon />
                                        </IconButton>}
                                </InputAdornment>
                            )
                        }}
                    />

                </Toolbar>
                {/* ============================= start table================================  */}
                <TableContainer sx={{ width: "100%" }}>
                    <Table
                        // frozen table set max-content
                        sx={{ minWidth: 600, width: "100%" }}
                        aria-labelledby="tableTitle"
                        size={dense ? 'small' : 'medium'}
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
                                                <IconButton>
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

            </Paper>
            {/*<FormControlLabel*/}
            {/*    control={<Switch checked={dense} onChange={handleChangeDense} />}*/}
            {/*    label="Dense padding"*/}
            {/*/>*/}
        </Box>
    );
}
