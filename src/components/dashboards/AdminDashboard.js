import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardActionArea,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import WaveBackground from "../WaveBackground";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showVotingFeatures, setShowVotingFeatures] = useState(false);

  const votingFeatures = [
    {
      title: "Candidature Approval",
      subtitle: "Review and approve student council election candidates",
      icon: "👥",
      path: "/admin/voting/candidature",
    },
    {
      title: "Voter Approval",
      subtitle: "Review and approve student voting eligibility",
      icon: "✓",
      path: "/admin/voting/voters",
    },
  ];

  const mainFeatures = [
    {
      title: "No Dues Approval",
      subtitle:
        "Review and approve pending no dues requests from faculty and students",
      icon: "📋",
      path: "/admin/no-dues",
    },
    {
      title: "MoU Approval",
      subtitle: "Review and approve MoUs submitted by council representatives",
      icon: "📄",
      path: "/admin/mou",
    },
    {
      title: "Event Approval",
      subtitle: "Review and approve event permission requests",
      icon: "🎯",
      path: "/admin/event",
    },
    {
      title: "Invoice Approval",
      subtitle: "Review and approve event expense invoices",
      icon: "🧾",
      path: "/admin/invoice",
    },
    {
      title: "Voting Management",
      subtitle: "Manage candidature and voter approvals for council elections",
      icon: "🗳️",
      onClick: () => setShowVotingFeatures(true),
    },
    // Removing My Profile button as requested
  ];

  const filteredFeatures = showVotingFeatures
    ? votingFeatures.filter((feature) =>
        feature.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mainFeatures.filter((feature) =>
        feature.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleLogout = () => {
    navigate("/");
  };

  const handleNavigateToAccount = () => {
    navigate("/my-account");
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
          <Button
            color="primary"
            onClick={handleNavigateToAccount}
            startIcon={<PersonIcon />}
            sx={{ mr: 2 }}
          >
            My Account
          </Button>
          <IconButton
            onClick={handleLogout}
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
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
          py: 4,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 6,
            color: "#fff",
            width: "100%",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              mb: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {showVotingFeatures ? "Voting Management" : "Admin Dashboard"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 4,
            }}
          >
            {showVotingFeatures
              ? "Manage election approvals"
              : "Manage campus approvals and workflows"}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={
              showVotingFeatures
                ? "Search voting features..."
                : "Search features..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: 400,
              mx: "auto",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.4)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(255,255,255,0.6)",
                },
              },
              "& .MuiInputBase-input": {
                color: "#fff",
                "&::placeholder": {
                  color: "rgba(255,255,255,0.6)",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(255,255,255,0.6)" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {showVotingFeatures && (
          <Box sx={{ mb: 3, width: "100%", textAlign: "left" }}>
            <IconButton
              onClick={() => setShowVotingFeatures(false)}
              sx={{ color: "#fff" }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
        )}

        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
          sx={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {filteredFeatures.map((feature, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  maxWidth: "280px",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  display: "flex",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    background: "rgba(255,255,255,0.15)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => {
                    if (feature.onClick) {
                      feature.onClick();
                    } else if (feature.path) {
                      navigate(feature.path);
                    }
                  }}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    p: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      fontSize: "2rem",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 0,
                      flex: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        mb: 1,
                        fontSize: "1.1rem",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.8rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {feature.subtitle}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
