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
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import WaveBackground from "../WaveBackground";
import api from "../../utils/apiClient";

const CandidatureForm = () => {
  const navigate = useNavigate();

  const [isPortalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch user data from localStorage
    const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    setUserData(storedUserData);

    // Fetch user's previous candidature submissions
    const fetchCandidatures = async () => {
      setLoadingData(true);
      try {
        const response = await api.voting.getMyCandidatures();
        setPreviousSubmissions(response.data?.candidatures || []);
      } catch (error) {
        console.error("Error fetching candidatures:", error);
        setSnackbar({
          open: true,
          message: `Failed to fetch candidature data: ${
            error.response?.data?.message || error.message || "Unknown error"
          }`,
          severity: "error",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchCandidatures();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formState.position) {
      newErrors.position = "Please select a position";
    }

    if (!formState.batch || formState.batch.trim().length < 4) {
      newErrors.batch = "Please enter a valid batch (e.g., 2021-2025)";
    }

    if (!formState.statement || formState.statement.trim().length < 50) {
      newErrors.statement = "Statement must be at least 50 characters";
    }

    if (!formState.experience || formState.experience.trim().length < 30) {
      newErrors.experience = "Experience must be at least 30 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fix the errors in the form",
        severity: "error",
      });
      return;
    }

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
          response.data?.message ||
          "Candidature application submitted successfully!",
        severity: "success",
      });

      // Update previous submissions with the new one
      const updatedSubmissions = [...previousSubmissions];
      const existingIndex = updatedSubmissions.findIndex(
        (sub) => sub.position === formState.position
      );

      if (existingIndex >= 0) {
        updatedSubmissions[existingIndex] = response.data?.candidate;
      } else {
        updatedSubmissions.push(response.data?.candidate);
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
      setErrors({});
    } catch (error) {
      console.error("Error submitting candidature:", error);
      setSnackbar({
        open: true,
        message: `Submission failed: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`,
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
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      Approved: {
        color: "success",
        icon: <CheckCircleIcon fontSize="small" />,
      },
      Rejected: { color: "error", icon: <CancelIcon fontSize="small" /> },
      Reverted: { color: "warning", icon: <InfoIcon fontSize="small" /> },
      Pending: { color: "info", icon: <PendingIcon fontSize="small" /> },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <Chip
        label={status}
        color={config.color}
        icon={config.icon}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
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
            mb: 1,
            color: "#fff",
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Candidature Application
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            mb: 4,
          }}
        >
          Apply for student council positions
        </Typography>

        {!isPortalOpen ? (
          <Paper
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              mt: 3,
            }}
          >
            <CancelIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
            <Typography variant="h5" component="h2" sx={{ color: "#d32f2f", mb: 2 }}>
              Candidature Portal is Currently Closed
            </Typography>
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              The portal for submitting candidature applications is currently
              closed. Please check back later when the administration opens the
              portal.
            </Typography>
          </Paper>
        ) : (
          <>
            {loadingData ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {previousSubmissions.length > 0 && (
                  <Card
                    sx={{
                      mb: 4,
                      background: "rgba(255,255,255,0.95)",
                      borderRadius: 3,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <InfoIcon color="primary" />
                        Your Previous Submissions
                      </Typography>
                      <Stack spacing={2}>
                        {previousSubmissions.map((submission) => (
                          <Paper
                            key={submission.position}
                            elevation={2}
                            sx={{
                              p: 2.5,
                              border: "1px solid rgba(0,0,0,0.08)",
                              borderRadius: 2,
                              transition: "all 0.2s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1.5,
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: 600, mb: 0.5 }}
                                >
                                  {submission.position}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Submitted:{" "}
                                  {new Date(
                                    submission.submittedAt
                                  ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Typography>
                              </Box>
                              {getStatusChip(submission.status)}
                            </Box>
                            {submission.remark && (
                              <Box
                                sx={{
                                  mt: 1.5,
                                  p: 1.5,
                                  bgcolor: "rgba(255, 152, 0, 0.08)",
                                  borderLeft: "3px solid #FF9800",
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
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
                                size="small"
                                onClick={() => handleEditSubmission(submission)}
                                sx={{ mt: 2 }}
                              >
                                Edit and Resubmit
                              </Button>
                            )}
                          </Paper>
                        ))}
                      </Stack>
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
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                    Application Form
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.position}>
                    <InputLabel id="position-label">
                      Position Applying For *
                    </InputLabel>
                    <Select
                      labelId="position-label"
                      name="position"
                      value={formState.position}
                      onChange={handleChange}
                      label="Position Applying For *"
                      required
                    >
                      {positions.map((pos) => (
                        <MenuItem key={pos} value={pos}>
                          {pos}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.position && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.position}
                      </Typography>
                    )}
                  </FormControl>

                  <TextField
                    label="Full Name"
                    name="name"
                    value={userData?.name || ""}
                    margin="normal"
                    fullWidth
                    required
                    disabled
                    InputProps={{
                      sx: { bgcolor: "rgba(0,0,0,0.02)" },
                    }}
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
                    InputProps={{
                      sx: { bgcolor: "rgba(0,0,0,0.02)" },
                    }}
                  />

                  <TextField
                    label="Roll Number"
                    name="rollNumber"
                    value={userData?.rollNumber || ""}
                    margin="normal"
                    fullWidth
                    required
                    disabled
                    InputProps={{
                      sx: { bgcolor: "rgba(0,0,0,0.02)" },
                    }}
                  />

                  <TextField
                    label="Batch"
                    name="batch"
                    value={formState.batch}
                    onChange={handleChange}
                    margin="normal"
                    fullWidth
                    required
                    placeholder="e.g., 2021-2025"
                    error={!!errors.batch}
                    helperText={errors.batch || "Enter your batch year"}
                  />

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
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
                    error={!!errors.statement}
                    helperText={
                      errors.statement ||
                      `${formState.statement.length}/50 minimum characters`
                    }
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
                    error={!!errors.experience}
                    helperText={
                      errors.experience ||
                      `${formState.experience.length}/30 minimum characters`
                    }
                  />

                  <TextField
                    label="Achievements (Optional)"
                    name="achievements"
                    value={formState.achievements}
                    onChange={handleChange}
                    margin="normal"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="List any achievements or accomplishments relevant to this position..."
                    helperText={`${formState.achievements.length} characters`}
                  />

                  <Tooltip
                    title={
                      !formState.position
                        ? "Please select a position first"
                        : ""
                    }
                  >
                    <span>
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
                        disabled={isLoading || !formState.position}
                        sx={{
                          mt: 4,
                          alignSelf: "center",
                          px: 5,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: "none",
                          fontSize: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        {previousSubmissions.some(
                          (sub) =>
                            sub.position === formState.position &&
                            (sub.status === "Reverted" ||
                              sub.status === "Rejected")
                        )
                          ? "Resubmit Application"
                          : "Submit Application"}
                      </Button>
                    </span>
                  </Tooltip>
                </Paper>
              </>
            )}
          </>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidatureForm;
