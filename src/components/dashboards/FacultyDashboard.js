import React, { useState } from "react";
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
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import WaveBackground from "../WaveBackground";
import { useUser } from "../../context/UserContext";
import LnmiitLogo from "../common/LnmiitLogo";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { userProfilePhoto, userName } = useUser();

  // Define all features
  const features = [
    {
      id: 1,
      title: "Event Approvals",
      subtitle: "Review and approve council event requests",
      icon: "📅",
      path: "/faculty/event-approval",
    },
    {
      id: 2,
      title: "No Dues Approval",
      subtitle: "Approve student and faculty no dues requests",
      icon: "📝",
      path: "/faculty/student-approval",
    },
    {
      id: 3,
      title: "MOU Approval",
      subtitle: "Review and approve MOUs from student councils",
      icon: "📄",
      path: "/faculty/mou-approval",
    },
    {
      id: 4,
      title: "Invoice Approval",
      subtitle: "Review and approve invoice payment requests",
      icon: "💰",
      path: "/faculty/invoice-approval",
    },
    {
      id: 5,
      title: "Faculty No Dues Form",
      subtitle: "Submit and track your no dues requests",
      icon: "📋",
      path: "/faculty/no-dues",
    },
    // Removing My Profile button as requested
  ];

  const filteredFeatures = features.filter((feature) =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    navigate("/");
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
          {/* Logo in the header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              cursor: "pointer",
            }}
            onClick={() => navigate("/faculty/dashboard")}
          >
            <LnmiitLogo width={120} height={40} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                color: "#0078D4",
                fontWeight: 600,
                ml: 2,
              }}
            >
              LNMIIT-CampusConnect
            </Typography>
          </Box>

          <Tooltip title="My Account">
            <IconButton
              onClick={() => navigate("/my-account")}
              sx={{
                mr: 2,
                padding: 0.5,
                border: userProfilePhoto ? "none" : "1px solid #0078D4",
              }}
            >
              <Avatar
                src={userProfilePhoto}
                alt={userName || "User"}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: userProfilePhoto
                    ? "transparent"
                    : "rgba(0,120,212,0.1)",
                  color: "#0078D4",
                }}
              >
                {!userProfilePhoto && (userName?.charAt(0) || <PersonIcon />)}
              </Avatar>
            </IconButton>
          </Tooltip>
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
        {/* Logo in the center of main page */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 5,
          }}
        >
          <LnmiitLogo width={250} height={80} />
        </Box>

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
            Faculty Dashboard
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 4,
            }}
          >
            Manage your approvals and academic tasks
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search features..."
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
          {filteredFeatures.map((feature) => (
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
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FacultyDashboard;
