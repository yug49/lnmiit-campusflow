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
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "./WaveBackground";
import api from "../utils/apiClient";

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

const StudentNoDuesForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    branch: "",
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      branch: "",
      bankName: "",
      city: "",
      ifscCode: "",
      cancelledCheque: null,
    },
    cautionMoneyDonation: "",
    residentialContact: "",
    mobileNumber: "",
    email: "",
    fatherName: "",
    fatherMobile: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch user profile data when the component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Get user data without creating an unused userProfile variable
        const userData = await api.users.getProfile();

        // Pre-fill the form with user data
        setFormData((prevData) => ({
          ...prevData,
          name: userData.name || "",
          rollNumber: userData.rollNumber || "",
          branch: userData.branch || "",
          email: userData.email || "",
          mobileNumber: userData.mobileNumber || "",
        }));
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setNotification({
          open: true,
          message: "Failed to fetch your profile data. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    // Check if user is logged in (token exists)
    const token = localStorage.getItem("authToken");
    if (token) {
      fetchUserProfile();
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

      // Clear error if it exists - use dot notation directly
      if (errors["bankDetails.cancelledCheque"]) {
        setErrors((prev) => ({
          ...prev,
          "bankDetails.cancelledCheque": null,
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.rollNumber) newErrors.rollNumber = "Roll Number is required";
    if (!formData.branch) newErrors.branch = "Branch is required";
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
    // Use dot notation directly instead of computed property
    if (!formData.bankDetails.cancelledCheque)
      newErrors["bankDetails.cancelledCheque"] = "Cancelled Cheque is required";
    if (!formData.cautionMoneyDonation)
      newErrors.cautionMoneyDonation = "Caution Money Donation is required";
    if (!formData.mobileNumber)
      newErrors.mobileNumber = "Mobile Number is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.fatherName)
      newErrors.fatherName = "Father's Name is required";
    if (!formData.fatherMobile)
      newErrors.fatherMobile = "Father's Mobile Number is required";
    if (!formData.address) newErrors.address = "Address is required";

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Mobile number validation
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Invalid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);

        // First submit the form data without the file
        const formDataWithoutFile = { ...formData };
        delete formDataWithoutFile.bankDetails.cancelledCheque;

        const response = await api.noDues.submitRequest(formDataWithoutFile);

        // If the request has an ID, upload the file
        if (response.id && formData.bankDetails.cancelledCheque) {
          const fileFormData = new FormData();
          fileFormData.append(
            "cheque",
            formData.bankDetails.cancelledCheque,
            formData.bankDetails.cancelledCheque.name
          );

          await api.noDues.uploadDocument(response.id, fileFormData);
        }

        setNotification({
          open: true,
          message:
            "Form submitted successfully! Your no-dues request has been sent for approval.",
          severity: "success",
        });

        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate("/student/dashboard");
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
            No Dues Form
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
                      label="Roll Number"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      error={!!errors.rollNumber}
                      helperText={errors.rollNumber}
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
                    <FormControl
                      fullWidth
                      required
                      error={!!errors.branch}
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
                      <InputLabel>Branch</InputLabel>
                      <Select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        label="Branch"
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
                      </Select>
                      {errors.branch && (
                        <FormHelperText>{errors.branch}</FormHelperText>
                      )}
                    </FormControl>
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
                      <FormHelperText error>
                        {errors["bankDetails.cancelledCheque"]}
                      </FormHelperText>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Donation Details */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    mb: 2,
                    fontWeight: 500,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    pb: 1,
                  }}
                >
                  Donation Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Caution Money Donation"
                      name="cautionMoneyDonation"
                      value={formData.cautionMoneyDonation}
                      onChange={handleChange}
                      error={!!errors.cautionMoneyDonation}
                      helperText={
                        errors.cautionMoneyDonation ||
                        "Amount you wish to donate from your caution money refund towards Students' Welfare Fund of LNMIIT"
                      }
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
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
                        "& .MuiFormHelperText-root": {
                          color: "rgba(255,255,255,0.7)",
                        },
                      }}
                    />
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
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Email (College)"
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
                      fullWidth
                      label="Residential Contact Number"
                      name="residentialContact"
                      value={formData.residentialContact}
                      onChange={handleChange}
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

              {/* Father's Information */}
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
                  Father's Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Father's Name"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      error={!!errors.fatherName}
                      helperText={errors.fatherName}
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
                      label="Father's Mobile Number"
                      name="fatherMobile"
                      value={formData.fatherMobile}
                      onChange={handleChange}
                      error={!!errors.fatherMobile}
                      helperText={errors.fatherMobile}
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

              {/* Address Section */}
              <Grid
                item
                xs={12}
                sx={{
                  mt: 4,
                  pt: 4,
                  borderTop: "2px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    mb: 3,
                    fontWeight: 500,
                  }}
                >
                  Address for Correspondence
                </Typography>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  disabled={loading}
                  sx={{
                    width: "100%",
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

              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 4 }}>
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

export default StudentNoDuesForm;
