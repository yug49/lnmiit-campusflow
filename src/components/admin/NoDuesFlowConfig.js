import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    IconButton,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Divider,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import api from "../../utils/apiClient";

const NoDuesFlowConfig = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Student No Dues Flow
    const [studentFlow, setStudentFlow] = useState([]);
    const [newStudentEmail, setNewStudentEmail] = useState("");
    const [newStudentDepartment, setNewStudentDepartment] = useState("");

    // Faculty No Dues Flow
    const [facultyFlow, setFacultyFlow] = useState([]);
    const [newFacultyEmail, setNewFacultyEmail] = useState("");
    const [newFacultyDepartment, setNewFacultyDepartment] = useState("");

    useEffect(() => {
        fetchFlowConfigs();
    }, []);

    const fetchFlowConfigs = async () => {
        try {
            setLoading(true);
            setError("");

            // TODO: Replace with actual API call when backend is ready
            // const response = await api.noDues.getFlowConfigs();
            // setStudentFlow(response.data.studentFlow || []);
            // setFacultyFlow(response.data.facultyFlow || []);

            // For now, set empty arrays or load from localStorage
            const savedStudentFlow = localStorage.getItem("studentNoDuesFlow");
            const savedFacultyFlow = localStorage.getItem("facultyNoDuesFlow");

            console.log("Loading from localStorage:");
            console.log("Student flow:", savedStudentFlow);
            console.log("Faculty flow:", savedFacultyFlow);

            const parsedStudentFlow = savedStudentFlow
                ? JSON.parse(savedStudentFlow)
                : [];
            const parsedFacultyFlow = savedFacultyFlow
                ? JSON.parse(savedFacultyFlow)
                : [];

            console.log("Parsed student flow:", parsedStudentFlow);
            console.log("Parsed faculty flow:", parsedFacultyFlow);

            setStudentFlow(parsedStudentFlow);
            setFacultyFlow(parsedFacultyFlow);
        } catch (err) {
            console.error("Error fetching flow configs:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to fetch flow configurations"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const addToFlow = (flowType) => {
        const email =
            flowType === "student" ? newStudentEmail : newFacultyEmail;
        const department =
            flowType === "student"
                ? newStudentDepartment
                : newFacultyDepartment;
        const currentFlow = flowType === "student" ? studentFlow : facultyFlow;
        const setFlow =
            flowType === "student" ? setStudentFlow : setFacultyFlow;
        const setEmail =
            flowType === "student" ? setNewStudentEmail : setNewFacultyEmail;
        const setDepartment =
            flowType === "student"
                ? setNewStudentDepartment
                : setNewFacultyDepartment;

        if (!email.trim()) {
            setError("Please enter an email address");
            return;
        }

        if (!department.trim()) {
            setError("Please enter a department name");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Check for duplicates
        if (currentFlow.find((item) => item.email === email.toLowerCase())) {
            setError("This email is already in the approval flow");
            return;
        }

        setFlow([
            ...currentFlow,
            {
                email: email.toLowerCase(),
                department: department.trim(),
                order: currentFlow.length,
            },
        ]);

        setEmail("");
        setDepartment("");
        setError("");
    };

    const removeFromFlow = (flowType, index) => {
        const currentFlow = flowType === "student" ? studentFlow : facultyFlow;
        const setFlow =
            flowType === "student" ? setStudentFlow : setFacultyFlow;

        const updatedFlow = currentFlow
            .filter((_, i) => i !== index)
            .map((item, i) => ({ ...item, order: i }));

        setFlow(updatedFlow);
    };

    const moveInFlow = (flowType, index, direction) => {
        const currentFlow = flowType === "student" ? studentFlow : facultyFlow;
        const setFlow =
            flowType === "student" ? setStudentFlow : setFacultyFlow;

        const newFlow = [...currentFlow];
        const newIndex = direction === "up" ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newFlow.length) return;

        [newFlow[index], newFlow[newIndex]] = [
            newFlow[newIndex],
            newFlow[index],
        ];

        // Update order
        newFlow.forEach((item, i) => (item.order = i));

        setFlow(newFlow);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (studentFlow.length === 0 && facultyFlow.length === 0) {
                setError("Please configure at least one approval flow");
                setSaving(false);
                return;
            }

            console.log("Saving to localStorage:");
            console.log("Student flow:", studentFlow);
            console.log("Faculty flow:", facultyFlow);

            // TODO: Replace with actual API call when backend is ready
            // await api.noDues.updateFlowConfigs({
            //     studentFlow,
            //     facultyFlow,
            // });

            // For now, save to localStorage
            localStorage.setItem(
                "studentNoDuesFlow",
                JSON.stringify(studentFlow)
            );
            localStorage.setItem(
                "facultyNoDuesFlow",
                JSON.stringify(facultyFlow)
            );

            // Verify save
            const saved = localStorage.getItem("studentNoDuesFlow");
            console.log("Verified saved student flow:", saved);

            setSuccess("Flow configurations saved successfully!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Error saving flow configs:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to save flow configurations"
            );
        } finally {
            setSaving(false);
        }
    };

    const renderFlowEditor = (flowType) => {
        const flow = flowType === "student" ? studentFlow : facultyFlow;
        const email =
            flowType === "student" ? newStudentEmail : newFacultyEmail;
        const setEmail =
            flowType === "student" ? setNewStudentEmail : setNewFacultyEmail;
        const department =
            flowType === "student"
                ? newStudentDepartment
                : newFacultyDepartment;
        const setDepartment =
            flowType === "student"
                ? setNewStudentDepartment
                : setNewFacultyDepartment;
        const title =
            flowType === "student" ? "Student No Dues" : "Faculty No Dues";

        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    {title} Approval Flow
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Define the approval flow for {title.toLowerCase()} requests.
                    Approvers will receive requests in the order specified
                    below.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Approver Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="approver@lnmiit.ac.in"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g., Library, Hostel, Accounts"
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => addToFlow(flowType)}
                            startIcon={<AddIcon />}
                            sx={{ height: "40px" }}
                        >
                            Add
                        </Button>
                    </Grid>
                </Grid>

                {flow.length === 0 ? (
                    <Alert severity="info">
                        No approvers configured. Add email addresses with
                        departments to create the approval flow.
                    </Alert>
                ) : (
                    <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
                        {flow.map((item, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    border: "1px solid #e0e0e0",
                                    mb: 1,
                                    borderRadius: 1,
                                }}
                            >
                                <Chip
                                    label={index + 1}
                                    size="small"
                                    color="primary"
                                    sx={{ mr: 2 }}
                                />
                                <ListItemText
                                    primary={
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography variant="body1">
                                                {item.email}
                                            </Typography>
                                            <Chip
                                                label={item.department}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                            />
                                        </Box>
                                    }
                                    secondary={`Step ${index + 1} of ${
                                        flow.length
                                    }`}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() =>
                                            moveInFlow(flowType, index, "up")
                                        }
                                        disabled={index === 0}
                                        size="small"
                                    >
                                        <ArrowUpIcon />
                                    </IconButton>
                                    <IconButton
                                        edge="end"
                                        onClick={() =>
                                            moveInFlow(flowType, index, "down")
                                        }
                                        disabled={index === flow.length - 1}
                                        size="small"
                                    >
                                        <ArrowDownIcon />
                                    </IconButton>
                                    <IconButton
                                        edge="end"
                                        onClick={() =>
                                            removeFromFlow(flowType, index)
                                        }
                                        size="small"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" color="text.secondary">
                    <strong>Note:</strong> When a {title.toLowerCase()} request
                    is submitted, it will go through each approver in sequence.
                    Each approver must approve before the request moves to the
                    next step. The department name will be displayed on the no
                    dues certificate.
                </Typography>
            </Box>
        );
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

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
            <Container
                maxWidth="lg"
                sx={{
                    position: "relative",
                    zIndex: 1,
                    flex: 1,
                    py: 4,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 4,
                    }}
                >
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
                        No Dues Flow Configuration
                    </Typography>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        onClose={() => setError("")}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
                    >
                        <Tab label="Student No Dues Flow" />
                        <Tab label="Faculty No Dues Flow" />
                    </Tabs>

                    {activeTab === 0 && renderFlowEditor("student")}
                    {activeTab === 1 && renderFlowEditor("faculty")}

                    <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
                            startIcon={
                                saving ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <SaveIcon />
                                )
                            }
                            fullWidth
                        >
                            {saving ? "Saving..." : "Save Configuration"}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default NoDuesFlowConfig;
