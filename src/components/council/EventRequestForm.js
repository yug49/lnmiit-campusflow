import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Chip,
  FormGroup,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WaveBackground from "../WaveBackground";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const EventRequestForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editEventId = queryParams.get("edit");

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [currentInfoTopic, setCurrentInfoTopic] = useState("");

  const [eventData, setEventData] = useState({
    eventName: "",
    eventType: "",
    description: "",
    startDate: null,
    endDate: null,
    venue: "",
    expectedAttendance: "",
    budgetRequired: false,
    budgetAmount: "",
    budgetBreakdown: [{ item: "", amount: "" }],
    equipmentNeeded: [],
    facultyCoordinator: "",
    facultyEmail: "",
    studentCoordinator: "",
    studentEmail: "",
    studentPhone: "",
    supportingDocuments: [],
    termsAgreed: false,
  });

  const equipmentOptions = [
    "Projector",
    "Sound System",
    "Microphones",
    "Tables",
    "Chairs",
    "Podium",
    "Lighting Equipment",
    "Extension Cords",
    "Laptop",
    "Display Boards",
    "Generator",
    "Other",
  ];

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editEventId) {
      setIsLoading(true);
      setTimeout(() => {
        if (editEventId === "3") {
          setEventData({
            eventName: "Alumni Connect Workshop",
            eventType: "Guest Lecture",
            description:
              "A workshop series by alumni to help current students with industry preparation",
            startDate: new Date("2025-05-20T14:00:00"),
            endDate: new Date("2025-05-20T17:00:00"),
            venue: "Seminar Room 1",
            expectedAttendance: "100",
            budgetRequired: false,
            budgetAmount: "",
            budgetBreakdown: [{ item: "", amount: "" }],
            equipmentNeeded: ["Projector", "Microphones"],
            facultyCoordinator: "Dr. Amit Joshi",
            facultyEmail: "amit.joshi@lnmiit.ac.in",
            studentCoordinator: "Vikram Malhotra",
            studentEmail: "vikram.malhotra@lnmiit.ac.in",
            studentPhone: "7654321098",
            supportingDocuments: [
              { name: "alumni_workshop_agenda.pdf", size: 420000 },
            ],
            termsAgreed: true,
          });
        }
        setIsLoading(false);
      }, 1500);
    }
  }, [editEventId]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setEventData({
      ...eventData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleDateChange = (name, date) => {
    setEventData({
      ...eventData,
      [name]: date,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleEquipmentChange = (event) => {
    const { value, checked } = event.target;
    let newEquipment = [...eventData.equipmentNeeded];

    if (checked) {
      newEquipment.push(value);
    } else {
      newEquipment = newEquipment.filter((item) => item !== value);
    }

    setEventData({
      ...eventData,
      equipmentNeeded: newEquipment,
    });
  };

  const handleBudgetItemChange = (index, field, value) => {
    const newBreakdown = [...eventData.budgetBreakdown];
    newBreakdown[index][field] = value;
    setEventData({
      ...eventData,
      budgetBreakdown: newBreakdown,
    });
  };

  const addBudgetItem = () => {
    setEventData({
      ...eventData,
      budgetBreakdown: [...eventData.budgetBreakdown, { item: "", amount: "" }],
    });
  };

  const removeBudgetItem = (index) => {
    const newBreakdown = [...eventData.budgetBreakdown];
    newBreakdown.splice(index, 1);
    setEventData({
      ...eventData,
      budgetBreakdown: newBreakdown,
    });
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
    }));

    setEventData({
      ...eventData,
      supportingDocuments: [...eventData.supportingDocuments, ...newFiles],
    });
  };

  const removeFile = (index) => {
    const newFiles = [...eventData.supportingDocuments];
    newFiles.splice(index, 1);
    setEventData({
      ...eventData,
      supportingDocuments: newFiles,
    });
  };

  const validateCurrentStep = () => {
    let stepErrors = {};
    let isValid = true;

    switch (activeStep) {
      case 0:
        if (!eventData.eventName.trim()) {
          stepErrors.eventName = "Event name is required";
          isValid = false;
        }
        if (!eventData.eventType) {
          stepErrors.eventType = "Please select an event type";
          isValid = false;
        }
        if (!eventData.description.trim()) {
          stepErrors.description = "Description is required";
          isValid = false;
        } else if (eventData.description.length < 50) {
          stepErrors.description =
            "Description should be at least 50 characters";
          isValid = false;
        }
        break;

      case 1:
        if (!eventData.venue) {
          stepErrors.venue = "Venue is required";
          isValid = false;
        }
        if (!eventData.startDate) {
          stepErrors.startDate = "Start date is required";
          isValid = false;
        }
        if (!eventData.endDate) {
          stepErrors.endDate = "End date is required";
          isValid = false;
        }
        if (
          eventData.startDate &&
          eventData.endDate &&
          eventData.startDate > eventData.endDate
        ) {
          stepErrors.endDate = "End date must be after start date";
          isValid = false;
        }
        if (!eventData.expectedAttendance) {
          stepErrors.expectedAttendance = "Expected attendance is required";
          isValid = false;
        } else if (
          isNaN(eventData.expectedAttendance) ||
          parseInt(eventData.expectedAttendance) <= 0
        ) {
          stepErrors.expectedAttendance = "Please enter a valid number";
          isValid = false;
        }
        break;

      case 2:
        if (eventData.budgetRequired && !eventData.budgetAmount) {
          stepErrors.budgetAmount = "Budget amount is required";
          isValid = false;
        }
        if (
          eventData.budgetRequired &&
          eventData.budgetAmount &&
          (isNaN(eventData.budgetAmount) ||
            parseFloat(eventData.budgetAmount) <= 0)
        ) {
          stepErrors.budgetAmount = "Please enter a valid amount";
          isValid = false;
        }

        if (eventData.budgetRequired) {
          const hasEmptyBreakdownItems = eventData.budgetBreakdown.some(
            (item) =>
              !item.item.trim() ||
              !item.amount.trim() ||
              isNaN(item.amount) ||
              parseFloat(item.amount) <= 0
          );

          if (hasEmptyBreakdownItems) {
            stepErrors.budgetBreakdown =
              "Please complete all budget details with valid amounts";
            isValid = false;
          }

          const totalBreakdown = eventData.budgetBreakdown.reduce(
            (sum, item) =>
              sum + (isNaN(item.amount) ? 0 : parseFloat(item.amount)),
            0
          );

          if (
            Math.abs(totalBreakdown - parseFloat(eventData.budgetAmount)) > 0.01
          ) {
            stepErrors.budgetBreakdown = `Budget breakdown total (₹${totalBreakdown.toFixed(
              2
            )}) doesn't match the total budget amount (₹${parseFloat(
              eventData.budgetAmount
            ).toFixed(2)})`;
            isValid = false;
          }
        }
        break;

      case 3:
        if (!eventData.facultyCoordinator.trim()) {
          stepErrors.facultyCoordinator =
            "Faculty coordinator name is required";
          isValid = false;
        }
        if (!eventData.facultyEmail.trim()) {
          stepErrors.facultyEmail = "Faculty email is required";
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventData.facultyEmail)) {
          stepErrors.facultyEmail = "Please enter a valid email";
          isValid = false;
        }

        if (!eventData.studentCoordinator.trim()) {
          stepErrors.studentCoordinator =
            "Student coordinator name is required";
          isValid = false;
        }
        if (!eventData.studentEmail.trim()) {
          stepErrors.studentEmail = "Student email is required";
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventData.studentEmail)) {
          stepErrors.studentEmail = "Please enter a valid email";
          isValid = false;
        }

        if (!eventData.studentPhone.trim()) {
          stepErrors.studentPhone = "Student phone number is required";
          isValid = false;
        } else if (
          !/^\d{10}$/.test(eventData.studentPhone.replace(/\D/g, ""))
        ) {
          stepErrors.studentPhone =
            "Please enter a valid 10-digit phone number";
          isValid = false;
        }
        break;

      case 4:
        if (!eventData.termsAgreed) {
          stepErrors.termsAgreed = "You must agree to the terms and conditions";
          isValid = false;
        }
        break;

      default:
        break;
    }

    setErrors(stepErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (activeStep === 4) {
        setConfirmDialogOpen(true);
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => {
    setConfirmDialogOpen(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleInfoClick = (topic) => {
    setCurrentInfoTopic(topic);
    setInfoDialogOpen(true);
  };

  const getInfoText = (topic) => {
    const infoTexts = {
      eventType:
        "Choose the category that best describes your event. This helps in routing your request to the appropriate approval authorities.",
      budgetBreakdown:
        "Provide a detailed breakdown of how the budget will be utilized. Be specific about items, services, and their estimated costs.",
      equipmentNeeded:
        "Select all equipment that will be required for your event. If you need something not listed, select 'Other' and specify in your event description.",
      supportingDocuments:
        "Upload any documents that provide additional information about your event such as detailed agenda, speaker profiles, or promotional materials.",
      venue:
        "Select a venue that can accommodate your expected attendance. Popular venues may require booking well in advance.",
    };

    return infoTexts[topic] || "No information available for this topic.";
  };

  const handleCancel = () => {
    navigate("/council/permissions");
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const steps = [
    "Basic Information",
    "Venue & Schedule",
    "Resources & Budget",
    "Coordinators & Contact",
    "Review & Submit",
  ];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Event Name"
                name="eventName"
                value={eventData.eventName}
                onChange={handleChange}
                error={!!errors.eventName}
                helperText={errors.eventName}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.eventType}>
                <InputLabel>Event Type</InputLabel>
                <Select
                  name="eventType"
                  value={eventData.eventType}
                  onChange={handleChange}
                  label="Event Type"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleInfoClick("eventType")}
                        edge="end"
                        size="small"
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="Technical Workshop">
                    Technical Workshop
                  </MenuItem>
                  <MenuItem value="Cultural Event">Cultural Event</MenuItem>
                  <MenuItem value="Sports Event">Sports Event</MenuItem>
                  <MenuItem value="Guest Lecture">Guest Lecture</MenuItem>
                  <MenuItem value="Conference">Conference</MenuItem>
                  <MenuItem value="Competition">Competition</MenuItem>
                  <MenuItem value="Club Activity">Club Activity</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {errors.eventType && (
                  <FormHelperText>{errors.eventType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={5}
                label="Event Description"
                name="description"
                value={eventData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={
                  errors.description ||
                  "Provide a detailed description of your event including its purpose, target audience, and expected outcomes."
                }
                variant="outlined"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.venue}>
                <InputLabel>Venue</InputLabel>
                <Select
                  name="venue"
                  value={eventData.venue}
                  onChange={handleChange}
                  label="Venue"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleInfoClick("venue")}
                        edge="end"
                        size="small"
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Select Venue</MenuItem>
                  <MenuItem value="Auditorium">Auditorium</MenuItem>
                  <MenuItem value="Multi-purpose Hall">
                    Multi-purpose Hall
                  </MenuItem>
                  <MenuItem value="Open Air Theater">Open Air Theater</MenuItem>
                  <MenuItem value="Seminar Room 1">Seminar Room 1</MenuItem>
                  <MenuItem value="Seminar Room 2">Seminar Room 2</MenuItem>
                  <MenuItem value="Conference Room">Conference Room</MenuItem>
                  <MenuItem value="Sports Ground">Sports Ground</MenuItem>
                  <MenuItem value="Basketball Court">Basketball Court</MenuItem>
                  <MenuItem value="Volleyball Court">Volleyball Court</MenuItem>
                  <MenuItem value="Classroom B-201">Classroom B-201</MenuItem>
                  <MenuItem value="Classroom B-202">Classroom B-202</MenuItem>
                  <MenuItem value="Classroom B-203">Classroom B-203</MenuItem>
                  <MenuItem value="Other">
                    Other (Specify in Description)
                  </MenuItem>
                </Select>
                {errors.venue && (
                  <FormHelperText>{errors.venue}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={eventData.startDate}
                  onChange={(date) => handleDateChange("startDate", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                    />
                  )}
                  disablePast
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Date & Time"
                  value={eventData.endDate}
                  onChange={(date) => handleDateChange("endDate", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.endDate}
                      helperText={errors.endDate}
                    />
                  )}
                  disablePast
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Expected Attendance"
                name="expectedAttendance"
                value={eventData.expectedAttendance}
                onChange={handleChange}
                error={!!errors.expectedAttendance}
                helperText={errors.expectedAttendance}
                variant="outlined"
                type="number"
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eventData.budgetRequired}
                    onChange={handleChange}
                    name="budgetRequired"
                    color="primary"
                  />
                }
                label="Budget Required"
              />
            </Grid>

            {eventData.budgetRequired && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Total Budget Amount (₹)"
                    name="budgetAmount"
                    value={eventData.budgetAmount}
                    onChange={handleChange}
                    error={!!errors.budgetAmount}
                    helperText={errors.budgetAmount}
                    variant="outlined"
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      Budget Breakdown
                    </Typography>
                    <IconButton
                      onClick={() => handleInfoClick("budgetBreakdown")}
                      size="small"
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {errors.budgetBreakdown && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.budgetBreakdown}
                    </Alert>
                  )}

                  {eventData.budgetBreakdown.map((item, index) => (
                    <Box key={index} sx={{ display: "flex", mb: 2 }}>
                      <TextField
                        label="Item Description"
                        value={item.item}
                        onChange={(e) =>
                          handleBudgetItemChange(index, "item", e.target.value)
                        }
                        variant="outlined"
                        sx={{ mr: 2, flexGrow: 1 }}
                      />
                      <TextField
                        label="Amount (₹)"
                        value={item.amount}
                        onChange={(e) =>
                          handleBudgetItemChange(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                        variant="outlined"
                        type="number"
                        inputProps={{ min: 0 }}
                        sx={{ width: "150px", mr: 1 }}
                      />
                      <IconButton
                        onClick={() => removeBudgetItem(index)}
                        disabled={eventData.budgetBreakdown.length === 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Box>
                  ))}

                  <Box sx={{ mt: 1 }}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addBudgetItem}
                      variant="outlined"
                    >
                      Add Budget Item
                    </Button>
                  </Box>
                </Grid>
              </>
            )}

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Equipment/Resources Needed
                </Typography>
                <IconButton
                  onClick={() => handleInfoClick("equipmentNeeded")}
                  size="small"
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Box>

              <FormGroup row>
                {equipmentOptions.map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={eventData.equipmentNeeded.includes(option)}
                        onChange={handleEquipmentChange}
                        value={option}
                      />
                    }
                    label={option}
                    sx={{ minWidth: "200px" }}
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: theme.palette.primary.main }}
              >
                Faculty Coordinator
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Faculty Coordinator Name"
                name="facultyCoordinator"
                value={eventData.facultyCoordinator}
                onChange={handleChange}
                error={!!errors.facultyCoordinator}
                helperText={errors.facultyCoordinator}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Faculty Email"
                name="facultyEmail"
                value={eventData.facultyEmail}
                onChange={handleChange}
                error={!!errors.facultyEmail}
                helperText={errors.facultyEmail}
                variant="outlined"
                type="email"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ mt: 2, color: theme.palette.primary.main }}
              >
                Student Coordinator
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Student Coordinator Name"
                name="studentCoordinator"
                value={eventData.studentCoordinator}
                onChange={handleChange}
                error={!!errors.studentCoordinator}
                helperText={errors.studentCoordinator}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Student Email"
                name="studentEmail"
                value={eventData.studentEmail}
                onChange={handleChange}
                error={!!errors.studentEmail}
                helperText={errors.studentEmail}
                variant="outlined"
                type="email"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Student Phone Number"
                name="studentPhone"
                value={eventData.studentPhone}
                onChange={handleChange}
                error={!!errors.studentPhone}
                helperText={errors.studentPhone}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Supporting Documents
                </Typography>
                <IconButton
                  onClick={() => handleInfoClick("supportingDocuments")}
                  size="small"
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box
                component="label"
                htmlFor="upload-files"
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 1,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: "rgba(0, 120, 212, 0.04)",
                  },
                }}
              >
                <input
                  id="upload-files"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <CloudUploadIcon
                  sx={{
                    fontSize: 40,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Drop files here or click to upload
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported file types: PDF, DOC, DOCX, JPG, PNG (Max size: 10MB
                  per file)
                </Typography>
              </Box>

              {eventData.supportingDocuments.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Uploaded Documents:
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {eventData.supportingDocuments.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1.5,
                          mb: 1,
                          bgcolor: "background.paper",
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body1" sx={{ mr: 2 }}>
                            {file.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={() => removeFile(index)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review all the details below before submitting your event
                request.
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Event Name:</Typography>
                    <Typography variant="body1">
                      {eventData.eventName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Event Type:</Typography>
                    <Typography variant="body1">
                      {eventData.eventType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Description:</Typography>
                    <Typography variant="body1" paragraph>
                      {eventData.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Venue & Schedule
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Venue:</Typography>
                    <Typography variant="body1">{eventData.venue}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Expected Attendance:
                    </Typography>
                    <Typography variant="body1">
                      {eventData.expectedAttendance}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Start Date & Time:
                    </Typography>
                    <Typography variant="body1">
                      {eventData.startDate
                        ? new Date(eventData.startDate).toLocaleString()
                        : "Not specified"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      End Date & Time:
                    </Typography>
                    <Typography variant="body1">
                      {eventData.endDate
                        ? new Date(eventData.endDate).toLocaleString()
                        : "Not specified"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Resources & Budget
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">
                      Budget Required:
                    </Typography>
                    <Typography variant="body1">
                      {eventData.budgetRequired ? "Yes" : "No"}
                    </Typography>
                  </Grid>

                  {eventData.budgetRequired && (
                    <>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">
                          Total Budget Amount:
                        </Typography>
                        <Typography variant="body1">
                          ₹{eventData.budgetAmount}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Budget Breakdown:
                        </Typography>
                        {eventData.budgetBreakdown.map((item, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="body1">{item.item}</Typography>
                            <Typography variant="body1">
                              ₹{item.amount}
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="subtitle2">Total:</Typography>
                          <Typography variant="subtitle2">
                            ₹
                            {eventData.budgetBreakdown
                              .reduce(
                                (sum, item) =>
                                  sum +
                                  (isNaN(item.amount)
                                    ? 0
                                    : parseFloat(item.amount)),
                                0
                              )
                              .toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}

                  <Grid
                    item
                    xs={12}
                    sx={{ mt: eventData.budgetRequired ? 2 : 0 }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Equipment/Resources Needed:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {eventData.equipmentNeeded.length > 0 ? (
                        eventData.equipmentNeeded.map((item) => (
                          <Chip key={item} label={item} />
                        ))
                      ) : (
                        <Typography variant="body1">None specified</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Coordinators & Contact
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Faculty Coordinator:
                    </Typography>
                    <Typography variant="body1">
                      {eventData.facultyCoordinator}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {eventData.facultyEmail}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">
                      Student Coordinator:
                    </Typography>
                    <Typography variant="body1">
                      {eventData.studentCoordinator}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {eventData.studentEmail}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {eventData.studentPhone}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Supporting Documents
                </Typography>
                <Grid container spacing={1}>
                  {eventData.supportingDocuments.length > 0 ? (
                    eventData.supportingDocuments.map((file, index) => (
                      <Grid item xs={12} key={index}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1,
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <Typography variant="body1" sx={{ flexGrow: 1 }}>
                            {file.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        No documents attached
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eventData.termsAgreed}
                    onChange={handleChange}
                    name="termsAgreed"
                    color="primary"
                  />
                }
                label="I confirm that all the information provided is accurate. I understand that providing false information may result in the rejection of this request."
              />
              {errors.termsAgreed && (
                <FormHelperText error>{errors.termsAgreed}</FormHelperText>
              )}
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <>
        <WaveBackground />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "success.main",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 2,
              }}
            >
              <CheckCircleIcon sx={{ color: "white", fontSize: 40 }} />
            </Box>
            <Typography variant="h4" gutterBottom>
              Event Request Submitted!
            </Typography>
            <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
              Your event request for <strong>{eventData.eventName}</strong> has
              been submitted successfully. You can track the status of your
              request in the Events Status section.
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/council/event-status")}
                sx={{ mr: 2 }}
              >
                View Status
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/council/permissions")}
              >
                Back to Event Permissions
              </Button>
            </Box>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <WaveBackground />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <IconButton onClick={handleCancel} sx={{ color: "#fff", mb: 2 }}>
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
            {editEventId ? "Edit Event Request" : "New Event Request"}
          </Typography>
        </Box>

        {isLoading ? (
          <Paper
            sx={{
              p: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: 2,
            }}
          >
            <CircularProgress />
          </Paper>
        ) : (
          <Paper
            sx={{
              p: 4,
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: 2,
            }}
          >
            <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 4, mb: 2 }}>{getStepContent(activeStep)}</Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Box>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                  {activeStep === steps.length - 1 ? "Submit Request" : "Next"}
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Submit Event Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit your event request for "
            {eventData.eventName}"? Once submitted, you will not be able to edit
            the request until it is reviewed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)}>
        <DialogTitle>Information</DialogTitle>
        <DialogContent>
          <DialogContentText>{getInfoText(currentInfoTopic)}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventRequestForm;
