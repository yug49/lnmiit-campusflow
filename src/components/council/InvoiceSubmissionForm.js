import React, { useState } from "react";
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
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Styled component for visually hidden file input
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

const InvoiceSubmissionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form data state
  const [formData, setFormData] = useState({
    eventName: "",
    vendorName: "",
    invoiceNumber: "",
    invoiceDate: null,
    amount: "",
    paymentDueDate: null,
    eventType: "",
    description: "",
    invoiceFile: null,
    purchaseCategory: "",
    budgetCode: "",
    paymentStatus: "pending",
  });

  // Input validation errors
  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: date,
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        invoiceFile: file,
      }));

      if (errors.invoiceFile) {
        setErrors((prev) => ({
          ...prev,
          invoiceFile: null,
        }));
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.eventName) newErrors.eventName = "Event name is required";
    if (!formData.vendorName) newErrors.vendorName = "Vendor name is required";
    if (!formData.invoiceNumber)
      newErrors.invoiceNumber = "Invoice number is required";
    if (!formData.invoiceDate)
      newErrors.invoiceDate = "Invoice date is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    else if (isNaN(formData.amount) || Number(formData.amount) <= 0)
      newErrors.amount = "Please enter a valid amount";
    if (!formData.paymentDueDate)
      newErrors.paymentDueDate = "Payment due date is required";
    if (!formData.eventType) newErrors.eventType = "Event type is required";
    if (!formData.purchaseCategory)
      newErrors.purchaseCategory = "Purchase category is required";
    if (!formData.budgetCode) newErrors.budgetCode = "Budget code is required";
    if (!formData.invoiceFile)
      newErrors.invoiceFile = "Invoice file is required";

    // Check if invoice date is after due date
    if (
      formData.invoiceDate &&
      formData.paymentDueDate &&
      formData.invoiceDate > formData.paymentDueDate
    ) {
      newErrors.paymentDueDate =
        "Payment due date cannot be before invoice date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Mock API call - In a real application, this would call your actual API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setNotification({
        open: true,
        message: "Invoice submitted successfully!",
        severity: "success",
      });

      // Navigate to invoice records after successful submission
      setTimeout(() => {
        navigate("/council/invoice-records");
      }, 2000);
    } catch (error) {
      console.error("Error submitting invoice:", error);
      setNotification({
        open: true,
        message: "Failed to submit invoice. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecords = () => {
    navigate("/council/invoice-records");
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Shared TextField styles for consistency
  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255,255,255,0.1)",
      backdropFilter: "blur(10px)",
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.2)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.7)",
    },
    "& .MuiInputBase-input": {
      color: "#fff",
    },
    "& .MuiSvgIcon-root": {
      color: "rgba(255,255,255,0.7)",
    },
  };

  return (
    <>
      <WaveBackground />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ color: "#fff", mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: "#fff",
                fontWeight: 600,
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Submit Invoice
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleViewRecords}
            startIcon={<ReceiptLongIcon />}
            sx={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.5)",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            View Invoice Records
          </Button>
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
              {/* Event Information */}
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
                  Event Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Event Name"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      error={!!errors.eventName}
                      helperText={errors.eventName}
                      disabled={loading}
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={!!errors.eventType}
                      disabled={loading}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
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
                      <InputLabel>Event Type</InputLabel>
                      <Select
                        name="eventType"
                        value={formData.eventType}
                        label="Event Type"
                        onChange={handleChange}
                      >
                        <MenuItem value="technical">Technical</MenuItem>
                        <MenuItem value="cultural">Cultural</MenuItem>
                        <MenuItem value="sports">Sports</MenuItem>
                        <MenuItem value="workshop">Workshop</MenuItem>
                        <MenuItem value="conference">Conference</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                      {errors.eventType && (
                        <FormHelperText>{errors.eventType}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              {/* Invoice Details */}
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
                  Invoice Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Vendor Name"
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleChange}
                      error={!!errors.vendorName}
                      helperText={errors.vendorName}
                      disabled={loading}
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Invoice Number"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleChange}
                      error={!!errors.invoiceNumber}
                      helperText={errors.invoiceNumber}
                      disabled={loading}
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Invoice Date"
                        value={formData.invoiceDate}
                        onChange={(date) =>
                          handleDateChange("invoiceDate", date)
                        }
                        disabled={loading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            error={!!errors.invoiceDate}
                            helperText={errors.invoiceDate}
                            sx={textFieldSx}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Payment Due Date"
                        value={formData.paymentDueDate}
                        onChange={(date) =>
                          handleDateChange("paymentDueDate", date)
                        }
                        disabled={loading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            error={!!errors.paymentDueDate}
                            helperText={errors.paymentDueDate}
                            sx={textFieldSx}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      error={!!errors.amount}
                      helperText={errors.amount}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                      sx={{
                        ...textFieldSx,
                        "& .MuiInputAdornment-root": {
                          color: "rgba(255,255,255,0.7)",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={!!errors.purchaseCategory}
                      disabled={loading}
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.2)",
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
                      <InputLabel>Purchase Category</InputLabel>
                      <Select
                        name="purchaseCategory"
                        value={formData.purchaseCategory}
                        label="Purchase Category"
                        onChange={handleChange}
                      >
                        <MenuItem value="equipment">Equipment</MenuItem>
                        <MenuItem value="venue">Venue</MenuItem>
                        <MenuItem value="food">Food & Catering</MenuItem>
                        <MenuItem value="transportation">
                          Transportation
                        </MenuItem>
                        <MenuItem value="marketing">
                          Marketing & Promotion
                        </MenuItem>
                        <MenuItem value="decoration">Decoration</MenuItem>
                        <MenuItem value="hospitality">Hospitality</MenuItem>
                        <MenuItem value="merchandise">Merchandise</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                      {errors.purchaseCategory && (
                        <FormHelperText>
                          {errors.purchaseCategory}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Budget Code"
                      name="budgetCode"
                      value={formData.budgetCode}
                      onChange={handleChange}
                      error={!!errors.budgetCode}
                      helperText={
                        errors.budgetCode ||
                        "Enter the budget code for this expense"
                      }
                      disabled={loading}
                      sx={{
                        ...textFieldSx,
                        "& .MuiFormHelperText-root": {
                          color: errors.budgetCode
                            ? undefined
                            : "rgba(255,255,255,0.5)",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Invoice Description */}
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
                  Description & Attachments
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the purpose of this invoice and any relevant details"
                      disabled={loading}
                      sx={textFieldSx}
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
                        mt: 1,
                        backgroundColor: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.2)",
                        },
                      }}
                    >
                      {formData.invoiceFile
                        ? `Selected: ${formData.invoiceFile.name}`
                        : "Upload Invoice Document"}
                      <VisuallyHiddenInput
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {errors.invoiceFile && (
                      <FormHelperText error sx={{ ml: 2 }}>
                        {errors.invoiceFile}
                      </FormHelperText>
                    )}
                    {!errors.invoiceFile && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          ml: 2,
                          mt: 0.5,
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        Upload a scanned copy or photo of the vendor invoice
                        (PDF, JPG, PNG)
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sx={{ mt: 3 }}>
                <Divider
                  sx={{ backgroundColor: "rgba(255,255,255,0.1)", mb: 3 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    mb: 3,
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  By submitting this invoice, I confirm that all information is
                  accurate and complete.
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
                    py: 1.5,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Submit Invoice for Approval"
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

export default InvoiceSubmissionForm;
