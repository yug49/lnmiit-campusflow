import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
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
    AppBar,
    Toolbar,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LogoutIcon from "@mui/icons-material/Logout";
import { useWallets } from "@privy-io/react-auth";
import api from "../../utils/apiClient";
import { ethers } from "ethers";

const AdminInvoiceApproval = () => {
    const navigate = useNavigate();
    const { wallets } = useWallets();

    const [activeTab, setActiveTab] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [rejectionDialog, setRejectionDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Data states
    const [pendingEvents, setPendingEvents] = useState([]);
    const [approvedEvents, setApprovedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Signing states
    const [isSigning, setIsSigning] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setIsLoading(true);
            setError("");

            // Fetch pending invoices
            const pendingResponse = await api.invoice.getPendingInvoices();
            setPendingEvents(pendingResponse.data || []);

            // Fetch completed invoices
            const completedResponse = await api.invoice.getAllInvoices({
                status: "completed",
            });
            setApprovedEvents(completedResponse.data || []);
        } catch (err) {
            console.error("Error fetching invoices:", err);
            setError(err.response?.data?.message || "Failed to fetch invoices");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        navigate("/");
    };

    const handleViewDetails = (event) => {
        setSelectedEvent(event);
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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
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
            const response = await api.invoice.signInvoice(selectedEvent._id, {
                signature,
                walletAddress,
                documentHash,
                signedData: dataToSign, // Include the data that was signed
            });

            if (response.success) {
                setDetailsOpen(false);
                await fetchInvoices(); // Refresh the list
                setError("");
                setCopySuccess("Event permission signed successfully!");
                setTimeout(() => setCopySuccess(""), 3000);
            }
        } catch (err) {
            console.error("Error signing invoice:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to sign invoice. Please try again."
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

            const response = await api.invoice.rejectInvoice(
                selectedEvent._id,
                rejectionReason
            );

            if (response.success) {
                setRejectionDialog(false);
                setDetailsOpen(false);
                setRejectionReason("");
                await fetchInvoices(); // Refresh the list
                setCopySuccess("Event permission rejected successfully");
                setTimeout(() => setCopySuccess(""), 3000);
            }
        } catch (err) {
            console.error("Error rejecting invoice:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to reject invoice. Please try again."
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
            onClose={() => !isRejecting && setRejectionDialog(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Reject Invoice</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Please provide a reason for rejecting this invoice.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    label="Reason for Rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    disabled={isRejecting}
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
                    startIcon={
                        isRejecting ? (
                            <CircularProgress size={20} />
                        ) : (
                            <CancelIcon />
                        )
                    }
                >
                    {isRejecting ? "Rejecting..." : "Confirm Rejection"}
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
                    <Typography variant="h6">Invoice Review (Admin)</Typography>
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

                    {/* Status Banner */}
                    {selectedEvent.status === "completed" && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Invoice Completed
                            </Typography>
                            <Typography variant="body2">
                                All required signatures have been collected
                            </Typography>
                        </Alert>
                    )}

                    {selectedEvent.status === "rejected" &&
                        selectedEvent.rejectionReason && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                >
                                    Invoice Rejected
                                </Typography>
                                <Typography variant="body2">
                                    Rejected by:{" "}
                                    {selectedEvent.rejectionReason.rejectedBy}
                                </Typography>
                                <Typography variant="body2">
                                    Reason:{" "}
                                    {selectedEvent.rejectionReason.reason}
                                </Typography>
                                <Typography variant="body2">
                                    Date:{" "}
                                    {new Date(
                                        selectedEvent.rejectionReason.rejectedAt
                                    ).toLocaleString()}
                                </Typography>
                            </Alert>
                        )}

                    <Grid container spacing={3}>
                        {/* Basic Information */}
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
                                        Invoice Title:
                                    </Typography>
                                    <Typography>
                                        {selectedEvent.title}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Event:
                                    </Typography>
                                    <Typography>
                                        {selectedEvent.eventPermissionId
                                            ?.title || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
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
                                        >
                                            View PDF Document
                                        </Button>
                                    ) : (
                                        <Typography>No document</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Submitted By:
                                    </Typography>
                                    <Typography>
                                        {selectedEvent.submittedBy?.name} (
                                        {selectedEvent.submittedBy?.email})
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
                                            selectedEvent.createdAt
                                        ).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Status:
                                    </Typography>
                                    <Chip
                                        label={statusInfo.label}
                                        color={statusInfo.color}
                                        icon={statusInfo.icon}
                                        size="small"
                                    />
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
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontFamily: "monospace",
                                        fontSize: "0.875rem",
                                        wordBreak: "break-all",
                                    }}
                                >
                                    {selectedEvent.document?.hash}
                                </Typography>
                                <Tooltip title="Copy hash">
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleCopyToClipboard(
                                                selectedEvent.document?.hash,
                                                "Document hash"
                                            )
                                        }
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
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
                            <TableContainer
                                component={Paper}
                                variant="outlined"
                            >
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Order</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedEvent.recipientsFlow
                                            ?.sort((a, b) => a.order - b.order)
                                            .map((recipient, index) => {
                                                const isCurrent =
                                                    index ===
                                                    selectedEvent.currentStage;
                                                const hasSigned =
                                                    selectedEvent.signatures?.some(
                                                        (sig) =>
                                                            sig.signerEmail ===
                                                            recipient.email
                                                    );
                                                return (
                                                    <TableRow
                                                        key={index}
                                                        sx={{
                                                            bgcolor: isCurrent
                                                                ? "action.selected"
                                                                : "inherit",
                                                        }}
                                                    >
                                                        <TableCell>
                                                            {recipient.order +
                                                                1}
                                                        </TableCell>
                                                        <TableCell>
                                                            {recipient.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {recipient.email}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={
                                                                    recipient.role
                                                                }
                                                                size="small"
                                                            />
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

                        {/* Signature Chain */}
                        {selectedEvent.signatures &&
                            selectedEvent.signatures.length > 0 && (
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
                                    <TableContainer
                                        component={Paper}
                                        variant="outlined"
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        Signer
                                                    </TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>
                                                        Wallet Address
                                                    </TableCell>
                                                    <TableCell>
                                                        Signature
                                                    </TableCell>
                                                    <TableCell>
                                                        Signed At
                                                    </TableCell>
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
                                                                {
                                                                    sig.signerEmail
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: 1,
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
                                                                        {sig.walletAddress?.substring(
                                                                            0,
                                                                            10
                                                                        )}
                                                                        ...
                                                                    </Typography>
                                                                    <Tooltip title="Copy wallet address">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleCopyToClipboard(
                                                                                    sig.walletAddress,
                                                                                    "Wallet address"
                                                                                )
                                                                            }
                                                                        >
                                                                            <ContentCopyIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: 1,
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
                                                                        {sig.signature?.substring(
                                                                            0,
                                                                            10
                                                                        )}
                                                                        ...
                                                                    </Typography>
                                                                    <Tooltip title="Copy signature">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleCopyToClipboard(
                                                                                    sig.signature,
                                                                                    "Signature"
                                                                                )
                                                                            }
                                                                        >
                                                                            <ContentCopyIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
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
                                                                        gap: 1,
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
                                                                            >
                                                                                <ContentCopyIcon fontSize="small" />
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
                                </Grid>
                            )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    {isPending && (
                        <>
                            <Button
                                onClick={() => setRejectionDialog(true)}
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                disabled={isRejecting}
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={handleApprove}
                                variant="contained"
                                color="success"
                                startIcon={
                                    isSigning ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <CheckCircleIcon />
                                    )
                                }
                                disabled={isSigning}
                            >
                                {isSigning
                                    ? "Signing..."
                                    : "Sign & Approve as Admin"}
                            </Button>
                        </>
                    )}
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };

    const renderPendingEvents = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Invoice Title</TableCell>
                        <TableCell align="center">Event</TableCell>
                        <TableCell align="center">Submitted By</TableCell>
                        <TableCell align="center">Submitted On</TableCell>
                        <TableCell align="center">Current Stage</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pendingEvents.map((event) => {
                        const currentRecipient =
                            event.recipientsFlow?.[event.currentStage];
                        return (
                            <TableRow key={event._id}>
                                <TableCell align="center">
                                    {event.title}
                                </TableCell>
                                <TableCell align="center">
                                    {event.eventPermissionId?.title || "N/A"}
                                </TableCell>
                                <TableCell align="center">
                                    {event.submittedBy?.name ||
                                        event.submittedBy?.email}
                                </TableCell>
                                <TableCell align="center">
                                    {new Date(
                                        event.createdAt
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="center">
                                    {currentRecipient ? (
                                        <Chip
                                            label={`${currentRecipient.name} (${currentRecipient.role})`}
                                            size="small"
                                            color="warning"
                                        />
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleViewDetails(event)}
                                    >
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {pendingEvents.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                No pending invoices to review
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderApprovedEvents = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Title</TableCell>
                        <TableCell align="center">Submitted By</TableCell>
                        <TableCell align="center">Submitted On</TableCell>
                        <TableCell align="center">Completed On</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {approvedEvents.map((event) => {
                        const lastSignature =
                            event.signatures?.[event.signatures.length - 1];
                        return (
                            <TableRow key={event._id}>
                                <TableCell align="center">
                                    {event.title}
                                </TableCell>
                                <TableCell align="center">
                                    {event.submittedBy?.name ||
                                        event.submittedBy?.email}
                                </TableCell>
                                <TableCell align="center">
                                    {new Date(
                                        event.createdAt
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="center">
                                    {lastSignature
                                        ? new Date(
                                              lastSignature.signedAt
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleViewDetails(event)}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {approvedEvents.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                No approved invoices found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

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
            <AppBar
                position="static"
                sx={{
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            color: "#0078D4",
                            fontWeight: 600,
                        }}
                    >
                        LNMIIT-CampusConnect
                    </Typography>
                    <IconButton
                        onClick={handleLogout}
                        sx={{
                            color: "#0078D4",
                            "&:hover": {
                                backgroundColor: "rgba(0,120,212,0.1)",
                            },
                        }}
                    >
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container
                maxWidth="lg"
                sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    py: 4,
                }}
            >
                <Box
                    sx={{
                        textAlign: "center",
                        mb: 6,
                        color: "#fff",
                        width: "100%",
                    }}
                >
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            color: "#fff",
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
                            fontWeight: 600,
                            mb: 2,
                            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            textAlign: "center",
                        }}
                    >
                        Event Approval Dashboard
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: "rgba(255,255,255,0.9)",
                            mb: 4,
                            textAlign: "center",
                        }}
                    >
                        Manage invoices after faculty approval
                    </Typography>
                </Box>

                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                        width: "100%",
                    }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
                        centered
                    >
                        <Tab label="Faculty Approved Events" />
                        <Tab label="Fully Approved Events" />
                    </Tabs>

                    <Box sx={{ mt: 2 }}>
                        {activeTab === 0
                            ? renderPendingEvents()
                            : renderApprovedEvents()}
                    </Box>
                </Paper>

                {/* Stats Cards */}
                <Grid
                    container
                    spacing={4}
                    sx={{ mt: 4, justifyContent: "center" }}
                >
                    <Grid item xs={12} sm={5} md={4}>
                        <Card
                            sx={{
                                height: "100%",
                                background: "rgba(255,255,255,0.1)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                            }}
                        >
                            <CardContent
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    p: 3,
                                    textAlign: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        color: "#fff",
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <AccessTimeIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    sx={{
                                        color: "#fff",
                                        mb: 1,
                                        textAlign: "center",
                                    }}
                                >
                                    Faculty Approved Events
                                </Typography>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: "#fff",
                                        textAlign: "center",
                                        my: 1,
                                    }}
                                >
                                    {pendingEvents.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={5} md={4}>
                        <Card
                            sx={{
                                height: "100%",
                                background: "rgba(255,255,255,0.1)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                            }}
                        >
                            <CardContent
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    p: 3,
                                    textAlign: "center",
                                }}
                            >
                                <Box
                                    sx={{
                                        color: "#fff",
                                        mb: 2,
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <DoneAllIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    sx={{
                                        color: "#fff",
                                        mb: 1,
                                        textAlign: "center",
                                    }}
                                >
                                    Fully Approved Events
                                </Typography>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: "#fff",
                                        textAlign: "center",
                                        my: 1,
                                    }}
                                >
                                    {approvedEvents.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Dialogs and Snackbar */}
            {renderEventDetails()}
            {renderRejectionDialog()}
            <Snackbar
                open={!!copySuccess}
                autoHideDuration={3000}
                onClose={() => setCopySuccess("")}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setCopySuccess("")}
                    severity={error ? "error" : "success"}
                    sx={{ width: "100%" }}
                >
                    {copySuccess || error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminInvoiceApproval;
