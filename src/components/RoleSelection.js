import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import WaveBackground from "./WaveBackground";
import LnmiitLogo from "./common/LnmiitLogo";

const roles = [
  {
    title: "Regular Student",
    subtitle: "Access student services and resources",
    icon: <PersonIcon sx={{ fontSize: 40, color: "#fff" }} />,
    path: "/login",
    role: "student",
  },
  {
    title: "Students' Council",
    subtitle: "Manage student activities and events",
    icon: <GroupsIcon sx={{ fontSize: 40, color: "#fff" }} />,
    path: "/login",
    role: "council",
  },
  {
    title: "Faculty",
    subtitle: "Access faculty resources and tools",
    icon: <SchoolIcon sx={{ fontSize: 40, color: "#fff" }} />,
    path: "/login",
    role: "faculty",
  },
  {
    title: "Administration",
    subtitle: "Manage campus operations",
    icon: <AdminIcon sx={{ fontSize: 40, color: "#fff" }} />,
    path: "/login",
    role: "admin",
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = roles.filter((role) =>
    role.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WaveBackground />
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* LNMIIT Logo */}
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
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 600,
              mb: 2,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            LNMIIT-CampusFlow
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 4,
            }}
          >
            Select your role to continue
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search roles..."
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
          alignItems="center"
          sx={{
            width: "100%",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {filteredRoles.map((role) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={role.title}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 !important",
              }}
            >
              <Card
                sx={{
                  width: "220px",
                  height: "220px",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    background: "rgba(255,255,255,0.15)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/login/${role.role}`)}
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
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
                    }}
                  >
                    {role.icon}
                  </Box>
                  <CardContent sx={{ textAlign: "center", p: 0 }}>
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
                      {role.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.8rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {role.subtitle}
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

export default RoleSelection;
