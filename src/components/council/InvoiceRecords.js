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

const InvoiceRecords = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState("");

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setIsLoading(true);
            setError("");
            const response = await api.invoice.getMySubmittedInvoices();
            setInvoices(response.data || []);
        } catch (err) {
            console.error("Error fetching Invoices:", err);
            setError(err.message || "Failed to fetch Invoices");
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleViewDetails = async (invoice) => {
        try {
            // Fetch the latest Invoice data to ensure we have the updated document path (with QR code if completed)
            const response = await api.invoice.getInvoiceById(invoice._id);
            setSelectedInvoice(response.data);
            setDetailsOpen(true);
        } catch (err) {
            console.error("Error fetching Invoice details:", err);
            // Fallback to using the cached data if the API call fails
            setSelectedInvoice(invoice);
            setDetailsOpen(true);
        }
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

    const renderInvoiceDetails = () => {
        if (!selectedInvoice) return null;

        const statusInfo = getStatusInfo(selectedInvoice.status);

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
                    <Typography variant="h6">Invoice Details</Typography>
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
                                        selectedInvoice.status === "completed"
                                            ? "rgba(46, 125, 50, 0.1)"
                                            : selectedInvoice.status ===
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
                                            selectedInvoice.status ===
                                            "completed"
                                                ? "success.main"
                                                : selectedInvoice.status ===
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
                        {selectedInvoice.status === "rejected" &&
                            selectedInvoice.rejectionReason && (
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
                                                selectedInvoice.rejectionReason
                                                    .reason
                                            }
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Rejected by:{" "}
                                            {
                                                selectedInvoice.rejectionReason
                                                    .rejectedBy
                                            }{" "}
                                            on{" "}
                                            {new Date(
                                                selectedInvoice.rejectionReason.rejectedAt
                                            ).toLocaleString()}
                                        </Typography>
                                    </Alert>
                                </Grid>
                            )}

                        {/* Invoice Information */}
                        <Grid item xs={12}>
                            <Typography
                                variant="h6"
                                sx={{
                                    borderBottom: "1px solid #eee",
                                    pb: 1,
                                    mb: 2,
                                }}
                            >
                                Invoice Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Invoice Title:
                                    </Typography>
                                    <Typography>
                                        {selectedInvoice.title}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Event:
                                    </Typography>
                                    <Typography>
                                        {selectedInvoice.eventPermissionId
                                            ?.title || "N/A"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Document:
                                    </Typography>
                                    {selectedInvoice.document?.url ? (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => {
                                                if (
                                                    selectedInvoice.document
                                                        ?.url
                                                ) {
                                                    const fullUrl =
                                                        selectedInvoice.document.url.startsWith(
                                                            "http"
                                                        )
                                                            ? selectedInvoice
                                                                  .document.url
                                                            : `${
                                                                  process.env
                                                                      .REACT_APP_API_URL ||
                                                                  "http://localhost:5001"
                                                              }${
                                                                  selectedInvoice
                                                                      .document
                                                                      .url
                                                              }`;
                                                    window.open(
                                                        fullUrl,
                                                        "_blank"
                                                    );
                                                }
                                            }}
                                        >
                                            View PDF
                                        </Button>
                                    ) : (
                                        <Typography>No document</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight="bold"
                                    >
                                        Submitted On:
                                    </Typography>
                                    <Typography>
                                        {new Date(
                                            selectedInvoice.createdAt
                                        ).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle2"
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
                                            {selectedInvoice.document?.hash}
                                        </Typography>
                                        <Tooltip title="Copy hash">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleCopyToClipboard(
                                                        selectedInvoice.document
                                                            ?.hash,
                                                        "Document hash"
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
                                        {selectedInvoice.recipientsFlow
                                            ?.sort((a, b) => a.order - b.order)
                                            .map((recipient, index) => {
                                                const isCurrent =
                                                    index ===
                                                    selectedInvoice.currentStage;
                                                const hasSigned =
                                                    selectedInvoice.signatures?.some(
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
                        {selectedInvoice.signatures &&
                            selectedInvoice.signatures.length > 0 && (
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
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedInvoice.signatures.map(
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
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };

    const filterInvoicesByStatus = (status) => {
        return invoices.filter((invoice) => {
            if (status === "all") return true;
            if (status === "completed") {
                return (
                    invoice.status === "completed" ||
                    invoice.status === "approved"
                );
            }
            return invoice.status === status;
        });
    };

    const renderInvoicesTable = (status) => {
        const filteredInvoices = filterInvoicesByStatus(status);

        if (isLoading) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (filteredInvoices.length === 0) {
            return (
                <Box sx={{ textAlign: "center", p: 4 }}>
                    <Typography color="text.secondary">
                        No invoices found for this status
                    </Typography>
                </Box>
            );
        }

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Invoice Title</TableCell>
                            <TableCell>Event</TableCell>
                            <TableCell>Submitted On</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInvoices.map((invoice) => {
                            const statusInfo = getStatusInfo(invoice.status);
                            return (
                                <TableRow key={invoice._id}>
                                    <TableCell>{invoice.title}</TableCell>
                                    <TableCell>
                                        {invoice.eventPermissionId?.title ||
                                            "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            invoice.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={statusInfo.label}
                                            color={statusInfo.color}
                                            icon={statusInfo.icon}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleViewDetails(invoice)
                                            }
                                            color="primary"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
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
                        Invoice Records
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
                        <Tab label="All Invoices" />
                        <Tab label="In Progress" />
                        <Tab label="Completed" />
                        <Tab label="Rejected" />
                    </Tabs>

                    {activeTab === 0 && renderInvoicesTable("all")}
                    {activeTab === 1 && renderInvoicesTable("in_progress")}
                    {activeTab === 2 && renderInvoicesTable("completed")}
                    {activeTab === 3 && renderInvoicesTable("rejected")}
                </Paper>
            </Container>

            {renderInvoiceDetails()}

            <Snackbar
                open={!!copySuccess}
                autoHideDuration={3000}
                onClose={() => setCopySuccess("")}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setCopySuccess("")}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    {copySuccess}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default InvoiceRecords;
