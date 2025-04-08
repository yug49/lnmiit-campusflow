import React from "react";
import {
  Container,
  Grid,
  Typography,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WaveBackground from "../WaveBackground";

const EventPermissions = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WaveBackground />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 6, display: "flex", alignItems: "center" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/council/dashboard")}
            sx={{
              color: "#fff",
              fontWeight: 500,
              mr: 2,
            }}
          >
            Back to Dashboard
          </Button>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: "#fff",
              fontWeight: 700,
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            Event Permissions
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* New Event Request Card */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={4}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: (theme) => theme.shadows[10],
                },
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <CardMedia
                component="div"
                sx={{
                  pt: "56.25%", // 16:9 aspect ratio
                  backgroundColor: "primary.main",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AddIcon
                    sx={{
                      fontSize: 80,
                      color: "white",
                      opacity: 0.8,
                    }}
                  />
                </Box>
              </CardMedia>
              <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  sx={{ fontWeight: 600 }}
                >
                  New Event Request
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Submit a new event permission request for academic, cultural,
                  technical or any other institutional events. Fill in event
                  details, resource requirements, and get the necessary
                  approvals.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Requires approval from faculty coordinator, Dean of Student
                  Affairs, and other relevant authorities depending on the event
                  type and scale.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/council/event-request")}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    fontWeight: 600,
                  }}
                >
                  Create New Request
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Event Status Card */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={4}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: (theme) => theme.shadows[10],
                },
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <CardMedia
                component="div"
                sx={{
                  pt: "56.25%", // 16:9 aspect ratio
                  backgroundColor: "secondary.main",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ListIcon
                    sx={{
                      fontSize: 80,
                      color: "white",
                      opacity: 0.8,
                    }}
                  />
                </Box>
              </CardMedia>
              <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  sx={{ fontWeight: 600 }}
                >
                  Events Status
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Check the status of your submitted event requests. View
                  approvals, rejections, pending reviews, or make edits to
                  rejected requests. Also access records of past events that
                  were successfully conducted.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track event applications through the approval workflow and
                  access details of completed events for reference and reporting
                  purposes.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  startIcon={<ListIcon />}
                  onClick={() => navigate("/council/event-status")}
                  sx={{
                    py: 1.5,
                    mt: 2,
                    fontWeight: 600,
                  }}
                >
                  View Events Status
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EventPermissions;
