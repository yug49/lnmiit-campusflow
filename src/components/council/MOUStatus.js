import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Tabs,
    Tab,
    Grid,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import api from "../../utils/apiClient";

const MOUStatus = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [mous, setMOUs] = useState([]);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [selectedMOU, setSelectedMOU] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    useEffect(() => {
        fetchMOUs();
    }, []);

    const fetchMOUs = async () => {
        try {
            setIsLoading(true);
            setError("");
            const response = await api.mou.getMySubmittedMoUs();
            setMOUs(response.data || []);
        } catch (err) {
            console.error("Error fetching MOUs:", err);
            setError(err.message || "Failed to fetch MOUs");
            setMOUs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleViewDetails = (mou) => {
        setSelectedMOU(mou);
        setDetailsOpen(true);
    };

    const handleCopyToClipboard = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(`${label} copied to clipboard!`);
            setTimeout(() => setCopySuccess(""), 3000);
        } catch (err) {
            console.error("Failed to copy:", err);
            setCopySuccess("Failed to copy");
            setTimeout(() => setCopySuccess(""), 3000);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case "approved":
            case "completed":
                return {
                    color: "success",
                    icon: <CheckCircleIcon fontSize="small" />,
                    label: "Approved",
                };
            case "rejected":
                return {
                    color: "error",
                    icon: <CancelIcon fontSize="small" />,
                    label: "Rejected",
                };
            case "pending":
            case "in_progress":
                return {
                    color: "warning",
                    icon: <PendingIcon fontSize="small" />,
                    label: status === "in_progress" ? "In Progress" : "Pending",
                };
            default:
                return {
                    color: "default",
                    icon: <PendingIcon fontSize="small" />,
                    label: status,
                };
        }
    };

    const handleEditMOU = (mouId) => {
        // In a real implementation, you would navigate to the edit form with the MOU ID
        alert(`Edit feature coming soon for MOU #${mouId}`);
        navigate(`/council/mou-addition?edit=${mouId}`);
    };

    const renderMOUDetails = () => {
        if (!selectedMOU) return null;

        const statusInfo = getStatusInfo(selectedMOU.status);

        return (
            <Dialog
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h6">MOU Details</Typography>
                    <IconButton
                        onClick={() => setDetailsOpen(false)}
                        sx={{ color: "white" }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        {/* Status Banner */}
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 1,
                                    bgcolor:
                                        selectedMOU.status === "approved"
                                            ? "rgba(46, 125, 50, 0.1)"
                                            : selectedMOU.status === "rejected"
                                            ? "rgba(211, 47, 47, 0.1)"
                                            : "rgba(255, 167, 38, 0.1)",
                                }}
                            >
                                <Box sx={{ mr: 1 }}>{statusInfo.icon}</Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color:
                                            selectedMOU.status === "approved"
                                                ? "success.main"
                                                : selectedMOU.status ===
                                                  "rejected"
                                                ? "error.main"
                                                : "warning.main",
                                    }}
                                >
                                    Status: {statusInfo.label}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Rejection Reason (if rejected) */}
                        {selectedMOU.status === "rejected" &&
                            selectedMOU.rejectionReason && (
                                <Grid item xs={12}>
                                    <Alert severity="error" sx={{ mb: 3 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            Rejection Reason:
                                        </Typography>
                                        <Typography variant="body2">
                                            {selectedMOU.rejectionReason.reason}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            display="block"
                                            sx={{ mt: 1 }}
                                        >
                                            Rejected by:{" "}
                                            {
                                                selectedMOU.rejectionReason
                                                    .rejectedBy
                                            }{" "}
                                            on{" "}
                                            {new Date(
                                                selectedMOU.rejectionReason.rejectedAt
                                            ).toLocaleString()}
                                        </Typography>
                                    </Alert>
                                </Grid>
                            )}

                        {/* Basic MOU Information */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                Basic Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        MOU Title:
                                    </Typography>
                                    <Typography>{selectedMOU.title}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Submitted By:
                                    </Typography>
                                    <Typography>
                                        {selectedMOU.submittedBy.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Submitter Email:
                                    </Typography>
                                    <Typography>
                                        {selectedMOU.submittedBy.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Submission Date:
                                    </Typography>
                                    <Typography>
                                        {new Date(
                                            selectedMOU.createdAt
                                        ).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Current Status:
                                    </Typography>
                                    <Typography
                                        sx={{ textTransform: "capitalize" }}
                                    >
                                        {selectedMOU.status.replace("_", " ")}
                                    </Typography>
                                </Grid>
                                {selectedMOU.document?.hash && (
                                    <Grid item xs={12}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            Document Hash (SHA-256):
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontFamily: "monospace",
                                                    fontSize: "0.85rem",
                                                    wordBreak: "break-all",
                                                    flex: 1,
                                                }}
                                            >
                                                {selectedMOU.document.hash}
                                            </Typography>
                                            <Tooltip title="Copy hash">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleCopyToClipboard(
                                                            selectedMOU.document
                                                                .hash,
                                                            "Document hash"
                                                        )
                                                    }
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>

                        {/* MOU Document */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                MOU Document
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        File Name:
                                    </Typography>
                                    <Typography>
                                        {selectedMOU.document?.filename ||
                                            "MOU Document"}
                                    </Typography>
                                </Grid>
                                {selectedMOU.document?.size && (
                                    <Grid item xs={12}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            File Size:
                                        </Typography>
                                        <Typography>
                                            {(
                                                selectedMOU.document.size /
                                                (1024 * 1024)
                                            ).toFixed(2)}{" "}
                                            MB
                                        </Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 2,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            startIcon={<VisibilityIcon />}
                                            size="small"
                                            onClick={() => {
                                                if (selectedMOU.document?.url) {
                                                    const fullUrl =
                                                        selectedMOU.document.url.startsWith(
                                                            "http"
                                                        )
                                                            ? selectedMOU
                                                                  .document.url
                                                            : `${
                                                                  process.env
                                                                      .REACT_APP_API_URL ||
                                                                  "http://localhost:5001"
                                                              }${
                                                                  selectedMOU
                                                                      .document
                                                                      .url
                                                              }`;
                                                    window.open(
                                                        fullUrl,
                                                        "_blank"
                                                    );
                                                }
                                            }}
                                            disabled={
                                                !selectedMOU.document?.url
                                            }
                                        >
                                            Preview Document
                                        </Button>
                                        {/* <Button
                                            variant="outlined"
                                            startIcon={<DownloadIcon />}
                                            size="small"
                                            onClick={() => {
                                                if (selectedMOU.document?.url) {
                                                    const fullUrl =
                                                        selectedMOU.document.url.startsWith(
                                                            "http"
                                                        )
                                                            ? selectedMOU
                                                                  .document.url
                                                            : `${
                                                                  process.env
                                                                      .REACT_APP_API_URL ||
                                                                  "http://localhost:5001"
                                                              }${
                                                                  selectedMOU
                                                                      .document
                                                                      .url
                                                              }`;

                                                    // Create a temporary anchor element to trigger download
                                                    const link =
                                                        document.createElement(
                                                            "a"
                                                        );
                                                    link.href = fullUrl;
                                                    link.download =
                                                        selectedMOU.document
                                                            .filename ||
                                                        "mou-document.pdf";
                                                    link.target = "_blank";
                                                    document.body.appendChild(
                                                        link
                                                    );
                                                    link.click();
                                                    document.body.removeChild(
                                                        link
                                                    );
                                                }
                                            }}
                                            disabled={
                                                !selectedMOU.document?.url
                                            }
                                        >
                                            Download
                                        </Button> */}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Recipients Flow */}
                        {selectedMOU.recipientsFlow &&
                            selectedMOU.recipientsFlow.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            borderBottom: "1px solid #eee",
                                            pb: 1,
                                            mb: 2,
                                        }}
                                    >
                                        Approval Flow
                                    </Typography>
                                    <TableContainer
                                        component={Paper}
                                        variant="outlined"
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Order</TableCell>
                                                    <TableCell>Role</TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Email</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedMOU.recipientsFlow
                                                    .sort(
                                                        (a, b) =>
                                                            a.order - b.order
                                                    )
                                                    .map((recipient, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                {
                                                                    recipient.order
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {recipient.role}
                                                            </TableCell>
                                                            <TableCell>
                                                                {recipient.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    recipient.email
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            )}

                        {/* Signature Chain */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                Signature Chain
                            </Typography>
                            {selectedMOU.signatures &&
                            selectedMOU.signatures.length > 0 ? (
                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                >
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Signer</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>
                                                    Wallet Address
                                                </TableCell>
                                                <TableCell>Signed At</TableCell>
                                                <TableCell>Signature</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedMOU.signatures.map(
                                                (sig, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {sig.signerName}
                                                        </TableCell>
                                                        <TableCell>
                                                            {sig.signerEmail}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontFamily:
                                                                            "monospace",
                                                                        fontSize:
                                                                            "0.75rem",
                                                                    }}
                                                                >
                                                                    {sig.walletAddress
                                                                        ? `${sig.walletAddress.substring(
                                                                              0,
                                                                              6
                                                                          )}...${sig.walletAddress.substring(
                                                                              sig
                                                                                  .walletAddress
                                                                                  .length -
                                                                                  4
                                                                          )}`
                                                                        : "N/A"}
                                                                </Typography>
                                                                {sig.walletAddress && (
                                                                    <Tooltip title="Copy wallet address">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleCopyToClipboard(
                                                                                    sig.walletAddress,
                                                                                    "Wallet address"
                                                                                )
                                                                            }
                                                                            sx={{
                                                                                p: 0.5,
                                                                            }}
                                                                        >
                                                                            <ContentCopyIcon
                                                                                sx={{
                                                                                    fontSize: 14,
                                                                                }}
                                                                            />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                sig.signedAt
                                                            ).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 0.5,
                                                                }}
                                                            >
                                                                <Typography
                                                                    sx={{
                                                                        fontFamily:
                                                                            "monospace",
                                                                        fontSize:
                                                                            "0.75rem",
                                                                    }}
                                                                >
                                                                    {sig.signature
                                                                        ? `${sig.signature.substring(
                                                                              0,
                                                                              10
                                                                          )}...${sig.signature.substring(
                                                                              sig
                                                                                  .signature
                                                                                  .length -
                                                                                  8
                                                                          )}`
                                                                        : "N/A"}
                                                                </Typography>
                                                                {sig.signature && (
                                                                    <Tooltip title="Copy signature">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleCopyToClipboard(
                                                                                    sig.signature,
                                                                                    "Signature"
                                                                                )
                                                                            }
                                                                            sx={{
                                                                                p: 0.5,
                                                                            }}
                                                                        >
                                                                            <ContentCopyIcon
                                                                                sx={{
                                                                                    fontSize: 14,
                                                                                }}
                                                                            />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info">
                                    No signatures yet. Awaiting approval from
                                    designated recipients.
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    {selectedMOU.status === "rejected" && (
                        <Button
                            onClick={() => handleEditMOU(selectedMOU._id)}
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                        >
                            Edit and Resubmit
                        </Button>
                    )}
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };

    const filteredMOUs = (tab) => {
        switch (tab) {
            case 0: // All MOUs
                return mous;
            case 1: // Pending MOUs
                return mous.filter(
                    (mou) =>
                        mou.status === "pending" || mou.status === "in_progress"
                );
            case 2: // Approved MOUs
                return mous.filter(
                    (mou) =>
                        mou.status === "approved" || mou.status === "completed"
                );
            case 3: // Rejected MOUs
                return mous.filter((mou) => mou.status === "rejected");
            default:
                return mous;
        }
    };

    return (
        <>
            <WaveBackground />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <IconButton
                        onClick={() => navigate("/council/dashboard")}
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
                        MOU Status Dashboard
                    </Typography>
                </Box>

                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="All MOUs" />
                        <Tab
                            label="Pending"
                            icon={<PendingIcon color="warning" />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Approved"
                            icon={<CheckCircleIcon color="success" />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Rejected"
                            icon={<CancelIcon color="error" />}
                            iconPosition="start"
                        />
                    </Tabs>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {isLoading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                p: 4,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : filteredMOUs(activeTab).length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Submitted By</TableCell>
                                        <TableCell>Submission Date</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredMOUs(activeTab).map((mou) => {
                                        const statusInfo = getStatusInfo(
                                            mou.status
                                        );
                                        const submissionDate = new Date(
                                            mou.createdAt
                                        ).toLocaleDateString();
                                        return (
                                            <TableRow key={mou._id}>
                                                <TableCell>
                                                    {mou.title}
                                                </TableCell>
                                                <TableCell>
                                                    {mou.submittedBy?.name ||
                                                        "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {submissionDate}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={statusInfo.label}
                                                        color={statusInfo.color}
                                                        size="small"
                                                        icon={statusInfo.icon}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={
                                                            <VisibilityIcon />
                                                        }
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                mou
                                                            )
                                                        }
                                                        sx={{ mr: 1 }}
                                                    >
                                                        View Details
                                                    </Button>
                                                    {mou.status ===
                                                        "rejected" && (
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={
                                                                <EditIcon />
                                                            }
                                                            onClick={() =>
                                                                handleEditMOU(
                                                                    mou._id
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <Typography variant="body1" color="text.secondary">
                                No MOUs found in this category.
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>
            {renderMOUDetails()}

            {/* Snackbar for copy success */}
            <Snackbar
                open={!!copySuccess}
                autoHideDuration={3000}
                onClose={() => setCopySuccess("")}
                message={copySuccess}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </>
    );
};

export default MOUStatus;
