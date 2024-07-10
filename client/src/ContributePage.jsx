import * as React from 'react';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Toolbar from '@mui/material/Toolbar';
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Divider from '@mui/material/Divider';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import FormHelperText from '@mui/material/FormHelperText';
import {APIConfig} from "./config";



export default function Contribute() {
    const validationSchema = Yup.object({
        requesterName: Yup.string().required('Requester Name is required'),
        requesterEmail: Yup.string().email('Invalid email address').required('Contact Email is required'),
        requesterAffilation: Yup.string().required('Affilation is required'),
        googleScholar: Yup.string().url('Invalid URL').required('Google Scholar is required'),
        dblp: Yup.string().required('DBLP is required'),
        justification: Yup.string().required('Justification is required'),
        algorithmName: Yup.string().required('Algorithm Name is required'),
        authorName: Yup.string().required('Author\'s Name is required'),
        paperReference: Yup.string().required('Paper References is required'),
        githubLink: Yup.string().url('Invalid URL').required('Github Link is required'),
        comments: Yup.string().required('Comments are required'),
    });

    const createNewRequester =  (values) =>{
        console.log("in creatinggggg processs")

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                values
            )
        };
        console.log(APIConfig.apiUrl)
        fetch(APIConfig.apiUrl+'/request/create', requestOptions)
        .then(response => 
            alert(response.json()))
        .catch(error => console.error('Error:::::::::::::' , error ))
    }

    const handleSubmit = (values, { setSubmitting, resetForm  }) => {
        console.log("values")
        setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            createNewRequester(values)
            setSubmitting(false);
            resetForm({
                requesterName: '',
                requesterEmail: '',
                requesterAffilation: '',
                googleScholar: '',
                dblp: '',
                justification: '',
                algorithmName: '',
                authorName: '',
                paperReference: '',
                githubLink: '',
                comments: '',
            });
          }, 400);
    }


    const item_width = 300;
    return (
        <Box
            sx={{
                minWidth: 600, position: "absolute", width: '96%', paddingLeft: "2%", top: "300px", opacity: "0.95"
            }}>
            <Paper elevation={12} sx={{ width: '100%', mt: 2, mb: 2, borderRadius: 5 }}>
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 }
                    }}
                >
                    <Typography
                        sx={{ flex: '1 1 100%', paddingLeft: '10px' }}
                        variant="h6"
                        component="div"
                    >
                        Call for Submission
                    </Typography>
                </Toolbar>
                <Divider sx={{ borderBottomWidth: '3px' }} />
                <Box
                    sx={{
                        paddingTop: '15px', paddingLeft: '35px', paddingRight: '35px', paddingBottom: '35px'
                    }}>
                    <Typography
                        sx={{ fontSize: 16, flex: '1 1 100%' }}
                        variant="h6"
                        component="div"
                        gutterBottom
                    >
                        In recent years, the number of publications on the topic of MAPF has exploded as industrial interest continues to grow.
                        Many works now appear across various venues, and substantial performance improvements have been achieved.
                        As a community, it is important for us to track the progress made in the field and establish the state-of-the-art together.
                        Therefore this web-based platform is developed to track different types of algorithms and their progress.
                        The two important results we collected from different MAPF algorithms are:
                    </Typography>

                    <ul>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            Best (i.e., largest) lower-bound value.
                        </Typography>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            Best (i.e., smallest SIC) solution and its concrete plan.
                        </Typography>
                    </ul>
                    <Typography
                        sx={{ fontSize: 16, flex: '1 1 100%' }}
                        variant="h6"
                        component="div"
                        gutterBottom
                    >
                        To contribute new results, please modify your solver to return the CSV file
                        in accordance with the Submission File Format, following the instructions provided below:

                    </Typography>
                    <ul>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            For the solver that explores only feasible solutions, please report the lower-bound as empty.
                        </Typography>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            For the solver that attempts to prove optimality, please report the lower-bound value when the solver times out.
                        </Typography>
                    </ul>
                    <Typography
                        sx={{ fontSize: 16, flex: '1 1 100%' }}
                        variant="h6"
                        component="div"
                        gutterBottom
                    >
                        To upload your results to the platform:
                    </Typography>
                    <ul>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >

                            If you are interested in submitting results for a particular map:
                        </Typography>
                        <ul>
                            <Typography
                                sx={{ fontSize: 16, flex: '1 1 100%' }}
                                variant="h6"
                                component="li"
                                gutterBottom
                            >
                                Please contact one of the organizers, and we will create an account for you.
                            </Typography>
                            <Typography
                                sx={{ fontSize: 16, flex: '1 1 100%' }}
                                variant="h6"
                                component="li"
                                gutterBottom
                            >
                                Once you have an account, you can contribute/upload-yourself individual solutions.
                            </Typography>
                        </ul>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            If you want to contribute a large number of results:
                        </Typography>
                        <ul>
                            <Typography
                                sx={{ fontSize: 16, flex: '1 1 100%' }}
                                variant="h6"
                                component="li"
                                gutterBottom
                            >
                                please contact us and we can organise an mass-upload facility.
                            </Typography>
                        </ul>
                    </ul>
                    <Typography
                        sx={{ fontSize: 16, flex: '1 1 100%' }}
                        variant="h6"
                        component="div"
                        gutterBottom
                    >
                        Current Contactor:
                    </Typography>
                    <ul>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            For submission, please contact Bojie.Shen@monash.edu or Zhe.Chen@monash.edu.
                        </Typography>

                    </ul>
                </Box>
            </Paper>
            <Paper elevation={12} sx={{ width: '100%', mt: 2, mb: 2, borderRadius: 5 }}>
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 }
                    }}
                >
                    <Typography
                        sx={{ flex: '1 1 100%', paddingLeft: '10px' }}
                        variant="h6"
                        component="div"
                    >
                        Submission File Format (CSV)
                    </Typography>
                </Toolbar>
                <Divider sx={{ borderBottomWidth: '3px' }} />
                <Box
                    sx={{
                        paddingTop: '15px', paddingLeft: '35px', paddingRight: '35px', paddingBottom: '35px'
                    }}>
                {/*<Typography*/}
                {/*    sx={{ flex: '1 1 100%' }}*/}
                {/*    variant="h6"*/}
                {/*    component="div"*/}
                {/*    gutterBottom*/}
                {/*>*/}
                {/*    File type:*/}
                {/*</Typography>*/}
                {/*<Typography*/}
                {/*    sx={{ flex: '1 1 100%'}}*/}
                {/*    variant="h7"*/}
                {/*    component="div"*/}
                {/*    gutterBottom*/}
                {/*>*/}
                {/*    We support uploading .csv file*/}
                {/*</Typography>*/}
                <Typography
                    sx={{ fontSize: 16, flex: '1 1 100%' }}
                    component="div"
                    gutterBottom
                >
                    File header:
                </Typography>
                <Typography
                    sx={{ fontSize: 16,paddingLeft :'15px',paddingBottom :'15px',flex: '1 1 100%'}}
                    component="div"
                    gutterBottom
                >
                    map_name, scen_type, type_id, agents, lower_cost, solution_cost, solution_plan
                </Typography>
                <Typography
                    sx={{ fontSize: 16, flex: '1 1 100%'}}
                    component="div"
                    gutterBottom
                >
                    Solution Plan Format:
                </Typography>
                <Typography
                    sx={{fontSize: 16, paddingLeft :'15px',paddingBottom :'15px', flex: '1 1 100%'}}
                    component="div"
                    gutterBottom
                >
                    For each agent, we use a motion string to represent the path, where the symbol 'u', 'd', 'l' and 'r' represents moving up, down, left and right respectively,
                    and 'w' represents waiting at its current location (eg., a path [(0,0) -&gt; (0,1) -&gt; (1,1) -&gt; (2,1) -&gt; (2,0) -&gt; (2,0) -&gt; (1,0)] is converted to a motion string  "urrdwl").
                    We use "\n" to separate the paths between different agents.
                </Typography>
                <Typography
                    sx={{ fontSize: 16,flex: '1 1 100%'}}
                    component="div"
                    gutterBottom
                >
                    Example File:
                </Typography>

                    {/*<Typography*/}
                    {/*    sx={{ flex: '1 1 100%' ,paddingLeft :'10px'}}*/}
                    {/*    variant="h6"*/}
                    {/*    component="div"*/}
                    {/*    gutterBottom*/}
                    {/*>*/}
                    <TableContainer sx={{ width: "100%" }}>
                        <Table sx={{ minWidth: 600, width: "100%" }}
                            style={{ tableLayout: "auto" }}>
                            <colgroup>
                                <col style={{ minWidth: "50px" }} width="10%" />
                                <col style={{ minWidth: "50px" }} width="10%" />
                                <col style={{ minWidth: "50px" }} width="10%" />
                                <col style={{ minWidth: "50px" }} width="10%" />
                                <col style={{ minWidth: "50px" }} width="10%" />
                                <col style={{ minWidth: "50px" }} width="10%" />
                                <col style={{ minWidth: "200px" }} width="40%" />
                            </colgroup>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        map_name
                                    </TableCell>
                                    <TableCell>
                                        scen_type
                                    </TableCell>
                                    <TableCell>
                                        type_id
                                    </TableCell>
                                    <TableCell>
                                        agents
                                    </TableCell>
                                    <TableCell>
                                        lower_cost
                                    </TableCell>
                                    <TableCell>
                                        solution_cost
                                    </TableCell>
                                    <TableCell>
                                        solution_plan
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        empty-32-32
                                    </TableCell>
                                    <TableCell>
                                        even
                                    </TableCell>
                                    <TableCell>
                                        1
                                    </TableCell>
                                    <TableCell>
                                        1
                                    </TableCell>
                                    <TableCell>
                                        14
                                    </TableCell>
                                    <TableCell>
                                        14
                                    </TableCell>
                                    <TableCell>
                                        urrurrruuurrrr
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        empty-32-32
                                    </TableCell>
                                    <TableCell>
                                        even
                                    </TableCell>
                                    <TableCell>
                                        1
                                    </TableCell>
                                    <TableCell>
                                        2
                                    </TableCell>
                                    <TableCell>
                                        38
                                    </TableCell>
                                    <TableCell>
                                        38
                                    </TableCell>
                                    <TableCell>
                                        urrurrruuurrrr<br />
                                        ddrddrrrddrddrdrrdrddddd
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        empty-32-32
                                    </TableCell>
                                    <TableCell>
                                        even
                                    </TableCell>
                                    <TableCell>
                                        1
                                    </TableCell>
                                    <TableCell>
                                        3
                                    </TableCell>
                                    <TableCell>
                                        50
                                    </TableCell>
                                    <TableCell>
                                        50
                                    </TableCell>
                                    <TableCell>
                                        urrurrruuurrrr <br />
                                        ddrddrrrddrddrdrrdrddddd<br />
                                        dddddddddddd
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
            <Paper elevation={12} sx={{ width: '100%', mt: 2, mb: 2, borderRadius: 5 }}>
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 }
                    }}
                >
                    <Typography
                        sx={{ flex: '1 1 100%', paddingLeft: '10px' }}
                        variant="h6"
                        component="div"
                    >
                        Submission Request
                    </Typography>
                </Toolbar>
                <Divider sx={{ borderBottomWidth: '3px' }} />
                <Box
                                component="div"
                                sx={{
                                    paddingTop: '15px',
                                    paddingLeft: '35px',
                                    paddingRight: '35px',
                                    paddingBottom: '35px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                <Formik
                    initialValues={{
                        requesterName: '',
                        requesterEmail: '',
                        requesterAffilation: '',
                        googleScholar: '',
                        dblp: '',
                        justification: '',
                        algorithmName: '',
                        authorName: '',
                        paperReference: '',
                        githubLink: '',
                        comments: '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit= {handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>

                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="requesterName"
                                        label="Requester Name"
                                        variant="standard"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="requesterName" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>

                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="requesterEmail"
                                        type="email"
                                        label="Contact Email"
                                        variant="standard"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="requesterEmail" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="requesterAffilation"
                                        label="Affilation"
                                        variant="standard"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="requesterAffilation" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="authorName"
                                        label="Author's Name"
                                        variant="standard"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="authorName" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="justification"
                                        label="Justification"
                                        variant="standard"
                                        fullWidth
                                        multiline
                                        required
                                    />
                                    <ErrorMessage name="justification" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>

                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="algorithmName"
                                        label="Algorithm Name"
                                        variant="standard"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="algorithmName" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="paperReference"
                                        label="Paper References"
                                        variant="standard"
                                        multiline
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="paperReference" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="comments"
                                        label="Comments"
                                        variant="standard"
                                        fullWidth
                                        multiline
                                        required
                                    />
                                    <ErrorMessage name="comments" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="googleScholar"
                                        type="url"
                                        label="Google Scholar"
                                        variant="standard"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="googleScholar" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="dblp"
                                        label="DBLP"
                                        variant="standard"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="dblp" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>
                                <Box sx={{ marginBottom: '20px' }}>
                                    <Field
                                        as={TextField}
                                        name="githubLink"
                                        type="url"
                                        label="Github Link"
                                        variant="standard"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name="githubLink" component={FormHelperText} sx={{ color: 'red', fontSize: '0.8rem', marginTop: '8px' }} />
                                </Box>
                                <Button type="submit" variant="contained" color="success" disabled={isSubmitting}>
                                    Request
                                </Button>

                            </Form>
                        )}
                    </Formik>
                            </Box>

            </Paper>

            {/*<Paper elevation={12} sx={{ width: '100%', mb: 2,borderRadius: 5}}>*/}
            {/*    <Toolbar*/}
            {/*        sx={{*/}
            {/*            pl: { sm: 2 },*/}
            {/*            pr: { xs: 1, sm: 1 }*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        <Typography*/}
            {/*            sx={{ flex: '1 1 100%',paddingLeft :'10px' }}*/}
            {/*            variant="h6"*/}
            {/*            component="div"*/}
            {/*        >*/}
            {/*           Report Issues or Bugs*/}
            {/*        </Typography>*/}
            {/*    </Toolbar>*/}
            {/*    <Divider sx={{ borderBottomWidth: '3px' }} />*/}
            {/*    <Box*/}
            {/*        sx={{paddingTop: '15px',paddingLeft :'35px',paddingRight :'35px',paddingBottom :'35px'*/}
            {/*        }}>*/}
            {/*        <Typography*/}
            {/*            sx={{ fontSize: 16, flex: '1 1 100%' }}*/}
            {/*            component="div"*/}
            {/*            gutterBottom*/}
            {/*        >*/}
            {/*            To report an issue or bug, please submit it as an issue on our <a href="https://github.com/bshen95/MAPF-benchmark-web">Github</a>.*/}
            {/*        </Typography>*/}
            {/*    </Box>*/}
            {/*</Paper>*/}


            <Paper elevation={12} sx={{ width: '100%', mb: 2, borderRadius: 5 }}>
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 }
                    }}
                >
                    <Typography
                        sx={{ flex: '1 1 100%', paddingLeft: '10px' }}
                        variant="h6"
                        component="div"
                    >
                        Frequently Asked Questions (FAQ)
                    </Typography>
                </Toolbar>
                <Divider sx={{ borderBottomWidth: '3px' }} />
                <Box
                    sx={{
                        paddingTop: '15px', paddingLeft: '35px', paddingRight: '35px', paddingBottom: '35px'
                    }}>
                    <Typography
                        sx={{ fontSize: 16, flex: '1 1 100%' }}
                        variant="h6"
                        component="div"
                        gutterBottom
                    >
                        Q1: I did not receive credit for all of my submitted results!
                    </Typography>
                    <ul>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            We validate all submissions for feasibility and reject any which are invalid.
                            If you submit a best-known solution and the corresponding plan is invalid, we will not record any data for this problem.
                        </Typography>
                    </ul>
                    <Typography
                        sx={{ fontSize: 16, flex: '1 1 100%' }}
                        variant="h6"
                        component="div"
                        gutterBottom
                    >
                        Q2: The number of claimed lower-bounds for my submission has gone down since it was accepted.
                    </Typography>
                    <ul>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            We compare lower-bound claims against best-known solutions.
                            If your lower-bound claim X is contradicted by a feasible solution with cost Y &lt; X ,
                            your claim is invalid and will be removed. In case of such errors we remove all LB claims of the associated submission.
                        </Typography>
                    </ul>
                    <Typography
                        sx={{ fontSize: 16, flex: '1 1 100%' }}
                        variant="h6"
                        component="div"
                        gutterBottom
                    >
                        Q3: Is there a convenient method to download all of this data?
                    </Typography>
                    <ul>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            Yes! Please visit our <a href="http://tracker.pathfinding.ai/quickDownload">download page</a>.
                            The benchmark folder comprises snapshot files of all scenarios from the MovingAI repository,
                            while the result folder houses solution plans from the best-known solution.
                            You can conveniently download all the ZIP files using the wget command.
                        </Typography>
                    </ul>
                    <Typography
                        sx={{ fontSize: 16, flex: '1 1 100%' }}
                        variant="h6"
                        component="div"
                        gutterBottom
                    >
                        Q4: I found a problem with the data or the website.
                    </Typography>
                    <ul>
                        <Typography
                            sx={{ fontSize: 16, flex: '1 1 100%' }}
                            variant="h6"
                            component="li"
                            gutterBottom
                        >
                            Please raise an issue in our issue tracker on  <a href="https://github.com/bshen95/MAPF-benchmark-web">Github</a>.
                            Describe the problem with as much detail as possible, and the steps leading up to the problem, so that we can reproduce it.

                        </Typography>
                    </ul>
                </Box>
            </Paper>

            {/*<textarea ref={textareaRef} className="hidden-textarea" readOnly value={bibtexEntry} />*/}



            {/*</Paper>*/}

        </Box>
    );
}
