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
    TextField,
    CircularProgress,
    Alert,
    Snackbar,
    Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import CryptoJS from "crypto-js";
import api from "../../utils/apiClient";
import { ethers } from "ethers";

const AdminMOUApproval = () => {
    const navigate = useNavigate();
    const { user } = usePrivy();
    const { wallets } = useWallets();

    const [activeTab, setActiveTab] = useState(0);
    const [selectedMOU, setSelectedMOU] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [rejectionDialog, setRejectionDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Data states
    const [pendingMOUs, setPendingMOUs] = useState([]);
    const [inProgressMOUs, setInProgressMOUs] = useState([]);
    const [approvedMOUs, setApprovedMOUs] = useState([]);
    const [rejectedMOUs, setRejectedMOUs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Signing states
    const [isSigning, setIsSigning] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    useEffect(() => {
        fetchMOUs();
    }, []);

    const fetchMOUs = async () => {
        try {
            setIsLoading(true);
            setError("");

            // Fetch pending MoUs
            const pendingResponse = await api.mou.getPendingMoUs();
            setPendingMOUs(pendingResponse.data || []);

            // Fetch in-progress MoUs
            const inProgressResponse = await api.mou.getAllMoUs({
                status: "in_progress",
            });
            setInProgressMOUs(inProgressResponse.data || []);

            // Fetch completed MoUs
            const completedResponse = await api.mou.getAllMoUs({
                status: "completed",
            });
            setApprovedMOUs(completedResponse.data || []);

            // Fetch rejected MoUs
            const rejectedResponse = await api.mou.getAllMoUs({
                status: "rejected",
            });
            setRejectedMOUs(rejectedResponse.data || []);
        } catch (err) {
            console.error("Error fetching MoUs:", err);
            setError(err.response?.data?.message || "Failed to fetch MoUs");
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

    const handleApprove = async () => {
        if (!selectedMOU) return;

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
            const documentHash = selectedMOU.document.hash;

            // Build the data to sign (chain of signatures)
            let dataToSign;
            if (selectedMOU.signatures && selectedMOU.signatures.length > 0) {
                // Chain: Sign the previous signature data
                const lastSignature =
                    selectedMOU.signatures[selectedMOU.signatures.length - 1];
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
            const response = await api.mou.signMoU(selectedMOU._id, {
                signature,
                walletAddress,
                documentHash,
                signedData: dataToSign, // Include the data that was signed
            });

            if (response.success) {
                setDetailsOpen(false);
                await fetchMOUs(); // Refresh the list
                setError("");
                setCopySuccess("MoU signed successfully!");
                setTimeout(() => setCopySuccess(""), 3000);
            }
        } catch (err) {
            console.error("Error signing MoU:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to sign MoU. Please try again."
            );
        } finally {
            setIsSigning(false);
        }
    };

    const handleOpenRejectionDialog = () => {
        setRejectionDialog(true);
    };

    const handleReject = async () => {
        if (!selectedMOU || !rejectionReason.trim()) return;

        try {
            setIsRejecting(true);
            setError("");

            const response = await api.mou.rejectMoU(
                selectedMOU._id,
                rejectionReason
            );

            if (response.success) {
                setRejectionDialog(false);
                setDetailsOpen(false);
                setRejectionReason("");
                await fetchMOUs(); // Refresh the list
                setCopySuccess("MoU rejected successfully");
                setTimeout(() => setCopySuccess(""), 3000);
            }
        } catch (err) {
            console.error("Error rejecting MoU:", err);
            setError(
                err.response?.data?.message ||
                    "Failed to reject MoU. Please try again."
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

    const renderMOUDetails = () => {
        if (!selectedMOU) return null;

        const statusInfo = getStatusInfo(selectedMOU.status);
        const isPending =
            selectedMOU.status === "pending" ||
            selectedMOU.status === "in_progress";

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
                    <Typography variant="h6">MoU Review (Director)</Typography>
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
                    {selectedMOU.status === "completed" && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                MoU Completed
                            </Typography>
                            <Typography variant="body2">
                                All required signatures have been collected
                            </Typography>
                        </Alert>
                    )}

                    {selectedMOU.status === "rejected" &&
                        selectedMOU.rejectionReason && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                >
                                    MoU Rejected
                                </Typography>
                                <Typography variant="body2">
                                    Rejected by:{" "}
                                    {selectedMOU.rejectionReason.rejectedBy}
                                </Typography>
                                <Typography variant="body2">
                                    Reason: {selectedMOU.rejectionReason.reason}
                                </Typography>
                                <Typography variant="body2">
                                    Date:{" "}
                                    {new Date(
                                        selectedMOU.rejectionReason.rejectedAt
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
                                        MoU Title:
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
                                        {selectedMOU.submittedBy?.name} (
                                        {selectedMOU.submittedBy?.email})
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
                                        Status:
                                    </Typography>
                                    <Chip
                                        label={statusInfo.label}
                                        color={statusInfo.color}
                                        icon={statusInfo.icon}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Document Hash:
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
                                            {selectedMOU.document?.hash}
                                        </Typography>
                                        <Tooltip title="Copy hash">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleCopyToClipboard(
                                                        selectedMOU.document
                                                            ?.hash
                                                    )
                                                }
                                            >
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* MoU Document */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                MoU Document
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Filename:
                                    </Typography>
                                    <Typography>
                                        {selectedMOU.document?.filename}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Size:
                                    </Typography>
                                    <Typography>
                                        {(
                                            selectedMOU.document?.size / 1024
                                        ).toFixed(2)}{" "}
                                        KB
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => {
                                            const url =
                                                selectedMOU.document?.url?.startsWith(
                                                    "http"
                                                )
                                                    ? selectedMOU.document.url
                                                    : `${process.env.REACT_APP_API_URL}${selectedMOU.document?.url}`;
                                            window.open(url, "_blank");
                                        }}
                                    >
                                        Preview Document
                                    </Button>
                                </Grid>
                            </Grid>
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
                                        {selectedMOU.recipientsFlow
                                            ?.sort((a, b) => a.order - b.order)
                                            .map((recipient, index) => {
                                                const isCurrent =
                                                    index ===
                                                    selectedMOU.currentStage;
                                                const hasSigned =
                                                    selectedMOU.signatures?.some(
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
                        {selectedMOU.signatures &&
                            selectedMOU.signatures.length > 0 && (
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
                                                {selectedMOU.signatures.map(
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
                                                                                    sig.walletAddress
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
                                                                                    sig.signature
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
                                                                                        sig.signedData
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
                                    : "Sign & Approve as Director"}
                            </Button>
                        </>
                    )}
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };

    const renderRejectionDialog = () => (
        <Dialog
            open={rejectionDialog}
            onClose={() => !isRejecting && setRejectionDialog(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Reject MoU</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Please provide a reason for rejecting this MoU.
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

    const renderPendingMOUs = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!pendingMOUs || pendingMOUs.length === 0) {
            return (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="textSecondary">
                        No pending MoUs for director approval
                    </Typography>
                </Paper>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Current Stage</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingMOUs.map((mou) => (
                            <TableRow key={mou._id}>
                                <TableCell>{mou.title}</TableCell>
                                <TableCell>{mou.submittedBy?.name}</TableCell>
                                <TableCell>
                                    {new Date(mou.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {mou.recipientsFlow?.[mou.currentStage]
                                        ?.role || "N/A"}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={
                                            mou.status === "pending"
                                                ? "Pending"
                                                : "In Progress"
                                        }
                                        color="warning"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleViewDetails(mou)}
                                    >
                                        Review MoU
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderInProgressMOUs = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!inProgressMOUs || inProgressMOUs.length === 0) {
            return (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="textSecondary">
                        No in-progress MoUs
                    </Typography>
                </Paper>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Current Stage</TableCell>
                            <TableCell>Signatures Collected</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inProgressMOUs.map((mou) => {
                            const currentRecipient =
                                mou.recipientsFlow?.[mou.currentStage];
                            const signaturesCount = mou.signatures?.length || 0;
                            const totalSigners =
                                mou.recipientsFlow?.length || 0;

                            return (
                                <TableRow key={mou._id}>
                                    <TableCell>{mou.title}</TableCell>
                                    <TableCell>
                                        {mou.submittedBy?.name}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            mou.createdAt
                                        ).toLocaleString()}
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
                                            onClick={() =>
                                                handleViewDetails(mou)
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

    const renderApprovedMOUs = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!approvedMOUs || approvedMOUs.length === 0) {
            return (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="textSecondary">
                        No approved MoUs yet
                    </Typography>
                </Paper>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Completion Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {approvedMOUs.map((mou) => {
                            const lastSignature =
                                mou.signatures?.[mou.signatures.length - 1];
                            const completionDate = lastSignature?.signedAt;
                            return (
                                <TableRow key={mou._id}>
                                    <TableCell>{mou.title}</TableCell>
                                    <TableCell>
                                        {mou.submittedBy?.name}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            mou.createdAt
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {completionDate
                                            ? new Date(
                                                  completionDate
                                              ).toLocaleString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() =>
                                                handleViewDetails(mou)
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

    const renderRejectedMOUs = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!rejectedMOUs || rejectedMOUs.length === 0) {
            return (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="textSecondary">
                        No rejected MoUs
                    </Typography>
                </Paper>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Submitted By</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Rejection Date</TableCell>
                            <TableCell>Rejected By</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rejectedMOUs.map((mou) => (
                            <TableRow key={mou._id}>
                                <TableCell>{mou.title}</TableCell>
                                <TableCell>{mou.submittedBy?.name}</TableCell>
                                <TableCell>
                                    {new Date(mou.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {mou.rejectionReason?.rejectedAt
                                        ? new Date(
                                              mou.rejectionReason.rejectedAt
                                          ).toLocaleString()
                                        : "N/A"}
                                </TableCell>
                                <TableCell>
                                    {mou.rejectionReason?.rejectedBy || "N/A"}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleViewDetails(mou)}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
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
                        MOU Approval Dashboard (Director)
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
                        variant="fullWidth"
                    >
                        <Tab
                            label="Pending Approvals"
                            icon={<PendingIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            label="In Progress"
                            icon={<PendingIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Approved MOUs"
                            icon={<CheckCircleIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            label="Rejected MOUs"
                            icon={<CancelIcon />}
                            iconPosition="start"
                        />
                    </Tabs>

                    <Box sx={{ mt: 2 }}>
                        {activeTab === 0 && renderPendingMOUs()}
                        {activeTab === 1 && renderInProgressMOUs()}
                        {activeTab === 2 && renderApprovedMOUs()}
                        {activeTab === 3 && renderRejectedMOUs()}
                    </Box>
                </Paper>
            </Container>
            {renderMOUDetails()}
            {renderRejectionDialog()}
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

export default AdminMOUApproval;
