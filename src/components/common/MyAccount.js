import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/apiClient";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WaveBackground from "../WaveBackground";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

// Get the API base URL from environment or use default
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

const MyAccount = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // User profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contactNumber: "",
    department: "",
    designation: "",
    // Student fields
    rollNumber: "",
    yearOfJoining: "",
    yearOfGraduation: "",
    program: "",
    // Faculty fields
    employeeId: "",
    // Council fields
    position: "",
    // Address fields
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    },
  });

  // File upload states
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState("");

  // Refs for file inputs
  const profilePhotoRef = useRef();
  const signatureRef = useRef();

  // Use the useUser hook directly without assigning to an unused variable
  useUser();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.users.getProfile();

        if (response && response.data) {
          const userData = response.data;
          setProfile({
            ...userData,
            // Ensure address is not null
            address: userData.address || {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "India",
            },
            // Ensure these are strings or empty strings for form inputs
            yearOfJoining: userData.yearOfJoining
              ? userData.yearOfJoining.toString()
              : "",
            yearOfGraduation: userData.yearOfGraduation
              ? userData.yearOfGraduation.toString()
              : "",
          });

          // Set photo previews if available with proper URL formatting
          if (userData.profilePhoto && userData.profilePhoto.url) {
            const photoUrl = userData.profilePhoto.url;
            if (photoUrl.startsWith("/")) {
              setProfilePhotoPreview(`${API_BASE_URL}${photoUrl}`);
            } else {
              setProfilePhotoPreview(photoUrl);
            }
          }

          if (userData.digitalSignature && userData.digitalSignature.url) {
            const signatureUrl = userData.digitalSignature.url;
            if (signatureUrl.startsWith("/")) {
              setSignaturePreview(`${API_BASE_URL}${signatureUrl}`);
            } else {
              setSignaturePreview(signatureUrl);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Handle nested properties (address)
      const [parent, child] = name.split(".");
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  // Handle profile photo change
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      setError("Please upload an image file (JPEG, PNG, GIF)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5MB");
      return;
    }

    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  // Handle signature file change
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type;
    if (
      !fileType.match(/^image\/(jpeg|jpg|png|gif)$/) &&
      fileType !== "application/pdf"
    ) {
      setError("Please upload an image or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5MB");
      return;
    }

    setSignatureFile(file);

    if (fileType.startsWith("image/")) {
      setSignaturePreview(URL.createObjectURL(file));
    } else {
      // For PDF, use a placeholder
      setSignaturePreview("/images/pdf-placeholder.png");
    }
    setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      // Update profile details
      const profileData = {
        ...profile,
        yearOfJoining: profile.yearOfJoining
          ? parseInt(profile.yearOfJoining, 10)
          : undefined,
        yearOfGraduation: profile.yearOfGraduation
          ? parseInt(profile.yearOfGraduation, 10)
          : undefined,
      };

      await api.users.updateProfile(profileData);

      // Upload profile photo if selected
      if (profilePhotoFile) {
        // The apiClient will now directly notify the UserContext
        await api.users.uploadProfilePhoto(profilePhotoFile);
      }

      // Upload signature if selected
      if (signatureFile) {
        await api.users.uploadDigitalSignature(signatureFile);
      }

      setSuccess("Profile updated successfully");
      // Clean up file upload states
      setProfilePhotoFile(null);
      setSignatureFile(null);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine which fields to show based on user role
  const showStudentFields = profile.role === "student";
  const showFacultyFields = profile.role === "faculty";
  const showCouncilFields = profile.role === "council";
  const showAdminFields = profile.role === "admin";

  const handleBack = () => {
    if (profile.role === "student") {
      navigate("/student/dashboard");
    } else if (profile.role === "faculty") {
      navigate("/faculty/dashboard");
    } else if (profile.role === "admin") {
      navigate("/admin/dashboard");
    } else if (profile.role === "council") {
      navigate("/council/dashboard");
    } else {
      navigate("/");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <WaveBackground />
        <CircularProgress sx={{ color: "#fff" }} />
      </Box>
    );
  }

  // Get title based on user role
  const getRoleTitle = () => {
    switch (profile.role) {
      case "student":
        return "Student Account";
      case "faculty":
        return "Faculty Account";
      case "admin":
        return "Admin Account";
      case "council":
        return "Council Account";
      default:
        return "My Account";
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={handleBack} sx={{ mr: 2, color: "#fff" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {getRoleTitle()}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 3 }} />

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Update your personal information and profile
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Left column - Personal Info */}
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(5px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
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
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={profile.email}
                        disabled
                        variant="outlined"
                        helperText="Email cannot be changed"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiInputBase-input": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiFormHelperText-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Contact Number"
                        name="contactNumber"
                        value={profile.contactNumber || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
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
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        name="department"
                        value={profile.department || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
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
                        }}
                      />
                    </Grid>
                    {showAdminFields && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Administrator Role"
                          name="designation"
                          value={profile.designation || "System Administrator"}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                    )}
                    {!showAdminFields && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Designation"
                          name="designation"
                          value={profile.designation || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                {/* Role-specific fields */}
                {showStudentFields && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
                      Student Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Roll Number"
                          name="rollNumber"
                          value={profile.rollNumber || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Program"
                          name="program"
                          value={profile.program || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Year of Joining"
                          name="yearOfJoining"
                          type="number"
                          value={profile.yearOfJoining || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Year of Graduation"
                          name="yearOfGraduation"
                          type="number"
                          value={profile.yearOfGraduation || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {showFacultyFields && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
                      Faculty Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Employee ID"
                          name="employeeId"
                          value={profile.employeeId || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Academic Rank"
                          name="academicRank"
                          value={profile.academicRank || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {showCouncilFields && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
                      Council Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Position"
                          name="position"
                          value={profile.position || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Council"
                          name="councilType"
                          value={profile.councilType || ""}
                          onChange={handleChange}
                          variant="outlined"
                          sx={{
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
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {showAdminFields && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(5px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
                      Administrative Access
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ color: "#fff" }}>
                          You have administrative privileges for the
                          LNMIIT-CampusFlow system. Your account has access to
                          approval workflows and system management features.
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(5px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, color: "#fff" }}>
                    Address
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Street Address"
                        name="address.street"
                        value={profile.address?.street || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
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
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        name="address.city"
                        value={profile.address?.city || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
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
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="State"
                        name="address.state"
                        value={profile.address?.state || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
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
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Postal Code"
                        name="address.zipCode"
                        value={profile.address?.zipCode || ""}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
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
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        name="address.country"
                        value={profile.address?.country || "India"}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{
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
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Right column - Photos and signature */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(5px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, alignSelf: "flex-start", color: "#fff" }}
                  >
                    Profile Photo
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      src={profilePhotoPreview}
                      alt="Profile Photo"
                      sx={{
                        width: 150,
                        height: 150,
                        mb: 2,
                        boxShadow: "0px 0px 15px rgba(255,255,255,0.2)",
                        border: "3px solid rgba(255,255,255,0.2)",
                      }}
                    />
                    <input
                      type="file"
                      ref={profilePhotoRef}
                      onChange={handleProfilePhotoChange}
                      style={{ display: "none" }}
                      accept="image/jpeg,image/png,image/gif"
                    />
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCameraIcon />}
                      onClick={() => profilePhotoRef.current.click()}
                      sx={{
                        mb: 1,
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.3)",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.6)",
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Change Photo
                    </Button>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        textAlign: "center",
                      }}
                    >
                      Upload a clear photo. Max size: 5MB.
                      <br />
                      Formats: JPG, PNG, GIF
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(5px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, alignSelf: "flex-start", color: "#fff" }}
                  >
                    Digital Signature
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: 100,
                        border: "1px dashed rgba(255,255,255,0.3)",
                        borderRadius: 1,
                        mb: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        backgroundColor: "rgba(255,255,255,0.05)",
                      }}
                    >
                      {signaturePreview ? (
                        <img
                          src={signaturePreview}
                          alt="Signature"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          No signature uploaded
                        </Typography>
                      )}
                    </Box>
                    <input
                      type="file"
                      ref={signatureRef}
                      onChange={handleSignatureChange}
                      style={{ display: "none" }}
                      accept="image/jpeg,image/png,image/gif,application/pdf"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => signatureRef.current.click()}
                      sx={{
                        mb: 1,
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.3)",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.6)",
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Upload Signature
                    </Button>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        textAlign: "center",
                      }}
                    >
                      Upload your signature. Max size: 5MB.
                      <br />
                      Formats: JPG, PNG, GIF, PDF
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{ mt: 4, mb: 2, display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={isSaving}
                startIcon={<SaveIcon />}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  "&:hover": {
                    background: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                {isSaving ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default MyAccount;
