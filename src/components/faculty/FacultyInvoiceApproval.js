import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Divider,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Receipt as ReceiptIcon,
  CloudDownload as DownloadIcon,
  Done as DoneIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";

// Sample invoice data - Would be replaced with API calls in production
const generateMockInvoices = () => {
  const vendors = [
    "Tech Solutions Inc.",
    "Food Caterers Ltd.",
    "Event Decorations Co.",
    "Sound & Lighting Systems",
    "Transport Services",
    "Print & Design Studio",
  ];
  const eventNames = [
    "Annual Tech Fest",
    "Cultural Night",
    "Sports Tournament",
    "Workshop on AI",
    "Leadership Conference",
    "Orientation Day",
    "Alumni Meet",
  ];
  const councils = [
    "Technical Council",
    "Cultural Council",
    "Sports Council",
    "Academic Council",
    "Mess Council",
  ];
  const purchaseCategories = [
    "equipment",
    "venue",
    "food",
    "transportation",
    "marketing",
    "decoration",
    "hospitality",
    "merchandise",
  ];

  // Generate 15 pending invoices for faculty approval
  const pendingInvoices = Array.from({ length: 15 }, (_, i) => {
    const invoiceDate = new Date();
    invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 30));

    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 15);

    return {
      id: `INV${(i + 1).toString().padStart(4, "0")}`,
      invoiceNumber: `VEN-${Math.floor(10000 + Math.random() * 90000)}`,
      eventName: eventNames[Math.floor(Math.random() * eventNames.length)],
      vendorName: vendors[Math.floor(Math.random() * vendors.length)],
      amount: Math.floor(5000 + Math.random() * 95000),
      invoiceDate: invoiceDate,
      paymentDueDate: dueDate,
      status: "pending",
      councilName: councils[Math.floor(Math.random() * councils.length)],
      purchaseCategory:
        purchaseCategories[
          Math.floor(Math.random() * purchaseCategories.length)
        ],
      budgetCode: `BUD-${Math.floor(Math.random() * 999)
        .toString()
        .padStart(3, "0")}`,
      description: `Payment for ${
        purchaseCategories[
          Math.floor(Math.random() * purchaseCategories.length)
        ]
      } items for the ${
        eventNames[Math.floor(Math.random() * eventNames.length)]
      } event.`,
      submittedBy: `Student ${Math.floor(1000 + Math.random() * 9000)}`,
      submittedDate: new Date(
        invoiceDate.getTime() - Math.floor(Math.random() * 48) * 60 * 60 * 1000
      ),
    };
  });

  // Generate 12 approved/rejected invoices
  const approvedInvoices = Array.from({ length: 12 }, (_, i) => {
    const invoiceDate = new Date();
    invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 60));

    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 15);

    const isApproved = Math.random() > 0.3; // 70% chance of being approved

    return {
      id: `INV${(i + 20).toString().padStart(4, "0")}`,
      invoiceNumber: `VEN-${Math.floor(10000 + Math.random() * 90000)}`,
      eventName: eventNames[Math.floor(Math.random() * eventNames.length)],
      vendorName: vendors[Math.floor(Math.random() * vendors.length)],
      amount: Math.floor(5000 + Math.random() * 95000),
      invoiceDate: invoiceDate,
      paymentDueDate: dueDate,
      status: isApproved ? "approved" : "rejected",
      councilName: councils[Math.floor(Math.random() * councils.length)],
      purchaseCategory:
        purchaseCategories[
          Math.floor(Math.random() * purchaseCategories.length)
        ],
      budgetCode: `BUD-${Math.floor(Math.random() * 999)
        .toString()
        .padStart(3, "0")}`,
      description: `Payment for ${
        purchaseCategories[
          Math.floor(Math.random() * purchaseCategories.length)
        ]
      } items for the ${
        eventNames[Math.floor(Math.random() * eventNames.length)]
      } event.`,
      submittedBy: `Student ${Math.floor(1000 + Math.random() * 9000)}`,
      submittedDate: new Date(
        invoiceDate.getTime() - Math.floor(Math.random() * 48) * 60 * 60 * 1000
      ),
      reviewedBy: `Faculty Member`,
      reviewDate: new Date(
        invoiceDate.getTime() + Math.floor(Math.random() * 72) * 60 * 60 * 1000
      ),
      comments: isApproved
        ? Math.random() > 0.5
          ? "Approved after budget verification"
          : ""
        : "Budget constraints or duplicate invoice submission",
    };
  });

  return {
    pending: pendingInvoices,
    approved: approvedInvoices,
  };
};

const FacultyInvoiceApproval = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [approvedInvoices, setApprovedInvoices] = useState([]);
  const [filteredPendingData, setFilteredPendingData] = useState([]);
  const [filteredApprovedData, setFilteredApprovedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [councilFilter, setCouncilFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Load mock data on component mount
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Set mock data
        const mockData = generateMockInvoices();
        setPendingInvoices(mockData.pending);
        setApprovedInvoices(mockData.approved);
        setFilteredPendingData(mockData.pending);
        setFilteredApprovedData(mockData.approved);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Apply filters whenever search term or council filter changes for pending tab
  useEffect(() => {
    let filtered = [...pendingInvoices];

    // Apply council filter
    if (councilFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.councilName === councilFilter
      );
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(lowerSearchTerm) ||
          invoice.eventName.toLowerCase().includes(lowerSearchTerm) ||
          invoice.vendorName.toLowerCase().includes(lowerSearchTerm) ||
          invoice.invoiceNumber.toLowerCase().includes(lowerSearchTerm) ||
          invoice.budgetCode.toLowerCase().includes(lowerSearchTerm)
      );
    }

    setFilteredPendingData(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, councilFilter, pendingInvoices]);

  // Apply filters for approved tab
  useEffect(() => {
    let filtered = [...approvedInvoices];

    // Apply council filter
    if (councilFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.councilName === councilFilter
      );
    }

    // Apply status filter for approved tab
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.id.toLowerCase().includes(lowerSearchTerm) ||
          invoice.eventName.toLowerCase().includes(lowerSearchTerm) ||
          invoice.vendorName.toLowerCase().includes(lowerSearchTerm) ||
          invoice.invoiceNumber.toLowerCase().includes(lowerSearchTerm) ||
          invoice.budgetCode.toLowerCase().includes(lowerSearchTerm)
      );
    }

    setFilteredApprovedData(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, councilFilter, statusFilter, approvedInvoices]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCouncilFilterChange = (event) => {
    setCouncilFilter(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setActionReason("");
  };

  const handleApproveInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setConfirmAction("approve");
  };

  const handleRejectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setConfirmAction("reject");
  };

  const confirmActionHandler = () => {
    // In a real application, this would be an API call to update the invoice status
    if (confirmAction === "approve") {
      const updatedPendingInvoices = pendingInvoices.filter(
        (inv) => inv.id !== selectedInvoice.id
      );
      const updatedApprovedInvoices = [
        ...approvedInvoices,
        {
          ...selectedInvoice,
          status: "approved",
          reviewedBy: "Faculty Member",
          reviewDate: new Date(),
          comments: actionReason,
        },
      ];

      setPendingInvoices(updatedPendingInvoices);
      setApprovedInvoices(updatedApprovedInvoices);
    } else if (confirmAction === "reject") {
      const updatedPendingInvoices = pendingInvoices.filter(
        (inv) => inv.id !== selectedInvoice.id
      );
      const updatedApprovedInvoices = [
        ...approvedInvoices,
        {
          ...selectedInvoice,
          status: "rejected",
          reviewedBy: "Faculty Member",
          reviewDate: new Date(),
          comments: actionReason,
        },
      ];

      setPendingInvoices(updatedPendingInvoices);
      setApprovedInvoices(updatedApprovedInvoices);
    }

    setConfirmAction(null);
    setDetailsOpen(false);
    setActionReason("");
  };

  const cancelActionHandler = () => {
    setConfirmAction(null);
    setActionReason("");
  };

  // Format date function
  const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd MMM yyyy");
  };

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status chip colors
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return { bg: "rgba(46, 125, 50, 0.1)", color: "#2e7d32" };
      case "pending":
        return { bg: "rgba(237, 108, 2, 0.1)", color: "#ed6c02" };
      case "rejected":
        return { bg: "rgba(211, 47, 47, 0.1)", color: "#d32f2f" };
      case "paid":
        return { bg: "rgba(25, 118, 210, 0.1)", color: "#1976d2" };
      default:
        return { bg: "rgba(0, 0, 0, 0.1)", color: "#757575" };
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "paid":
        return "Paid";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Determine which data set to use based on active tab
  const currentData =
    activeTab === 0 ? filteredPendingData : filteredApprovedData;

  return (
    <>
      <WaveBackground />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
              Invoice Approval
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper
          sx={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
            mb: 3,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTabs-indicator": { backgroundColor: "#fff" },
            }}
          >
            <Tab
              label="Pending Approval"
              icon={<ApproveIcon />}
              iconPosition="start"
              sx={{
                color: "#fff",
                "&.Mui-selected": { color: "#fff" },
                textTransform: "none",
              }}
            />
            <Tab
              label="Processed Invoices"
              icon={<DoneIcon />}
              iconPosition="start"
              sx={{
                color: "#fff",
                "&.Mui-selected": { color: "#fff" },
                textTransform: "none",
              }}
            />
          </Tabs>
        </Paper>

        {/* Filters and search */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 2,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#fff",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.2)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255,255,255,0.7)",
                  },
                  "& .MuiSelect-icon": {
                    color: "rgba(255,255,255,0.7)",
                  },
                  "& .MuiSelect-select": {
                    color: "#fff",
                  },
                }}
              >
                <InputLabel id="council-filter-label">Council</InputLabel>
                <Select
                  labelId="council-filter-label"
                  value={councilFilter}
                  label="Council"
                  onChange={handleCouncilFilterChange}
                >
                  <MenuItem value="all">All Councils</MenuItem>
                  <MenuItem value="Technical Council">
                    Technical Council
                  </MenuItem>
                  <MenuItem value="Cultural Council">Cultural Council</MenuItem>
                  <MenuItem value="Sports Council">Sports Council</MenuItem>
                  <MenuItem value="Academic Council">Academic Council</MenuItem>
                  <MenuItem value="Mess Council">Mess Council</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {activeTab === 1 && (
              <Grid item xs={12} md={3}>
                <FormControl
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      backdropFilter: "blur(10px)",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255,255,255,0.7)",
                    },
                    "& .MuiSelect-icon": {
                      color: "rgba(255,255,255,0.7)",
                    },
                    "& .MuiSelect-select": {
                      color: "#fff",
                    },
                  }}
                >
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} md={activeTab === 0 ? 5 : 2}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {currentData.length} invoice
                  {currentData.length !== 1 ? "s" : ""}{" "}
                  {activeTab === 0 ? "pending review" : "processed"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Invoice table */}
        <Paper
          elevation={3}
          sx={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 8,
              }}
            >
              <CircularProgress sx={{ color: "#fff" }} />
            </Box>
          ) : currentData.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <ReceiptIcon
                sx={{ fontSize: 60, color: "rgba(255,255,255,0.3)", mb: 2 }}
              />
              <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
                {activeTab === 0
                  ? "No pending invoices found"
                  : "No processed invoices found"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {searchTerm ||
                councilFilter !== "all" ||
                (activeTab === 1 && statusFilter !== "all")
                  ? "Try adjusting your filters"
                  : activeTab === 0
                  ? "All invoices have been reviewed"
                  : "No invoices have been processed yet"}
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table
                  sx={{
                    "& .MuiTableCell-root": {
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Council</TableCell>
                      <TableCell>Event Name</TableCell>
                      <TableCell>Vendor</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      {activeTab === 1 && <TableCell>Status</TableCell>}
                      {activeTab === 1 && <TableCell>Review Date</TableCell>}
                      <TableCell>Due Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((invoice) => (
                        <TableRow
                          key={invoice.id}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,0.05)",
                            },
                          }}
                        >
                          <TableCell>{invoice.id}</TableCell>
                          <TableCell>{invoice.councilName}</TableCell>
                          <TableCell>{invoice.eventName}</TableCell>
                          <TableCell>{invoice.vendorName}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          {activeTab === 1 && (
                            <TableCell>
                              <Chip
                                label={getStatusLabel(invoice.status)}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(
                                    invoice.status
                                  ).bg,
                                  color: getStatusColor(invoice.status).color,
                                  fontWeight: 500,
                                }}
                              />
                            </TableCell>
                          )}
                          {activeTab === 1 && (
                            <TableCell>
                              {formatDate(invoice.reviewDate)}
                            </TableCell>
                          )}
                          <TableCell>
                            {formatDate(invoice.paymentDueDate)}
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{ display: "flex", justifyContent: "center" }}
                            >
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewInvoice(invoice)}
                                  sx={{
                                    color: "rgba(255,255,255,0.7)",
                                    mx: 0.5,
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {activeTab === 0 && (
                                <>
                                  <Tooltip title="Approve Invoice">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleApproveInvoice(invoice)
                                      }
                                      sx={{ color: "#2e7d32", mx: 0.5 }}
                                    >
                                      <ApproveIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject Invoice">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleRejectInvoice(invoice)
                                      }
                                      sx={{ color: "#d32f2f", mx: 0.5 }}
                                    >
                                      <RejectIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={currentData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  color: "#fff",
                  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.7)" },
                }}
              />
            </>
          )}
        </Paper>
      </Container>

      {/* Invoice Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(50,50,50,0.95)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            borderRadius: 2,
          },
        }}
      >
        {selectedInvoice && (
          <>
            <DialogTitle
              sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">
                  Invoice Details - {selectedInvoice.id}
                </Typography>
                <Chip
                  label={getStatusLabel(selectedInvoice.status)}
                  size="small"
                  sx={{
                    backgroundColor: getStatusColor(selectedInvoice.status).bg,
                    color: getStatusColor(selectedInvoice.status).color,
                    fontWeight: 500,
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      height: "100%",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="rgba(255,255,255,0.7)"
                        gutterBottom
                      >
                        Event Information
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {selectedInvoice.eventName}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Council: {selectedInvoice.councilName}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Budget Code: {selectedInvoice.budgetCode}
                      </Typography>
                      <Typography variant="body2">
                        Submitted By: {selectedInvoice.submittedBy}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      height: "100%",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="rgba(255,255,255,0.7)"
                        gutterBottom
                      >
                        Vendor Information
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {selectedInvoice.vendorName}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Invoice Number: {selectedInvoice.invoiceNumber}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Category:{" "}
                        {selectedInvoice.purchaseCategory
                          .charAt(0)
                          .toUpperCase() +
                          selectedInvoice.purchaseCategory.slice(1)}
                      </Typography>
                      <Typography variant="body2">
                        Amount: {formatCurrency(selectedInvoice.amount)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        color="rgba(255,255,255,0.7)"
                        gutterBottom
                      >
                        Payment Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            <strong>Invoice Date:</strong>{" "}
                            {formatDate(selectedInvoice.invoiceDate)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            <strong>Due Date:</strong>{" "}
                            {formatDate(selectedInvoice.paymentDueDate)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2">
                            <strong>Submission Date:</strong>{" "}
                            {formatDate(selectedInvoice.submittedDate)}
                          </Typography>
                        </Grid>
                      </Grid>

                      {selectedInvoice.reviewDate && (
                        <>
                          <Divider
                            sx={{
                              my: 2,
                              borderColor: "rgba(255,255,255,0.1)",
                            }}
                          />
                          <Typography
                            variant="subtitle2"
                            color="rgba(255,255,255,0.7)"
                            gutterBottom
                          >
                            Review Details
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2">
                                <strong>Reviewed By:</strong>{" "}
                                {selectedInvoice.reviewedBy}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2">
                                <strong>Review Date:</strong>{" "}
                                {formatDate(selectedInvoice.reviewDate)}
                              </Typography>
                            </Grid>
                            {selectedInvoice.comments && (
                              <Grid item xs={12}>
                                <Typography variant="body2">
                                  <strong>Comments:</strong>{" "}
                                  {selectedInvoice.comments}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </>
                      )}

                      <Divider
                        sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }}
                      />

                      <Typography
                        variant="subtitle2"
                        color="rgba(255,255,255,0.7)"
                        gutterBottom
                      >
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {selectedInvoice.description}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Button
                          startIcon={<DownloadIcon />}
                          sx={{
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.3)",
                            "&:hover": { borderColor: "#fff" },
                          }}
                          variant="outlined"
                          size="small"
                        >
                          Download Invoice PDF
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {activeTab === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <Button
                        startIcon={<ApproveIcon />}
                        variant="contained"
                        color="success"
                        onClick={() => handleApproveInvoice(selectedInvoice)}
                      >
                        Approve Invoice
                      </Button>
                      <Button
                        startIcon={<RejectIcon />}
                        variant="contained"
                        color="error"
                        onClick={() => handleRejectInvoice(selectedInvoice)}
                      >
                        Reject Invoice
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", p: 2 }}
            >
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmAction !== null}
        onClose={cancelActionHandler}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(50,50,50,0.95)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          {confirmAction === "approve" ? "Approve Invoice" : "Reject Invoice"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {confirmAction === "approve"
              ? "Are you sure you want to approve this invoice? This will allow the invoice to proceed to the next approval stage."
              : "Are you sure you want to reject this invoice? Please provide a reason for rejection."}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Comments (Optional for approval, required for rejection)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            required={confirmAction === "reject"}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                borderColor: "rgba(255,255,255,0.3)",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,0.7)",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={cancelActionHandler}>Cancel</Button>
          <Button
            onClick={confirmActionHandler}
            color={confirmAction === "approve" ? "success" : "error"}
            variant="contained"
            disabled={confirmAction === "reject" && !actionReason.trim()}
          >
            {confirmAction === "approve"
              ? "Confirm Approval"
              : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FacultyInvoiceApproval;
