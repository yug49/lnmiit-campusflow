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
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import WaveBackground from "./WaveBackground";

const Login = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Here you would typically make an API call to authenticate
      console.log("Login attempt:", { ...formData, role });

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
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "rgba(255,255,255,0.7)" }}
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
              Login
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
