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
  MenuItem,
  Select,
  FormHelperText,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";

// Styled component for visually hidden input (for file uploads)
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

const MOUAdditionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    partnerName: "",
    partnerType: "",
    startDate: "",
    endDate: "",
    purpose: "",
    scope: "",
    financialTerms: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    mouDocument: null,
    supportingDocuments: [],
  });

  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle file uploads
  const handleFileUpload = (e, fieldName) => {
    const files = e.target.files;

    if (fieldName === "mouDocument") {
      setFormData({
        ...formData,
        [fieldName]: files[0],
      });
    } else if (fieldName === "supportingDocuments") {
      setFormData({
        ...formData,
        [fieldName]: [...formData.supportingDocuments, ...Array.from(files)],
      });
    }

    // Clear error when user uploads file
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: "",
      });
    }
  };

  // Remove a supporting document
  const removeSupportingDocument = (index) => {
    const updatedDocs = [...formData.supportingDocuments];
    updatedDocs.splice(index, 1);
    setFormData({
      ...formData,
      supportingDocuments: updatedDocs,
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "MOU title is required";
    }

    if (!formData.partnerName.trim()) {
      newErrors.partnerName = "Partner name is required";
    }

    if (!formData.partnerType) {
      newErrors.partnerType = "Partner type is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (
      formData.startDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = "Purpose is required";
    }

    if (!formData.scope.trim()) {
      newErrors.scope = "Scope is required";
    }

    if (!formData.contactPersonName.trim()) {
      newErrors.contactPersonName = "Contact person name is required";
    }

    if (!formData.contactPersonEmail.trim()) {
      newErrors.contactPersonEmail = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactPersonEmail)) {
      newErrors.contactPersonEmail = "Email is invalid";
    }

    if (!formData.contactPersonPhone.trim()) {
      newErrors.contactPersonPhone = "Contact phone is required";
    } else if (
      !/^\d{10}$/.test(formData.contactPersonPhone.replace(/[- ]/g, ""))
    ) {
      newErrors.contactPersonPhone = "Phone number should be 10 digits";
    }

    if (!formData.mouDocument) {
      newErrors.mouDocument = "MOU document is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Here you would typically submit to an API
      console.log("Form submitted:", formData);

      // Show success message and redirect
      alert("MOU submitted successfully!");
      navigate("/council/dashboard");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WaveBackground />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <IconButton
          onClick={() => navigate("/council/dashboard")}
          sx={{
            color: "#fff",
            mb: 2,
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Card
          sx={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: "#fff",
                fontWeight: 600,
                mb: 4,
                textAlign: "center",
              }}
            >
              Add New Memorandum of Understanding
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic MOU Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      mb: 2,
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                      pb: 1,
                    }}
                  >
                    Basic Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="MOU Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        error={!!errors.title}
                        helperText={errors.title}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Partner Name"
                        name="partnerName"
                        value={formData.partnerName}
                        onChange={handleChange}
                        error={!!errors.partnerName}
                        helperText={errors.partnerName}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        error={!!errors.partnerType}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiSelect-select": { color: "#fff" },
                        }}
                      >
                        <InputLabel>Partner Type</InputLabel>
                        <Select
                          name="partnerType"
                          value={formData.partnerType}
                          onChange={handleChange}
                          label="Partner Type"
                        >
                          <MenuItem value="academic">
                            Academic Institution
                          </MenuItem>
                          <MenuItem value="industry">Industry</MenuItem>
                          <MenuItem value="government">
                            Government Organization
                          </MenuItem>
                          <MenuItem value="nonprofit">
                            Non-Profit Organization
                          </MenuItem>
                          <MenuItem value="research">
                            Research Institute
                          </MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                        {errors.partnerType && (
                          <FormHelperText>{errors.partnerType}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        error={!!errors.startDate}
                        helperText={errors.startDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="End Date"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* MOU Details */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      mb: 2,
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                      pb: 1,
                    }}
                  >
                    MOU Details
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Purpose of MOU"
                        name="purpose"
                        multiline
                        rows={2}
                        value={formData.purpose}
                        onChange={handleChange}
                        error={!!errors.purpose}
                        helperText={errors.purpose}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Scope of Collaboration"
                        name="scope"
                        multiline
                        rows={3}
                        value={formData.scope}
                        onChange={handleChange}
                        error={!!errors.scope}
                        helperText={errors.scope}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Financial Terms (if any)"
                        name="financialTerms"
                        multiline
                        rows={2}
                        value={formData.financialTerms}
                        onChange={handleChange}
                        error={!!errors.financialTerms}
                        helperText={errors.financialTerms}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      mb: 2,
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                      pb: 1,
                    }}
                  >
                    Contact Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Contact Person Name"
                        name="contactPersonName"
                        value={formData.contactPersonName}
                        onChange={handleChange}
                        error={!!errors.contactPersonName}
                        helperText={errors.contactPersonName}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Contact Email"
                        name="contactPersonEmail"
                        type="email"
                        value={formData.contactPersonEmail}
                        onChange={handleChange}
                        error={!!errors.contactPersonEmail}
                        helperText={errors.contactPersonEmail}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Contact Phone"
                        name="contactPersonPhone"
                        value={formData.contactPersonPhone}
                        onChange={handleChange}
                        error={!!errors.contactPersonPhone}
                        helperText={errors.contactPersonPhone}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.7)",
                          },
                          "& .MuiOutlinedInput-input": { color: "#fff" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Document Upload */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      mb: 2,
                      borderBottom: "1px solid rgba(255,255,255,0.2)",
                      pb: 1,
                    }}
                  >
                    Document Upload
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        sx={{
                          p: 1.5,
                          color: "#fff",
                          borderColor: "rgba(255,255,255,0.3)",
                          "&:hover": {
                            borderColor: "rgba(255,255,255,0.5)",
                          },
                          backgroundColor: formData.mouDocument
                            ? "rgba(0,120,212,0.2)"
                            : "transparent",
                        }}
                      >
                        {formData.mouDocument
                          ? `Uploaded: ${formData.mouDocument.name}`
                          : "Upload MOU Document (PDF)"}
                        <VisuallyHiddenInput
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, "mouDocument")}
                        />
                      </Button>
                      {errors.mouDocument && (
                        <Typography
                          color="error"
                          variant="caption"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          {errors.mouDocument}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        sx={{
                          p: 1.5,
                          color: "#fff",
                          borderColor: "rgba(255,255,255,0.3)",
                          "&:hover": {
                            borderColor: "rgba(255,255,255,0.5)",
                          },
                        }}
                      >
                        Upload Supporting Documents (Optional)
                        <VisuallyHiddenInput
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          multiple
                          onChange={(e) =>
                            handleFileUpload(e, "supportingDocuments")
                          }
                        />
                      </Button>

                      {formData.supportingDocuments.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "#fff", mb: 1 }}
                          >
                            Uploaded Documents:
                          </Typography>
                          {formData.supportingDocuments.map((doc, index) => (
                            <Paper
                              key={index}
                              sx={{
                                p: 1.5,
                                mb: 1,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backgroundColor: "rgba(255,255,255,0.1)",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: "#fff" }}
                              >
                                {doc.name}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => removeSupportingDocument(index)}
                                sx={{ color: "rgba(255,0,0,0.7)" }}
                              >
                                ×
                              </IconButton>
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Grid>

                {/* Submit Section */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{
                        px: 5,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "1rem",
                      }}
                    >
                      Submit MOU
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default MOUAdditionForm;
