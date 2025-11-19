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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import api from "../../utils/apiClient";

const EventStatus = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [eventPermissions, setEventPermissions] = useState([]);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    useEffect(() => {
        fetchEventPermissions();
    }, []);

    const fetchEventPermissions = async () => {
        try {
            setIsLoading(true);
            setError("");
            const response =
                await api.eventPermission.getMySubmittedPermissions();
            setEventPermissions(response.data || []);
        } catch (err) {
            console.error("Error fetching Event Permissions:", err);
            setError(err.message || "Failed to fetch Event Permissions");
            setEventPermissions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleViewDetails = (eventPermission) => {
        setSelectedEvent(eventPermission);
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

    const renderEventDetails = () => {
        if (!selectedEvent) return null;

        const statusInfo = getStatusInfo(selectedEvent.status);

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
                    <Typography variant="h6">
                        Event Permission Details
                    </Typography>
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
                                    borderRadius: 1,
                                    bgcolor:
                                        selectedEvent.status === "completed"
                                            ? "rgba(46, 125, 50, 0.1)"
                                            : selectedEvent.status ===
                                              "rejected"
                                            ? "rgba(211, 47, 47, 0.1)"
                                            : "rgba(255, 167, 38, 0.1)",
                                }}
                            >
                                <Box sx={{ mr: 1 }}>{statusInfo.icon}</Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color:
                                            selectedEvent.status === "completed"
                                                ? "success.main"
                                                : selectedEvent.status ===
                                                  "rejected"
                                                ? "error.main"
                                                : "warning.main",
                                    }}
                                >
                                    Status: {statusInfo.label}
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Rejection Reason */}
                        {selectedEvent.status === "rejected" &&
                            selectedEvent.rejectionReason && (
                                <Grid item xs={12}>
                                    <Alert severity="error">
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ fontWeight: "bold" }}
                                        >
                                            Rejection Reason:
                                        </Typography>
                                        <Typography variant="body2">
                                            {
                                                selectedEvent.rejectionReason
                                                    .reason
                                            }
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Rejected by:{" "}
                                            {
                                                selectedEvent.rejectionReason
                                                    .rejectedBy
                                            }{" "}
                                            on{" "}
                                            {new Date(
                                                selectedEvent.rejectionReason.rejectedAt
                                            ).toLocaleString()}
                                        </Typography>
                                    </Alert>
                                </Grid>
                            )}

                        {/* Event Information */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                Event Permission Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Title:
                                    </Typography>
                                    <Typography>
                                        {selectedEvent.title}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Document:
                                    </Typography>
                                    {selectedEvent.document?.url ? (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            href={selectedEvent.document.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ mt: 1 }}
                                        >
                                            View PDF Document
                                        </Button>
                                    ) : (
                                        <Typography color="text.secondary">
                                            No document
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Submitted By:
                                    </Typography>
                                    <Typography>
                                        {selectedEvent.submittedBy?.name}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {selectedEvent.submittedBy?.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Submitted On:
                                    </Typography>
                                    <Typography>
                                        {selectedEvent.createdAt
                                            ? new Date(
                                                  selectedEvent.createdAt
                                              ).toLocaleString()
                                            : "N/A"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Document Hash */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                Document Hash
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    p: 2,
                                    bgcolor: "#f5f5f5",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontFamily: "monospace",
                                        fontSize: "0.875rem",
                                        wordBreak: "break-all",
                                        flexGrow: 1,
                                    }}
                                >
                                    {selectedEvent.document?.hash || "N/A"}
                                </Typography>
                                {selectedEvent.document?.hash && (
                                    <Tooltip title="Copy hash">
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleCopyToClipboard(
                                                    selectedEvent.document.hash,
                                                    "Document hash"
                                                )
                                            }
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>

                        {/* Approval Flow */}
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
                            {selectedEvent.recipientsFlow &&
                            selectedEvent.recipientsFlow.length > 0 ? (
                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                >
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">
                                                    #
                                                </TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell align="center">
                                                    Status
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedEvent.recipientsFlow.map(
                                                (recipient, index) => {
                                                    const hasSigned =
                                                        selectedEvent.signatures?.some(
                                                            (sig) =>
                                                                sig.signerEmail.toLowerCase() ===
                                                                recipient.email.toLowerCase()
                                                        );
                                                    const isCurrent =
                                                        index ===
                                                        selectedEvent.currentStage;

                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell align="center">
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    recipient.email
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {recipient.name ||
                                                                    "N/A"}
                                                            </TableCell>
                                                            <TableCell>
                                                                {recipient.role ||
                                                                    "N/A"}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {hasSigned ? (
                                                                    <Chip
                                                                        label="Signed"
                                                                        color="success"
                                                                        size="small"
                                                                        icon={
                                                                            <CheckCircleIcon />
                                                                        }
                                                                    />
                                                                ) : isCurrent ? (
                                                                    <Chip
                                                                        label="Pending"
                                                                        color="warning"
                                                                        size="small"
                                                                        icon={
                                                                            <PendingIcon />
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Chip
                                                                        label="Waiting"
                                                                        color="default"
                                                                        size="small"
                                                                    />
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info">
                                    No approval flow configured
                                </Alert>
                            )}
                        </Grid>

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
                            {selectedEvent.signatures &&
                            selectedEvent.signatures.length > 0 ? (
                                <TableContainer
                                    component={Paper}
                                    variant="outlined"
                                >
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="center">
                                                    #
                                                </TableCell>
                                                <TableCell>Signer</TableCell>
                                                <TableCell>
                                                    Wallet Address
                                                </TableCell>
                                                <TableCell>Signed At</TableCell>
                                                <TableCell>Signature</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedEvent.signatures.map(
                                                (sig, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell align="center">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {sig.signerName}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    sig.signerEmail
                                                                }
                                                            </Typography>
                                                            <br />
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {sig.signerRole}
                                                            </Typography>
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
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };

    const filteredEvents = () => {
        switch (activeTab) {
            case 0:
                return eventPermissions;
            case 1:
                return eventPermissions.filter((ep) => ep.status === "pending");
            case 2:
                return eventPermissions.filter(
                    (ep) => ep.status === "in_progress"
                );
            case 3:
                return eventPermissions.filter(
                    (ep) => ep.status === "completed"
                );
            case 4:
                return eventPermissions.filter(
                    (ep) => ep.status === "rejected"
                );
            default:
                return eventPermissions;
        }
    };

    const renderEventsTable = () => {
        const filtered = filteredEvents();

        if (filtered.length === 0) {
            return (
                <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                        No event permissions found in this category.
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submitted On</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Progress</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((eventPermission) => {
                            const statusInfo = getStatusInfo(
                                eventPermission.status
                            );
                            const progress =
                                eventPermission.signatures?.length || 0;
                            const total =
                                eventPermission.recipientsFlow?.length || 0;

                            return (
                                <TableRow key={eventPermission._id}>
                                    <TableCell>
                                        {eventPermission.title}
                                    </TableCell>
                                    <TableCell>
                                        {eventPermission.submittedBy?.name}
                                    </TableCell>
                                    <TableCell>
                                        {eventPermission.createdAt
                                            ? new Date(
                                                  eventPermission.createdAt
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={statusInfo.label}
                                            color={statusInfo.color}
                                            size="small"
                                            icon={statusInfo.icon}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">
                                            {progress} / {total}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() =>
                                                handleViewDetails(
                                                    eventPermission
                                                )
                                            }
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <>
            <WaveBackground />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <IconButton
                        onClick={() => navigate("/council/permissions")}
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
                        Event Permissions Status
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
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="All" />
                        <Tab
                            label="Pending"
                            icon={<PendingIcon color="warning" />}
                            iconPosition="start"
                        />
                        <Tab
                            label="In Progress"
                            icon={<PendingIcon color="info" />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Completed"
                            icon={<CheckCircleIcon color="success" />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Rejected"
                            icon={<CancelIcon color="error" />}
                            iconPosition="start"
                        />
                    </Tabs>

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
                    ) : (
                        renderEventsTable()
                    )}
                </Paper>
            </Container>

            {renderEventDetails()}

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

export default EventStatus;
