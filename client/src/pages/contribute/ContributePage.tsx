import { CheckOutlined } from "@mui/icons-material";
import { Card, Link, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useNavigate } from "hooks/useNavigation";
import * as Yup from "yup";
import { APIConfig } from "core/config";
import PageHeader from "layout/PageHeader";
import { CallForSubmission } from "./CallForSubmission";
import Faq from "./Faq";
import { SubmissionFileFormat } from "./SubmissionFileFormat";

export default function Contribute() {
  const validationSchema = Yup.object({
    requesterName: Yup.string().required("Requester name is required"),
    requesterEmail: Yup.string()
      .email("Invalid email address")
      .required("Contact Email is required"),
    requesterAffilation: Yup.string().required("Affilation is required"),
    googleScholar: Yup.string()
      .url("Invalid URL")
      .required("Google Scholar is required"),
    dblp: Yup.string().required("DBLP is required"),
    justification: Yup.string().required("Justification is required"),
    algorithmName: Yup.string().required("Algorithm name is required"),
    authorName: Yup.string().required("Authors is required"),
    paperReference: Yup.string().required("Paper references is required"),
    githubLink: Yup.string()
      .url("Invalid URL")
      .required("Github Link is required"),
    comments: Yup.string(),
  });

  const createNewRequester = (values) => {
    console.log("in creatinggggg processs");

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    };
    console.log(APIConfig.apiUrl);
    fetch(APIConfig.apiUrl + "/request/create", requestOptions)
      .then((response) => alert(response.json()))
      .catch((error) => console.error("Error:::::::::::::", error));
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log("values");
    setTimeout(() => {
      alert(JSON.stringify(values, null, 2));
      createNewRequester(values);
      setSubmitting(false);
      resetForm({
        requesterName: "",
        requesterEmail: "",
        requesterAffilation: "",
        googleScholar: "",
        dblp: "",
        justification: "",
        algorithmName: "",
        authorName: "",
        paperReference: "",
        githubLink: "",
        comments: "",
      });
    }, 400);
  };

  const navigate = useNavigate();

  const item_width = 300;
  return (
    <Stack sx={{ maxWidth: 1280, mx: "auto", px: 2, py: 6, mb: 16, gap: 4 }}>
      <PageHeader
        current="Submit an algorithm"
        path={[{ name: "MAPF Tracker", url: "/" }]}
      />
      <Stack
        sx={{
          flexDirection: { md: "column", lg: "row" },
          alignItems: { md: "stretch", lg: "flex-start" },
          gap: 4,
        }}
      >
        <Card
          sx={{
            p: 4,
            flex: 1,
            minWidth: 0,
            // Special case for accordion
            pb: 1,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Call for submissions
          </Typography>
          <CallForSubmission />
          <SubmissionFileFormat />
          <Faq />
        </Card>
        <Card sx={{ p: 4, flex: 1, minWidth: 0 }}>
          <Box
            component="div"
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Formik
              initialValues={{
                requesterName: "",
                requesterEmail: "",
                requesterAffilation: "",
                googleScholar: "",
                dblp: "",
                justification: "",
                algorithmName: "",
                authorName: "",
                paperReference: "",
                githubLink: "",
                comments: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Stack gap={2} mb={2}>
                    <Typography variant="h4" gutterBottom>
                      Request a submission key
                    </Typography>
                    <Typography variant="body1">
                      Ready to submit your algorithm to our tracker? Fill out
                      this form and our team will get back to you with your
                      submission key.
                    </Typography>
                    <Typography variant="body1">
                      Already have a submission key?{" "}
                      <Link
                        onClick={() => navigate("/trackSubmission")}
                        sx={{ cursor: "pointer" }}
                      >
                        Continue here.
                      </Link>
                    </Typography>
                  </Stack>
                  {renderLabel("About You")}
                  <Stack direction="row" gap={2}>
                    <Box sx={{ marginBottom: "20px", flex: 1 }}>
                      <Field
                        as={TextField}
                        variant="outlined"
                        name="requesterName"
                        label="Name"
                        placeholder="John Doe"
                        fullWidth
                        required
                      />
                      <ErrorMessage
                        name="requesterName"
                        component={FormHelperText}
                        sx={{
                          color: "red",
                          fontSize: "0.8rem",
                          marginTop: "8px",
                        }}
                      />
                    </Box>
                    <Box sx={{ marginBottom: "20px", flex: 1 }}>
                      <Field
                        as={TextField}
                        variant="outlined"
                        name="requesterEmail"
                        type="email"
                        label="Contact Email"
                        placeholder="john.doe@example.com"
                        fullWidth
                        required
                      />
                      <ErrorMessage
                        name="requesterEmail"
                        component={FormHelperText}
                        sx={{
                          color: "red",
                          fontSize: "0.8rem",
                          marginTop: "8px",
                        }}
                      />
                    </Box>
                  </Stack>
                  <Box sx={{ marginBottom: "20px" }}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      name="requesterAffilation"
                      label="Affilation"
                      placeholder="Monash University"
                      fullWidth
                      required
                    />
                    <ErrorMessage
                      name="requesterAffilation"
                      component={FormHelperText}
                      sx={{
                        color: "red",
                        fontSize: "0.8rem",
                        marginTop: "8px",
                      }}
                    />
                  </Box>
                  {renderLabel("About Your Algorithm")}
                  <Stack direction="row" gap={2}>
                    <Box sx={{ marginBottom: "20px", flex: 1 }}>
                      <Field
                        as={TextField}
                        variant="outlined"
                        name="algorithmName"
                        label="Algorithm Name"
                        placeholder="Constraint-Based Search"
                        fullWidth
                        required
                      />
                      <ErrorMessage
                        name="algorithmName"
                        component={FormHelperText}
                        sx={{
                          color: "red",
                          fontSize: "0.8rem",
                          marginTop: "8px",
                        }}
                      />
                    </Box>
                    <Box sx={{ marginBottom: "20px", flex: 1 }}>
                      <Field
                        as={TextField}
                        variant="outlined"
                        name="authorName"
                        label="Authors"
                        placeholder="John Doe, Wei Zhang, Joe Smith"
                        fullWidth
                        required
                      />
                      <ErrorMessage
                        name="authorName"
                        component={FormHelperText}
                        sx={{
                          color: "red",
                          fontSize: "0.8rem",
                          marginTop: "8px",
                        }}
                      />
                    </Box>
                  </Stack>
                  <Box sx={{ marginBottom: "20px" }}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      name="paperReference"
                      label="Paper References"
                      multiline
                      placeholder="APA references to papers describing your algorithm, separate with a new line"
                      minRows={3}
                      fullWidth
                      required
                    />
                    <ErrorMessage
                      name="paperReference"
                      component={FormHelperText}
                      sx={{
                        color: "red",
                        fontSize: "0.8rem",
                        marginTop: "8px",
                      }}
                    />
                  </Box>
                  <Box sx={{ marginBottom: "20px" }}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      name="googleScholar"
                      type="url"
                      label="Google Scholar Link"
                      fullWidth
                      required
                    />
                    <ErrorMessage
                      name="googleScholar"
                      component={FormHelperText}
                      sx={{
                        color: "red",
                        fontSize: "0.8rem",
                        marginTop: "8px",
                      }}
                    />
                  </Box>
                  <Box sx={{ marginBottom: "20px" }}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      name="dblp"
                      label="DBLP Link"
                      fullWidth
                      required
                    />
                    <ErrorMessage
                      name="dblp"
                      component={FormHelperText}
                      sx={{
                        color: "red",
                        fontSize: "0.8rem",
                        marginTop: "8px",
                      }}
                    />
                  </Box>
                  <Box sx={{ marginBottom: "20px" }}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      name="githubLink"
                      type="url"
                      label="Github Link"
                      fullWidth
                      required
                    />
                    <ErrorMessage
                      name="githubLink"
                      component={FormHelperText}
                      sx={{
                        color: "red",
                        fontSize: "0.8rem",
                        marginTop: "8px",
                      }}
                    />
                  </Box>
                  {renderLabel("Other Info")}
                  <Box sx={{ marginBottom: "20px" }}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      multiline
                      minRows={3}
                      name="justification"
                      label="Justification"
                      placeholder="Why would you like to submit your algorithm to our tracker?"
                      fullWidth
                      required
                    />
                    <ErrorMessage
                      name="justification"
                      component={FormHelperText}
                      sx={{
                        color: "red",
                        fontSize: "0.8rem",
                        marginTop: "8px",
                      }}
                    />
                  </Box>
                  <Box sx={{ marginBottom: "20px" }}>
                    <Field
                      as={TextField}
                      variant="outlined"
                      name="comments"
                      label="Comments"
                      fullWidth
                      minRows={4}
                      multiline
                    />
                    <ErrorMessage
                      name="comments"
                      component={FormHelperText}
                      sx={{
                        color: "red",
                        fontSize: "0.8rem",
                        marginTop: "8px",
                      }}
                    />
                  </Box>
                  <Button
                    fullWidth
                    sx={{ mt: 4 }}
                    type="submit"
                    variant="contained"
                    size="large"
                    disableElevation
                    disabled={isSubmitting}
                    startIcon={<CheckOutlined />}
                  >
                    Submit Request
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
        </Card>
      </Stack>
    </Stack>
  );

  function renderLabel(label) {
    return (
      <Typography variant="h6" sx={{ fontSize: "1em", py: 2 }}>
        {label}
      </Typography>
    );
  }
}
