import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
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
    Snackbar,
    Alert,
    Tabs,
    Tab,
    TextField,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useWallets } from "@privy-io/react-auth";
import api from "../../utils/apiClient";
import { ethers } from "ethers";

const FacultyEventApproval = () => {
    const navigate = useNavigate();
    const { wallets } = useWallets();

    const [activeTab, setActiveTab] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [rejectionDialog, setRejectionDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Data states
    const [pendingEvents, setPendingEvents] = useState([]);
    const [inProgressEvents, setInProgressEvents] = useState([]);
    const [completedEvents, setCompletedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Signing states
    const [isSigning, setIsSigning] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    useEffect(() => {
        fetchEventPermissions();
    }, []);

    const fetchEventPermissions = async () => {
        try {
            setIsLoading(true);
            setError("");

            // Fetch pending events
            const pendingResponse =
                await api.eventPermission.getPendingPermissions();
            setPendingEvents(pendingResponse.data || []);

            // Fetch in-progress events
            const inProgressResponse =
                await api.eventPermission.getAllPermissions({
                    status: "in_progress",
                });
            setInProgressEvents(inProgressResponse.data || []);

            // Fetch completed events
            const completedResponse =
                await api.eventPermission.getAllPermissions({
                    status: "completed",
                });
            setCompletedEvents(completedResponse.data || []);
        } catch (err) {
            console.error("Error fetching Event Permissions:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to fetch Event Permissions"
            );
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

    const handleApprove = async () => {
        if (!selectedEvent) return;

        // Check if user has wallet
        const embeddedWallet = wallets.find(
            (wallet) => wallet.walletClientType === "privy"
        );

        if (!embeddedWallet) {
            setError(
                "No wallet found. Please ensure your wallet is connected."
            );
            return;
        }

        try {
            setIsSigning(true);
            setError("");

            // Get document hash
            const documentHash = selectedEvent.document.hash;

            // Build the data to sign (chain of signatures)
            let dataToSign;
            if (
                selectedEvent.signatures &&
                selectedEvent.signatures.length > 0
            ) {
                // Chain: Sign the previous signature data
                const lastSignature =
                    selectedEvent.signatures[
                        selectedEvent.signatures.length - 1
                    ];
                dataToSign = JSON.stringify({
                    documentHash,
                    previousSignature: lastSignature.signature,
                    previousWallet: lastSignature.walletAddress,
                    previousSigner: lastSignature.signerEmail,
                });
            } else {
                // First signature: Sign the document hash only
                dataToSign = JSON.stringify({
                    documentHash,
                    firstSigner: true,
                });
            }

            // Sign the data with Privy wallet
            const ethereumProvider = await embeddedWallet.getEthereumProvider();
            const provider = new ethers.BrowserProvider(ethereumProvider);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();
            const signature = await signer.signMessage(dataToSign);

            // Submit signature to backend
            const response = await api.eventPermission.signPermission(
                selectedEvent._id,
                {
                    signature,
                    walletAddress,
                    documentHash,
                    signedData: dataToSign, // Include the data that was signed
                }
            );

            if (response.success) {
                setDetailsOpen(false);
                await fetchEventPermissions(); // Refresh the list
                setError("");
                setCopySuccess("Event Permission signed successfully!");
                setTimeout(() => setCopySuccess(""), 3000);
            }
        } catch (err) {
            console.error("Error signing Event Permission:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to sign Event Permission. Please try again."
            );
        } finally {
            setIsSigning(false);
        }
    };

    const handleOpenRejectionDialog = () => {
        setRejectionDialog(true);
    };

    const handleReject = async () => {
        if (!selectedEvent || !rejectionReason.trim()) return;

        try {
            setIsRejecting(true);
            setError("");

            const response = await api.eventPermission.rejectPermission(
                selectedEvent._id,
                rejectionReason
            );

            if (response.success) {
                setRejectionDialog(false);
                setDetailsOpen(false);
                setRejectionReason("");
                await fetchEventPermissions(); // Refresh the list
                setCopySuccess("Event Permission rejected successfully");
                setTimeout(() => setCopySuccess(""), 3000);
            }
        } catch (err) {
            console.error("Error rejecting Event Permission:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to reject Event Permission. Please try again."
            );
        } finally {
            setIsRejecting(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case "approved":
            case "completed":
                return {
                    color: "success",
                    icon: <CheckCircleIcon fontSize="small" />,
                    label: "Completed",
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

    const renderRejectionDialog = () => (
        <Dialog
            open={rejectionDialog}
            onClose={() => setRejectionDialog(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Reject Event Permission</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Please provide a reason for rejecting this event permission.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    label="Reason for Rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setRejectionDialog(false)}
                    disabled={isRejecting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleReject}
                    variant="contained"
                    color="error"
                    disabled={!rejectionReason.trim() || isRejecting}
                >
                    {isRejecting ? (
                        <CircularProgress size={24} />
                    ) : (
                        "Confirm Rejection"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );

    const renderEventDetails = () => {
        if (!selectedEvent) return null;

        const statusInfo = getStatusInfo(selectedEvent.status);
        const isPending =
            selectedEvent.status === "pending" ||
            selectedEvent.status === "in_progress";

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
                        Event Permission Review
                    </Typography>
                    <IconButton
                        onClick={() => setDetailsOpen(false)}
                        sx={{ color: "white" }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}

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

                        {/* Event Permission Information */}
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

                        {/* Submitter Information - Removed duplicate, already shown above */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                Submitter Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Submitted By:
                                    </Typography>
                                    <Typography>
                                        {selectedEvent.submittedBy?.name ||
                                            "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Submitter Email:
                                    </Typography>
                                    <Typography>
                                        {selectedEvent.submittedBy?.email ||
                                            "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Submission Date:
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
                        {selectedEvent.document?.hash && (
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
                                        {selectedEvent.document.hash}
                                    </Typography>
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
                                </Box>
                            </Grid>
                        )}

                        {/* Approval Flow */}
                        {selectedEvent.recipientsFlow &&
                            selectedEvent.recipientsFlow.length > 0 && (
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
                                                    <TableCell>
                                                        Status
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedEvent.recipientsFlow
                                                    .sort(
                                                        (a, b) =>
                                                            a.order - b.order
                                                    )
                                                    .map((recipient, index) => {
                                                        const hasSigned =
                                                            selectedEvent.signatures?.some(
                                                                (sig) =>
                                                                    sig.signerEmail?.toLowerCase() ===
                                                                    recipient.email?.toLowerCase()
                                                            );
                                                        const isCurrent =
                                                            recipient.order ===
                                                            selectedEvent.currentStage;

                                                        return (
                                                            <TableRow
                                                                key={index}
                                                                sx={{
                                                                    bgcolor:
                                                                        isCurrent
                                                                            ? "rgba(255, 167, 38, 0.1)"
                                                                            : "inherit",
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    {
                                                                        recipient.order
                                                                    }
                                                                    {isCurrent && (
                                                                        <Chip
                                                                            label="Current"
                                                                            size="small"
                                                                            color="warning"
                                                                            sx={{
                                                                                ml: 1,
                                                                            }}
                                                                        />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        recipient.role
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        recipient.name
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        recipient.email
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
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
                                                    })}
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
                            {selectedEvent.signatures &&
                            selectedEvent.signatures.length > 0 ? (
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
                                                <TableCell>
                                                    Signed Data
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedEvent.signatures.map(
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
                                                                        maxWidth:
                                                                            "200px",
                                                                        overflow:
                                                                            "hidden",
                                                                        textOverflow:
                                                                            "ellipsis",
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                    }}
                                                                >
                                                                    {sig.signedData ||
                                                                        "N/A"}
                                                                </Typography>
                                                                {sig.signedData && (
                                                                    <Tooltip title="Copy signed data">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleCopyToClipboard(
                                                                                    sig.signedData,
                                                                                    "Signed data"
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
                                    No signatures yet. Awaiting digital
                                    signatures from approvers.
                                </Alert>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    {isPending && (
                        <>
                            <Button
                                onClick={handleOpenRejectionDialog}
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                disabled={isSigning || isRejecting}
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={handleApprove}
                                variant="contained"
                                color="success"
                                startIcon={
                                    isSigning ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <CheckCircleIcon />
                                    )
                                }
                                disabled={isSigning || isRejecting}
                            >
                                {isSigning
                                    ? "Signing..."
                                    : "Sign & Approve Event"}
                            </Button>
                        </>
                    )}
                    <Button
                        onClick={() => setDetailsOpen(false)}
                        disabled={isSigning || isRejecting}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    const renderPendingEvents = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (pendingEvents.length === 0) {
            return (
                <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                        No pending Event Permissions require your approval at
                        this time.
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Event Name</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingEvents.map((event) => {
                            const statusInfo = getStatusInfo(event.status);
                            return (
                                <TableRow key={event._id}>
                                    <TableCell>{event.eventName}</TableCell>
                                    <TableCell>
                                        {event.submittedBy?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            event.createdAt
                                        ).toLocaleDateString()}
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
                                            variant="contained"
                                            size="small"
                                            onClick={() =>
                                                handleViewDetails(event)
                                            }
                                        >
                                            Review Event
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

    const renderInProgressEvents = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (inProgressEvents.length === 0) {
            return (
                <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                        No in-progress Event Permissions found.
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Event Name</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Current Stage</TableCell>
                            <TableCell>Signatures Collected</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inProgressEvents.map((event) => {
                            const currentRecipient =
                                event.recipientsFlow?.[event.currentStage];
                            const signaturesCount =
                                event.signatures?.length || 0;
                            const totalSigners =
                                event.recipientsFlow?.length || 0;

                            return (
                                <TableRow key={event._id}>
                                    <TableCell>{event.eventName}</TableCell>
                                    <TableCell>
                                        {event.submittedBy?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            event.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                currentRecipient?.role || "N/A"
                                            }
                                            color="warning"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {signaturesCount} / {totalSigners}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() =>
                                                handleViewDetails(event)
                                            }
                                        >
                                            View Status
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

    const renderCompletedEvents = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (completedEvents.length === 0) {
            return (
                <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                        No completed Event Permissions found.
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Event Name</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Completion Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {completedEvents.map((event) => {
                            const completionDate =
                                event.signatures && event.signatures.length > 0
                                    ? new Date(
                                          event.signatures[
                                              event.signatures.length - 1
                                          ].signedAt
                                      ).toLocaleDateString()
                                    : "N/A";
                            return (
                                <TableRow key={event._id}>
                                    <TableCell>{event.eventName}</TableCell>
                                    <TableCell>
                                        {event.submittedBy?.name || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            event.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{completionDate}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() =>
                                                handleViewDetails(event)
                                            }
                                        >
                                            View Details
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
                <Box sx={{ mb: 4, textAlign: "center" }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            color: "#fff",
                            mb: 2,
                            position: "absolute",
                            left: 24,
                            top: 24,
                        }}
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
                            textAlign: "center",
                        }}
                    >
                        Event Permission Dashboard
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
                        <Alert
                            severity="error"
                            sx={{ mb: 3 }}
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}

                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
                    >
                        <Tab label="Pending Approvals" />
                        <Tab label="In Progress" />
                        <Tab label="Completed Events" />
                    </Tabs>

                    <Box sx={{ mt: 2 }}>
                        {activeTab === 0 && renderPendingEvents()}
                        {activeTab === 1 && renderInProgressEvents()}
                        {activeTab === 2 && renderCompletedEvents()}
                    </Box>
                </Paper>
            </Container>

            {renderEventDetails()}
            {renderRejectionDialog()}

            {/* Snackbar for notifications */}
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

export default FacultyEventApproval;
