import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import WaveBackground from "./WaveBackground";
import LnmiitLogo from "./common/LnmiitLogo";
import api from "../utils/apiClient";

const Login = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        setErrorMessage("");

        // Send only email and password without the role parameter
        const credentials = {
          email: formData.email,
          password: formData.password,
        };

        // Call the login API endpoint
        const response = await api.auth.login(credentials);

        // Store the authentication token and user data
        localStorage.setItem("authToken", response.token);

        // Handle both single role string and roles array format
        const userRole = response.user.roles
          ? response.user.roles[0]
          : response.user.role;
        localStorage.setItem("userRole", userRole);

        try {
          // Fetch the complete user profile to ensure we have the latest data including profile photo
          const profileResponse = await api.users.getProfile();
          if (profileResponse && profileResponse.data) {
            // Format and store the complete user data with proper photo URLs
            const userData = profileResponse.data;

            // Process profile photo URL if it exists
            if (userData.profilePhoto && userData.profilePhoto.url) {
              const photoUrl = userData.profilePhoto.url;
              const BASE_URL =
                process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

              if (photoUrl.startsWith("/")) {
                userData.profilePhoto.fullUrl = `${BASE_URL}${photoUrl}`;
              }
            }

            // Store the enhanced user data in localStorage
            localStorage.setItem("userData", JSON.stringify(userData));
          }
        } catch (profileError) {
          console.error("Error fetching complete profile:", profileError);
          // Fall back to the user data from login if profile fetch fails
          localStorage.setItem("userData", JSON.stringify(response.user));
        }

        // Navigate to the appropriate dashboard based on role
        switch (role) {
          case "student":
            navigate("/student/dashboard");
            break;
          case "faculty":
            navigate("/faculty/dashboard");
            break;
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "council":
            navigate("/council/dashboard");
            break;
          default:
            navigate("/");
        }
      } catch (error) {
        console.error("Login failed:", error);
        setErrorMessage(
          error.message || "Login failed. Please check your credentials."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case "student":
        return "Student Login";
      case "faculty":
        return "Faculty Login";
      case "admin":
        return "Admin Login";
      case "council":
        return "Council Login";
      default:
        return "Login";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WaveBackground />
      <Container maxWidth="sm">
        {/* LNMIIT Logo */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <LnmiitLogo width={200} height={65} />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => navigate("/")}
              sx={{ color: "#fff", mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {getRoleTitle()}
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.1)",
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
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiInputBase-input": {
                  color: "#fff",
                },
                "& .MuiFormHelperText-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "rgba(255,255,255,0.7)" }}
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.1)",
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
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiInputBase-input": {
                  color: "#fff",
                },
                "& .MuiFormHelperText-root": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                py: 1.5,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                "&:hover": {
                  background: "rgba(255,255,255,0.3)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
