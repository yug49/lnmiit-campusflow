import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const FacultyNoDuesForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    name: "",
    facultyId: "",
    department: "",
    designation: "",
    dateOfJoining: "",
    dateOfRelieving: "",
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      branch: "",
      bankName: "",
      city: "",
      ifscCode: "",
      cancelledCheque: null,
    },
    mobileNumber: "",
    email: "",
    permanentAddress: "",
    reasonForLeaving: "",
    handoverNotes: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch user profile data when the component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Mock API call - in a real application, this would fetch actual data
        // const userData = await api.users.getProfile();

        // For demo purposes, simulating a delay and pre-filling with sample data
        setTimeout(() => {
          setFormData((prevData) => ({
            ...prevData,
            name: "Dr. Jane Smith",
            facultyId: "FAC12345",
            department: "CSE",
            designation: "Associate Professor",
            email: "jane.smith@lnmiit.ac.in",
            mobileNumber: "9876543210",
          }));
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setNotification({
          open: true,
          message: "Failed to fetch your profile data. Please try again.",
          severity: "error",
        });
        setLoading(false);
      }
    };

    // Check if user is logged in (token exists)
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear errors when user types
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (errors[`${parent}.${child}`]) {
        setErrors((prev) => ({
          ...prev,
          [`${parent}.${child}`]: null,
        }));
      }
    } else if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          cancelledCheque: file,
        },
      }));

      // Clear error if it exists
      if (errors["bankDetails.cancelledCheque"]) {
        setErrors((prev) => ({
          ...prev,
          "bankDetails.cancelledCheque": null,
        }));
      }
    }
  };

  const handleHandoverNotesFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        handoverNotesFile: file,
      }));

      if (errors.handoverNotesFile) {
        setErrors((prev) => ({
          ...prev,
          handoverNotesFile: null,
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.facultyId) newErrors.facultyId = "Faculty ID is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.designation)
      newErrors.designation = "Designation is required";
    if (!formData.dateOfJoining)
      newErrors.dateOfJoining = "Date of joining is required";
    if (!formData.dateOfRelieving)
      newErrors.dateOfRelieving = "Date of relieving is required";

    // Bank details validation
    if (!formData.bankDetails.accountHolderName)
      newErrors["bankDetails.accountHolderName"] =
        "Account Holder Name is required";
    if (!formData.bankDetails.accountNumber)
      newErrors["bankDetails.accountNumber"] = "Account Number is required";
    if (!formData.bankDetails.branch)
      newErrors["bankDetails.branch"] = "Branch is required";
    if (!formData.bankDetails.bankName)
      newErrors["bankDetails.bankName"] = "Bank Name is required";
    if (!formData.bankDetails.city)
      newErrors["bankDetails.city"] = "City is required";
    if (!formData.bankDetails.ifscCode)
      newErrors["bankDetails.ifscCode"] = "IFSC Code is required";
    if (!formData.bankDetails.cancelledCheque)
      newErrors["bankDetails.cancelledCheque"] = "Cancelled Cheque is required";

    // Contact information validation
    if (!formData.mobileNumber)
      newErrors.mobileNumber = "Mobile Number is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.permanentAddress)
      newErrors.permanentAddress = "Permanent Address is required";
    if (!formData.reasonForLeaving)
      newErrors.reasonForLeaving = "Reason for leaving is required";

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Mobile number validation
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Invalid mobile number";
    }

    // Date validation
    if (formData.dateOfJoining && formData.dateOfRelieving) {
      const joiningDate = new Date(formData.dateOfJoining);
      const relievingDate = new Date(formData.dateOfRelieving);
      if (relievingDate <= joiningDate) {
        newErrors.dateOfRelieving = "Relieving date must be after joining date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);

        // Simulate API call and success (mock implementation)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setNotification({
          open: true,
          message:
            "Form submitted successfully! Your no-dues request has been sent for approval.",
          severity: "success",
        });

        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate("/faculty/dashboard");
        }, 2000);
      } catch (error) {
        console.error("Error submitting form:", error);
        setNotification({
          open: true,
          message:
            error.message ||
            "An error occurred while submitting the form. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // If loading initial data, show loading state
  if (loading && !formData.name) {
    return (
      <>
        <WaveBackground />
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ color: "#fff", mt: 2 }}>
              Loading your information...
            </Typography>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <WaveBackground />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: "#fff", mb: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: "#fff",
              fontWeight: 600,
              mb: 4,
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Faculty No Dues Form
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 2,
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    mb: 1,
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    pb: 1,
                  }}
                >
                  Personal Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                      required
                      fullWidth
                      label="Faculty ID"
                      name="facultyId"
                      value={formData.facultyId}
                      onChange={handleChange}
                      error={!!errors.facultyId}
                      helperText={errors.facultyId}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                    <FormControl
                      fullWidth
                      required
                      error={!!errors.department}
                      disabled={loading}
                      sx={{
                        minWidth: "200px",
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.7)",
                        },
                        "& .MuiSelect-icon": {
                          color: "rgba(255,255,255,0.7)",
                        },
                        "& .MuiSelect-select": {
                          color: "#fff",
                        },
                      }}
                    >
                      <InputLabel>Department</InputLabel>
                      <Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        label="Department"
                      >
                        <MenuItem value="CSE">
                          Computer Science & Engineering
                        </MenuItem>
                        <MenuItem value="ECE">
                          Electronics & Communication Engineering
                        </MenuItem>
                        <MenuItem value="EEE">
                          Electrical & Electronics Engineering
                        </MenuItem>
                        <MenuItem value="ME">Mechanical Engineering</MenuItem>
                        <MenuItem value="HSS">
                          Humanities & Social Sciences
                        </MenuItem>
                        <MenuItem value="MATHS">Mathematics</MenuItem>
                        <MenuItem value="PHYSICS">Physics</MenuItem>
                      </Select>
                      {errors.department && (
                        <FormHelperText>{errors.department}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      required
                      error={!!errors.designation}
                      disabled={loading}
                      sx={{
                        minWidth: "200px",
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.7)",
                        },
                        "& .MuiSelect-icon": {
                          color: "rgba(255,255,255,0.7)",
                        },
                        "& .MuiSelect-select": {
                          color: "#fff",
                        },
                      }}
                    >
                      <InputLabel>Designation</InputLabel>
                      <Select
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        label="Designation"
                      >
                        <MenuItem value="Assistant Professor">
                          Assistant Professor
                        </MenuItem>
                        <MenuItem value="Associate Professor">
                          Associate Professor
                        </MenuItem>
                        <MenuItem value="Professor">Professor</MenuItem>
                        <MenuItem value="Professor Emeritus">
                          Professor Emeritus
                        </MenuItem>
                        <MenuItem value="Visiting Faculty">
                          Visiting Faculty
                        </MenuItem>
                      </Select>
                      {errors.designation && (
                        <FormHelperText>{errors.designation}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Date of Joining"
                      name="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={handleChange}
                      error={!!errors.dateOfJoining}
                      helperText={errors.dateOfJoining}
                      disabled={loading}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                      required
                      fullWidth
                      label="Date of Relieving"
                      name="dateOfRelieving"
                      type="date"
                      value={formData.dateOfRelieving}
                      onChange={handleChange}
                      error={!!errors.dateOfRelieving}
                      helperText={errors.dateOfRelieving}
                      disabled={loading}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
              </Grid>

              {/* Bank Details */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    mb: 1,
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    pb: 1,
                  }}
                >
                  Bank Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Account Holder Name"
                      name="bankDetails.accountHolderName"
                      value={formData.bankDetails.accountHolderName}
                      onChange={handleChange}
                      error={!!errors["bankDetails.accountHolderName"]}
                      helperText={errors["bankDetails.accountHolderName"]}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                      required
                      fullWidth
                      label="Account Number"
                      name="bankDetails.accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={handleChange}
                      error={!!errors["bankDetails.accountNumber"]}
                      helperText={errors["bankDetails.accountNumber"]}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                      required
                      fullWidth
                      label="IFSC Code"
                      name="bankDetails.ifscCode"
                      value={formData.bankDetails.ifscCode}
                      onChange={handleChange}
                      error={!!errors["bankDetails.ifscCode"]}
                      helperText={errors["bankDetails.ifscCode"]}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                      required
                      fullWidth
                      label="Bank Name"
                      name="bankDetails.bankName"
                      value={formData.bankDetails.bankName}
                      onChange={handleChange}
                      error={!!errors["bankDetails.bankName"]}
                      helperText={errors["bankDetails.bankName"]}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                      required
                      fullWidth
                      label="Branch"
                      name="bankDetails.branch"
                      value={formData.bankDetails.branch}
                      onChange={handleChange}
                      error={!!errors["bankDetails.branch"]}
                      helperText={errors["bankDetails.branch"]}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                      required
                      fullWidth
                      label="City"
                      name="bankDetails.city"
                      value={formData.bankDetails.city}
                      onChange={handleChange}
                      error={!!errors["bankDetails.city"]}
                      helperText={errors["bankDetails.city"]}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                  <Grid item xs={12}>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      disabled={loading}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.2)",
                        },
                      }}
                    >
                      {formData.bankDetails.cancelledCheque
                        ? `Selected: ${formData.bankDetails.cancelledCheque.name}`
                        : "Upload Cancelled Cheque"}
                      <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {errors["bankDetails.cancelledCheque"] && (
                      <FormHelperText error sx={{ ml: 1.5 }}>
                        {errors["bankDetails.cancelledCheque"]}
                      </FormHelperText>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    mb: 1,
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    pb: 1,
                  }}
                >
                  Contact Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Email (Official)"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                      required
                      fullWidth
                      label="Mobile Number"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      error={!!errors.mobileNumber}
                      helperText={errors.mobileNumber}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
              </Grid>

              {/* Permanent Address Section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    mb: 1,
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    pb: 1,
                  }}
                >
                  Permanent Address
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={3}
                      label="Permanent Address"
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleChange}
                      error={!!errors.permanentAddress}
                      helperText={errors.permanentAddress}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
              </Grid>

              {/* Additional Info Section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    mb: 1,
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    pb: 1,
                  }}
                >
                  Additional Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={3}
                      label="Reason for Leaving"
                      name="reasonForLeaving"
                      value={formData.reasonForLeaving}
                      onChange={handleChange}
                      error={!!errors.reasonForLeaving}
                      helperText={errors.reasonForLeaving}
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Handover Notes"
                      name="handoverNotes"
                      value={formData.handoverNotes}
                      onChange={handleChange}
                      placeholder="Please provide details of any pending tasks, handover notes, etc."
                      disabled={loading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
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
                  <Grid item xs={12}>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      disabled={loading}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.2)",
                        },
                        mt: 1,
                      }}
                    >
                      {formData.handoverNotesFile
                        ? `Selected: ${formData.handoverNotesFile.name}`
                        : "Upload Handover Documents (Optional)"}
                      <VisuallyHiddenInput
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleHandoverNotesFileChange}
                      />
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sx={{ mt: 3 }}>
                <Divider
                  sx={{ backgroundColor: "rgba(255,255,255,0.1)", mb: 3 }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    color: "#fff",
                    mb: 3,
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  By submitting this form, I confirm that I have completed all
                  handover procedures and have no pending dues with the
                  institute.
                </Typography>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    backgroundColor: "#0078D4",
                    "&:hover": {
                      backgroundColor: "#006cbd",
                    },
                    py: 1.5,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Submit No Dues Form"
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          elevation={6}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FacultyNoDuesForm;
