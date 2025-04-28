import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import WaveBackground from "../WaveBackground";
import api from "../../utils/apiClient";
import { useUser } from "../../context/UserContext";
import LnmiitLogo from "../common/LnmiitLogo";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Get user data from context
  const {
    userProfilePhoto,
    userName,
    loadUserData,
    fetchProfileData,
    isLoading,
  } = useUser();

  // Ensure we have up-to-date data when the component mounts
  useEffect(() => {
    // First try to load from API (most accurate)
    fetchProfileData();

    // As a fallback, also ensure local data is loaded
    loadUserData();
  }, [fetchProfileData, loadUserData]);

  const features = [
    {
      id: 1,
      title: "No Dues Form",
      subtitle:
        "Generate and track your no dues form with required faculty and administration signatures",
      icon: "📝",
      path: "/student/no-dues",
    },
    {
      id: 2,
      title: "Voting System",
      subtitle: "Cast your vote in college elections after admin approval",
      icon: "🗳️",
      path: "/student/voting",
    },
    // Removing My Profile button as requested
  ];

  const filteredFeatures = features.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      navigate("/");
    }
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
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Toolbar>
          {/* Logo in the header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              cursor: "pointer",
            }}
            onClick={() => navigate("/student/dashboard")}
          >
            <LnmiitLogo width={120} height={40} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "#fff",
                fontWeight: 600,
                letterSpacing: "0.5px",
                ml: 2,
              }}
            >
              LNMIIT-CampusConnect
            </Typography>
          </Box>
          <Chip
            label={userName ? `Hello, ${userName.split(" ")[0]}` : "Student"}
            variant="outlined"
            size="small"
            sx={{
              mr: 2,
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiChip-label": { fontWeight: 500 },
            }}
          />
          <Tooltip title="My Account">
            <IconButton
              onClick={handleNavigateToAccount}
              sx={{
                mr: 2,
                padding: 0.5,
                border: userProfilePhoto
                  ? "none"
                  : "1px solid rgba(255,255,255,0.3)",
                position: "relative",
              }}
            >
              {isLoading ? (
                <CircularProgress
                  size={24}
                  color="inherit"
                  sx={{ color: "white" }}
                />
              ) : (
                <Avatar
                  src={userProfilePhoto}
                  alt={userName || "User"}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: userProfilePhoto
                      ? "transparent"
                      : "rgba(255,255,255,0.2)",
                    color: "#fff",
                  }}
                >
                  {!userProfilePhoto && (userName?.charAt(0) || <PersonIcon />)}
                </Avatar>
              )}
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={handleLogout}
            sx={{
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
            aria-label="logout"
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
          py: 6,
        }}
      >
        {/* Logo in the center of main page */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 6,
          }}
        >
          <LnmiitLogo width={250} height={80} />
        </Box>

        <Box
          sx={{
            textAlign: "center",
            mb: 8,
            color: "#fff",
            width: "100%",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              letterSpacing: "-0.5px",
            }}
          >
            Student Dashboard
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 5,
              maxWidth: "700px",
              mx: "auto",
              fontWeight: 400,
            }}
          >
            Access your student services and resources in one place
          </Typography>

          <Box
            sx={{
              position: "relative",
              maxWidth: "500px",
              mx: "auto",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "50px",
                  height: "56px",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                    borderWidth: "1.5px",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(255,255,255,0.7)",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#fff",
                  padding: "12px 20px",
                  paddingLeft: "60px",
                  fontSize: "1.1rem",
                  "&::placeholder": {
                    color: "rgba(255,255,255,0.7)",
                    opacity: 1,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ position: "absolute", left: "20px" }}
                  >
                    <SearchIcon
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "1.5rem",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />
            {/* Removing "services available" tag */}
          </Box>
        </Box>

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
          {filteredFeatures.length > 0 ? (
            filteredFeatures.map((feature) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={feature.id}
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
                    onClick={() => navigate(feature.path)}
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
                    <CardContent
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
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Box
              sx={{
                textAlign: "center",
                width: "100%",
                py: 8,
                backgroundColor: "rgba(0,0,0,0.1)",
                borderRadius: "16px",
                border: "1px dashed rgba(255,255,255,0.2)",
              }}
            >
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
                No matching features found
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.5)", mt: 1 }}
              >
                Try searching with different keywords
              </Typography>
            </Box>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
