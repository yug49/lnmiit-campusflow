import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    InputAdornment,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Chip,
    LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import WaveBackground from "./WaveBackground";
import api from "../utils/apiClient";

const StudentNoDuesForm = () => {
    const navigate = useNavigate();
    const { wallets } = useWallets();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // State for existing no dues status
    const [existingNoDues, setExistingNoDues] = useState(null);
    const [approvalFlow, setApprovalFlow] = useState([]);
    const [canSubmit, setCanSubmit] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        // Personal info (will be prefilled)
        name: "",
        email: "",
        rollNumber: "",
        branch: "",
        semester: "",
        phone: "",

        // Bank details
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",

        // Donation
        donationAmount: 0,
        donationPurpose: "",
    });

    const [errors, setErrors] = useState({});
    const [resetting, setResetting] = useState(false);

    // Check if in development environment
    const isDevelopment = process.env.NODE_ENV === "development";

    // Fetch existing no dues status and user profile on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch user profile and no dues status in parallel
                const [profileResponse, statusResponse] = await Promise.all([
                    api.users.getProfile(),
                    api.studentNoDues.getMyStatus(),
                ]);

                // Prefill personal information
                setFormData((prev) => ({
                    ...prev,
                    name: profileResponse.data?.name || "",
                    email: profileResponse.data?.email || "",
                    rollNumber: profileResponse.data?.rollNumber || "",
                    branch: profileResponse.data?.branch || "",
                    semester: profileResponse.data?.semester || "",
                    phone: profileResponse.data?.phone || "",
                }));

                // Set existing no dues and approval flow
                setExistingNoDues(statusResponse.data?.noDues || null);

                // Get approval flow from API or localStorage
                let approvalFlowData = statusResponse.data?.approvalFlow || [];

                // If no approval flow from API, try localStorage
                if (approvalFlowData.length === 0) {
                    const savedFlow = localStorage.getItem("studentNoDuesFlow");
                    if (savedFlow) {
                        try {
                            approvalFlowData = JSON.parse(savedFlow);
                        } catch (e) {
                            console.error(
                                "Failed to parse approval flow from localStorage:",
                                e
                            );
                        }
                    }
                }

                setApprovalFlow(approvalFlowData);
                setCanSubmit(statusResponse.data?.canSubmit !== false);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setNotification({
                    open: true,
                    message:
                        "Failed to load your information. Please try again.",
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear errors
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate bank details
        if (!formData.accountHolderName)
            newErrors.accountHolderName = "Account holder name is required";
        if (!formData.accountNumber)
            newErrors.accountNumber = "Account number is required";
        if (!formData.ifscCode) newErrors.ifscCode = "IFSC code is required";
        if (!formData.bankName) newErrors.bankName = "Bank name is required";
        if (!formData.branchName)
            newErrors.branchName = "Branch name is required";

        // Validate donation amount (must be >= 0)
        if (formData.donationAmount < 0) {
            newErrors.donationAmount = "Donation amount cannot be negative";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Find the embedded wallet
        const embeddedWallet = wallets.find(
            (wallet) => wallet.walletClientType === "privy"
        );

        if (!embeddedWallet) {
            setNotification({
                open: true,
                message: "Please connect your wallet to submit.",
                severity: "error",
            });
            return;
        }

        const walletAddress = embeddedWallet.address;

        try {
            setSubmitting(true);

            // Prepare data for PDF generation
            const noDuesData = {
                studentInfo: {
                    name: formData.name,
                    email: formData.email,
                    rollNumber: formData.rollNumber,
                    branch: formData.branch,
                    semester: formData.semester,
                    phone: formData.phone,
                },
                bankDetails: {
                    accountHolderName: formData.accountHolderName,
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode,
                    bankName: formData.bankName,
                    branchName: formData.branchName,
                },
                donation: {
                    amount: parseFloat(formData.donationAmount) || 0,
                    purpose: formData.donationPurpose || "Student Welfare Fund",
                },
                approvalFlow: approvalFlow,
            };

            // Generate document hash (in production, PDF is generated on backend)
            const documentString = JSON.stringify(noDuesData);
            const documentHash = ethers.id(documentString).substring(2); // Remove '0x' prefix

            // Sign the document hash with wallet
            const ethereumProvider = await embeddedWallet.getEthereumProvider();
            const ethersSigner = await new ethers.BrowserProvider(
                ethereumProvider
            ).getSigner();
            const signature = await ethersSigner.signMessage(documentHash);

            // Submit to backend
            const submitData = {
                bankDetails: noDuesData.bankDetails,
                donation: noDuesData.donation,
                initialSignature: signature,
                walletAddress: walletAddress,
                documentHash: documentHash,
                approvalFlow: approvalFlow, // Send the approval flow from localStorage
            };

            await api.studentNoDues.submitNoDues(submitData);

            setNotification({
                open: true,
                message:
                    "No dues submitted successfully! Your request is now pending approval.",
                severity: "success",
            });

            // Refresh the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error("Error submitting no dues:", error);
            setNotification({
                open: true,
                message:
                    error.message ||
                    "An error occurred while submitting. Please try again.",
                severity: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    };

    // Debug function to reset pending no dues (development only)
    const handleResetNoDues = async () => {
        if (!existingNoDues?._id) return;

        try {
            setResetting(true);

            // Delete the no dues record via the development-only endpoint
            await api.studentNoDues.deleteMyNoDues();

            setNotification({
                open: true,
                message: "No dues reset successfully! Refreshing...",
                severity: "success",
            });

            // Refresh the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error("Error resetting no dues:", error);
            setNotification({
                open: true,
                message: error.message || "Failed to reset no dues.",
                severity: "error",
            });
            setResetting(false);
        }
    };

    // Download PDF handler
    const handleDownloadPDF = async () => {
        if (!existingNoDues?.document?.url) return;

        try {
            // Create download link
            const link = document.createElement("a");
            link.href = `${
                process.env.REACT_APP_API_URL || "http://localhost:5001"
            }${existingNoDues.document.url}`;
            link.download = `No_Dues_Certificate_${existingNoDues.studentInfo.rollNumber}.pdf`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            setNotification({
                open: true,
                message: "Failed to download PDF. Please try again.",
                severity: "error",
            });
        }
    };

    // Render progress tracker for existing no dues
    const renderProgressTracker = () => {
        if (!existingNoDues) return null;

        const getStatusColor = () => {
            switch (existingNoDues.status) {
                case "approved":
                    return "success";
                case "rejected":
                    return "error";
                case "in_progress":
                    return "info";
                default:
                    return "default";
            }
        };

        const getStatusIcon = () => {
            switch (existingNoDues.status) {
                case "approved":
                    return <CheckCircleIcon />;
                case "rejected":
                    return <CancelIcon />;
                default:
                    return <PendingIcon />;
            }
        };

        return (
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 4,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{ color: "#fff", mb: 3, fontWeight: 600 }}
                >
                    Your No Dues Status
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Chip
                        icon={getStatusIcon()}
                        label={existingNoDues.status.toUpperCase()}
                        color={getStatusColor()}
                    />
                    <Typography sx={{ color: "#fff" }}>
                        Submitted on{" "}
                        {new Date(
                            existingNoDues.createdAt
                        ).toLocaleDateString()}
                    </Typography>

                    {/* Debug button - only in development */}
                    {isDevelopment && (
                        <Button
                            variant="outlined"
                            size="small"
                            color="warning"
                            onClick={handleResetNoDues}
                            disabled={resetting}
                            sx={{
                                color: "#ff9800",
                                borderColor: "#ff9800",
                                "&:hover": {
                                    borderColor: "#f57c00",
                                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                                },
                            }}
                        >
                            {resetting ? (
                                <CircularProgress size={20} />
                            ) : (
                                "🔧 Reset (Dev)"
                            )}
                        </Button>
                    )}
                </Box>

                {existingNoDues.status === "rejected" && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Rejection Reason:</strong>{" "}
                            {existingNoDues.rejectionDetails?.reason ||
                                "Not specified"}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Rejected by:{" "}
                            {existingNoDues.rejectionDetails?.rejectedBy?.name}{" "}
                            (
                            {
                                existingNoDues.rejectionDetails?.rejectedBy
                                    ?.department
                            }
                            )
                        </Typography>
                    </Alert>
                )}

                {existingNoDues.status === "approved" && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            Your no dues certificate has been approved! All
                            signatures collected successfully.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Completed on{" "}
                            {new Date(
                                existingNoDues.completedAt
                            ).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadPDF}
                                sx={{
                                    backgroundColor: "#4caf50",
                                    "&:hover": {
                                        backgroundColor: "#45a049",
                                    },
                                }}
                            >
                                Download No Dues Certificate
                            </Button>
                        </Box>
                    </Alert>
                )}

                {/* Progress Stepper */}
                {(existingNoDues.status === "pending" ||
                    existingNoDues.status === "in_progress" ||
                    existingNoDues.status === "approved") && (
                    <>
                        <Typography
                            variant="h6"
                            sx={{ color: "#fff", mb: 2, mt: 3 }}
                        >
                            Approval Progress
                        </Typography>
                        <Stepper
                            activeStep={existingNoDues.currentStage}
                            orientation="vertical"
                            sx={{
                                "& .MuiStepLabel-label": {
                                    color: "rgba(255,255,255,0.7)",
                                },
                                "& .MuiStepLabel-label.Mui-active": {
                                    color: "#fff",
                                },
                                "& .MuiStepLabel-label.Mui-completed": {
                                    color: "#4caf50",
                                },
                            }}
                        >
                            {existingNoDues.approvalFlow?.map(
                                (approver, index) => {
                                    const signature =
                                        existingNoDues.signatures?.find(
                                            (sig) => sig.order === index + 1
                                        );
                                    const isCompleted = signature !== undefined;

                                    return (
                                        <Step
                                            key={index}
                                            completed={isCompleted}
                                        >
                                            <StepLabel>
                                                <Box>
                                                    <Typography
                                                        sx={{ color: "#fff" }}
                                                    >
                                                        {approver.department}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "rgba(255,255,255,0.6)",
                                                        }}
                                                    >
                                                        {approver.email}
                                                    </Typography>
                                                    {isCompleted && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: "#4caf50",
                                                            }}
                                                        >
                                                            Signed on{" "}
                                                            {new Date(
                                                                signature.timestamp
                                                            ).toLocaleString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </StepLabel>
                                        </Step>
                                    );
                                }
                            )}
                        </Stepper>

                        {existingNoDues.status !== "approved" && (
                            <Box sx={{ mt: 3 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={
                                        (existingNoDues.currentStage /
                                            existingNoDues.approvalFlow
                                                ?.length) *
                                        100
                                    }
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor:
                                            "rgba(255,255,255,0.1)",
                                        "& .MuiLinearProgress-bar": {
                                            backgroundColor: "#4caf50",
                                        },
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#fff",
                                        mt: 1,
                                        textAlign: "center",
                                    }}
                                >
                                    {existingNoDues.currentStage} of{" "}
                                    {existingNoDues.approvalFlow?.length}{" "}
                                    approvals completed
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Paper>
        );
    };

    // Loading state
    if (loading) {
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
                        <CircularProgress sx={{ color: "#fff" }} />
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
                            mb: 2,
                            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                    >
                        Student No Dues Certificate
                    </Typography>
                </Box>

                {/* Show progress tracker if exists */}
                {existingNoDues && renderProgressTracker()}

                {/* Show form only if can submit */}
                {!canSubmit && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        You already have a pending or approved no dues request.
                        You cannot submit a new one.
                    </Alert>
                )}

                {canSubmit && (
                    <>
                        {/* Approval Flow Info */}
                        {approvalFlow.length > 0 && (
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 3,
                                    mb: 4,
                                    background: "rgba(255,255,255,0.1)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#fff", mb: 2 }}
                                >
                                    Approval Flow
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "rgba(255,255,255,0.7)",
                                        mb: 2,
                                    }}
                                >
                                    Your no dues certificate will be reviewed by
                                    the following departments in order:
                                </Typography>
                                <Grid container spacing={1}>
                                    {approvalFlow.map((approver, index) => (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            key={index}
                                        >
                                            <Card
                                                sx={{
                                                    background:
                                                        "rgba(255,255,255,0.05)",
                                                    backdropFilter: "blur(5px)",
                                                    border: "1px solid rgba(255,255,255,0.1)",
                                                }}
                                            >
                                                <CardContent>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#fff",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {index + 1}.{" "}
                                                        {approver.department}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "rgba(255,255,255,0.6)",
                                                        }}
                                                    >
                                                        {approver.email}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        )}

                        {/* Submission Form */}
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                background: "rgba(255,255,255,0.1)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: 2,
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{ color: "#fff", mb: 3 }}
                            >
                                Submit No Dues Request
                            </Typography>

                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    {/* Personal Information (Read-only) */}
                                    <Grid item xs={12}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: "#fff",
                                                mb: 2,
                                                fontWeight: 500,
                                                borderBottom:
                                                    "1px solid rgba(255,255,255,0.1)",
                                                pb: 1,
                                            }}
                                        >
                                            Personal Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Name"
                                                    value={formData.name}
                                                    disabled
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.05)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
                                                                color: "#fff",
                                                            },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Roll Number"
                                                    value={formData.rollNumber}
                                                    disabled
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.05)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
                                                                color: "#fff",
                                                            },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    value={formData.email}
                                                    disabled
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.05)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
                                                                color: "#fff",
                                                            },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Branch"
                                                    value={formData.branch}
                                                    disabled
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.05)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
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
                                                mb: 2,
                                                fontWeight: 500,
                                                borderBottom:
                                                    "1px solid rgba(255,255,255,0.1)",
                                                pb: 1,
                                            }}
                                        >
                                            Bank Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    label="Account Holder Name"
                                                    name="accountHolderName"
                                                    value={
                                                        formData.accountHolderName
                                                    }
                                                    onChange={handleChange}
                                                    error={
                                                        !!errors.accountHolderName
                                                    }
                                                    helperText={
                                                        errors.accountHolderName
                                                    }
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.1)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
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
                                                    name="accountNumber"
                                                    value={
                                                        formData.accountNumber
                                                    }
                                                    onChange={handleChange}
                                                    error={
                                                        !!errors.accountNumber
                                                    }
                                                    helperText={
                                                        errors.accountNumber
                                                    }
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.1)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
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
                                                    name="ifscCode"
                                                    value={formData.ifscCode}
                                                    onChange={handleChange}
                                                    error={!!errors.ifscCode}
                                                    helperText={errors.ifscCode}
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.1)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
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
                                                    name="bankName"
                                                    value={formData.bankName}
                                                    onChange={handleChange}
                                                    error={!!errors.bankName}
                                                    helperText={errors.bankName}
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.1)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
                                                                color: "#fff",
                                                            },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    required
                                                    fullWidth
                                                    label="Branch Name"
                                                    name="branchName"
                                                    value={formData.branchName}
                                                    onChange={handleChange}
                                                    error={!!errors.branchName}
                                                    helperText={
                                                        errors.branchName
                                                    }
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.1)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
                                                                color: "#fff",
                                                            },
                                                    }}
                                                />
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
                                                borderBottom:
                                                    "1px solid rgba(255,255,255,0.1)",
                                                pb: 1,
                                            }}
                                        >
                                            Donation (Optional)
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Donation Amount"
                                                    name="donationAmount"
                                                    value={
                                                        formData.donationAmount
                                                    }
                                                    onChange={handleChange}
                                                    error={
                                                        !!errors.donationAmount
                                                    }
                                                    helperText={
                                                        errors.donationAmount ||
                                                        "Amount to donate from your caution money refund"
                                                    }
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                ₹
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.1)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
                                                                color: "#fff",
                                                            },
                                                        "& .MuiFormHelperText-root":
                                                            {
                                                                color: "rgba(255,255,255,0.6)",
                                                            },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Purpose (Optional)"
                                                    name="donationPurpose"
                                                    value={
                                                        formData.donationPurpose
                                                    }
                                                    onChange={handleChange}
                                                    placeholder="Student Welfare Fund"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                            {
                                                                backgroundColor:
                                                                    "rgba(255,255,255,0.1)",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        "rgba(255,255,255,0.2)",
                                                                },
                                                            },
                                                        "& .MuiInputLabel-root":
                                                            {
                                                                color: "rgba(255,255,255,0.7)",
                                                            },
                                                        "& .MuiInputBase-input":
                                                            {
                                                                color: "#fff",
                                                            },
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Submit Button */}
                                    <Grid item xs={12} sx={{ mt: 4 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            disabled={submitting}
                                            sx={{
                                                backgroundColor: "#0078D4",
                                                "&:hover": {
                                                    backgroundColor: "#006cbd",
                                                },
                                                py: 1.5,
                                            }}
                                        >
                                            {submitting ? (
                                                <CircularProgress
                                                    size={24}
                                                    color="inherit"
                                                />
                                            ) : (
                                                "Submit No Dues Request"
                                            )}
                                        </Button>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "rgba(255,255,255,0.6)",
                                                display: "block",
                                                mt: 1,
                                                textAlign: "center",
                                            }}
                                        >
                                            You will be asked to sign this
                                            request with your wallet
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </>
                )}
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
