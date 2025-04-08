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

const CandidatureForm = () => {
  const navigate = useNavigate();

  // Mock data for demonstration - would be fetched from API in real implementation
  const [isPortalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [positions] = useState([
    "President",
    "Vice President",
    "General Secretary",
    "Treasurer",
    "Cultural Secretary",
    "Sports Secretary",
    "Technical Secretary",
    "Mess Secretary",
  ]);

  const [formState, setFormState] = useState({
    position: "",
    name: "John Doe", // Mocked user data
    email: "john.doe@lnmiit.ac.in", // Mocked user data
    rollNumber: "12345678", // Mocked user data
    batch: "2022-2026",
    statement: "",
    experience: "",
    achievements: "",
  });

  const [previousSubmission, setPreviousSubmission] = useState(null);

  useEffect(() => {
    // Mock fetching previous submission
    setTimeout(() => {
      const mockSubmission = localStorage.getItem("candidatureSubmission");
      if (mockSubmission) {
        setPreviousSubmission(JSON.parse(mockSubmission));
      }
    }, 1000);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call
    setTimeout(() => {
      // Store in localStorage for demo purposes
      localStorage.setItem(
        "candidatureSubmission",
        JSON.stringify({
          ...formState,
          status: "Pending",
          submittedAt: new Date().toISOString(),
        })
      );

      setIsLoading(false);
      setSnackbar({
        open: true,
        message: "Candidature form submitted successfully!",
        severity: "success",
      });

      // Refresh the previous submission
      setPreviousSubmission({
        ...formState,
        status: "Pending",
        submittedAt: new Date().toISOString(),
      });
    }, 2000);
  };

  const handleEditSubmission = () => {
    if (previousSubmission) {
      setFormState({
        ...previousSubmission,
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
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
            {previousSubmission && (
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Position: {previousSubmission.position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Submitted:{" "}
                        {new Date(
                          previousSubmission.submittedAt
                        ).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor:
                          previousSubmission.status === "Approved"
                            ? "rgba(46, 125, 50, 0.1)"
                            : previousSubmission.status === "Rejected"
                            ? "rgba(211, 47, 47, 0.1)"
                            : previousSubmission.status === "Reverted"
                            ? "rgba(237, 108, 2, 0.1)"
                            : "rgba(25, 118, 210, 0.1)",
                        color:
                          previousSubmission.status === "Approved"
                            ? "success.main"
                            : previousSubmission.status === "Rejected"
                            ? "error.main"
                            : previousSubmission.status === "Reverted"
                            ? "warning.main"
                            : "info.main",
                      }}
                    >
                      {previousSubmission.status}
                    </Box>
                  </Box>

                  {previousSubmission.remark && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1,
                        bgcolor: "rgba(0,0,0,0.03)",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Admin Remark:
                      </Typography>
                      <Typography variant="body2">
                        {previousSubmission.remark}
                      </Typography>
                    </Box>
                  )}

                  {(previousSubmission.status === "Reverted" ||
                    previousSubmission.status === "Rejected") && (
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      color="primary"
                      onClick={handleEditSubmission}
                      sx={{ mt: 2 }}
                    >
                      Edit and Resubmit
                    </Button>
                  )}
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
                value={formState.name}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
                disabled
              />

              <TextField
                label="Email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
                disabled
                type="email"
              />

              <TextField
                label="Roll Number"
                name="rollNumber"
                value={formState.rollNumber}
                onChange={handleChange}
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
                {previousSubmission &&
                (previousSubmission.status === "Reverted" ||
                  previousSubmission.status === "Rejected")
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
