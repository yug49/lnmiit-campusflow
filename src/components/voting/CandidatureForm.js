import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import WaveBackground from "../WaveBackground";
import api from "../../utils/apiClient";

const CandidatureForm = () => {
  const navigate = useNavigate();

  const [isPortalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [positions] = useState([
    "General Secretary of Science & Tech Council",
    "General Secretary of Cultural Council",
    "General Secretary of Sports Council",
    "President",
    "Finance Convernor",
  ]);

  const [formState, setFormState] = useState({
    position: "",
    batch: "",
    statement: "",
    experience: "",
    achievements: "",
  });

  const [previousSubmissions, setPreviousSubmissions] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from localStorage
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    setUserData(storedUserData);

    // Fetch user's previous candidature submissions
    const fetchCandidatures = async () => {
      setIsFetching(true);
      try {
        const response = await api.voting.getMyCandidatures();
        setPreviousSubmissions(response.candidatures || []);
      } catch (error) {
        console.error("Error fetching candidatures:", error);
        setSnackbar({
          open: true,
          message: `Failed to fetch candidature data: ${
            error.message || "Unknown error"
          }`,
          severity: "error",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchCandidatures();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare data for submission
      const candidatureData = {
        ...formState,
      };

      const response = await api.voting.submitCandidature(candidatureData);

      setSnackbar({
        open: true,
        message:
          response.message || "Candidature application submitted successfully!",
        severity: "success",
      });

      // Update previous submissions with the new one
      const updatedSubmissions = [...previousSubmissions];
      const existingIndex = updatedSubmissions.findIndex(
        (sub) => sub.position === formState.position
      );

      if (existingIndex >= 0) {
        updatedSubmissions[existingIndex] = response.candidate;
      } else {
        updatedSubmissions.push(response.candidate);
      }

      setPreviousSubmissions(updatedSubmissions);

      // Reset form
      setFormState({
        position: "",
        batch: "",
        statement: "",
        experience: "",
        achievements: "",
      });
    } catch (error) {
      console.error("Error submitting candidature:", error);
      setSnackbar({
        open: true,
        message: `Submission failed: ${error.message || "Unknown error"}`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmission = (submission) => {
    if (submission) {
      setFormState({
        position: submission.position,
        batch: submission.batch,
        statement: submission.statement,
        experience: submission.experience,
        achievements: submission.achievements || "",
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case "Approved":
        return "success.main";
      case "Rejected":
        return "error.main";
      case "Reverted":
        return "warning.main";
      default:
        return "info.main";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WaveBackground />
      <AppBar
        position="static"
        sx={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            onClick={() => navigate("/student/voting")}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: "#0078D4",
              fontWeight: 600,
            }}
          >
            LNMIIT-CampusFlow
          </Typography>
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              color: "#0078D4",
              "&:hover": {
                backgroundColor: "rgba(0,120,212,0.1)",
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 1,
          py: 4,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "#fff",
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Candidature Application Form
        </Typography>

        {!isPortalOpen ? (
          <Paper
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 2,
              mt: 3,
            }}
          >
            <Typography variant="h5" component="h2" sx={{ color: "#d32f2f" }}>
              Candidature Portal is Currently Closed
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
              The portal for submitting candidature applications is currently
              closed. Please check back later when the administration opens the
              portal.
            </Typography>
          </Paper>
        ) : (
          <>
            {previousSubmissions.length > 0 && (
              <Card
                sx={{
                  mb: 4,
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                    Previous Submission Status
                  </Typography>
                  {previousSubmissions.map((submission) => (
                    <Box
                      key={submission.position}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold" }}
                          >
                            Position: {submission.position}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Submitted:{" "}
                            {new Date(submission.submittedAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: getStatusChipColor(
                              submission.status
                            ),
                            color: "white",
                          }}
                        >
                          {submission.status}
                        </Box>
                      </Box>
                      {submission.remark && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1,
                            bgcolor: "rgba(0,0,0,0.03)",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            Admin Remark:
                          </Typography>
                          <Typography variant="body2">
                            {submission.remark}
                          </Typography>
                        </Box>
                      )}
                      {(submission.status === "Reverted" ||
                        submission.status === "Rejected") && (
                        <Button
                          startIcon={<EditIcon />}
                          variant="outlined"
                          color="primary"
                          onClick={() => handleEditSubmission(submission)}
                          sx={{ mt: 2 }}
                        >
                          Edit and Resubmit
                        </Button>
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            <Paper
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                Fill in your details to apply for a position
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="position-label">
                  Position Applying For
                </InputLabel>
                <Select
                  labelId="position-label"
                  name="position"
                  value={formState.position}
                  onChange={handleChange}
                  label="Position Applying For"
                  required
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Full Name"
                name="name"
                value={userData?.name || ""}
                margin="normal"
                fullWidth
                required
                disabled
              />

              <TextField
                label="Email"
                name="email"
                value={userData?.email || ""}
                margin="normal"
                fullWidth
                required
                disabled
                type="email"
              />

              <TextField
                label="Roll Number"
                name="rollNumber"
                value={userData?.rollNumber || ""}
                margin="normal"
                fullWidth
                required
                disabled
              />

              <TextField
                label="Batch"
                name="batch"
                value={formState.batch}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Candidature Details
              </Typography>

              <TextField
                label="Personal Statement"
                name="statement"
                value={formState.statement}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
                multiline
                rows={4}
                placeholder="Share why you want to run for this position and what your vision is..."
              />

              <TextField
                label="Relevant Experience"
                name="experience"
                value={formState.experience}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
                multiline
                rows={3}
                placeholder="Describe any relevant experience that qualifies you for this position..."
              />

              <TextField
                label="Achievements"
                name="achievements"
                value={formState.achievements}
                onChange={handleChange}
                margin="normal"
                fullWidth
                multiline
                rows={3}
                placeholder="List any achievements or accomplishments relevant to this position..."
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={isLoading}
                sx={{ mt: 4, alignSelf: "center", px: 4 }}
              >
                {previousSubmissions.some(
                  (sub) =>
                    sub.position === formState.position &&
                    (sub.status === "Reverted" || sub.status === "Rejected")
                )
                  ? "Resubmit Application"
                  : "Submit Application"}
              </Button>
            </Paper>
          </>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidatureForm;
