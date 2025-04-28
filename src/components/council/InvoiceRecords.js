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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";

// Sample invoice data - Would be replaced with API calls in a real implementation
const generateMockInvoices = () => {
  const statuses = ["approved", "pending", "rejected", "paid"];
  const eventTypes = [
    "technical",
    "cultural",
    "sports",
    "workshop",
    "conference",
    "other",
  ];
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
  const purchaseCategories = [
    "equipment",
    "venue",
    "food",
    "transportation",
    "marketing",
    "decoration",
    "hospitality",
    "merchandise",
    "other",
  ];

  // Generate 20 random invoices
  return Array.from({ length: 20 }, (_, i) => {
    const invoiceDate = new Date();
    invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 90));

    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 15);

    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: `INV${(i + 1).toString().padStart(4, "0")}`,
      invoiceNumber: `VEN-${Math.floor(10000 + Math.random() * 90000)}`,
      eventName: eventNames[Math.floor(Math.random() * eventNames.length)],
      vendorName: vendors[Math.floor(Math.random() * vendors.length)],
      amount: Math.floor(5000 + Math.random() * 95000),
      invoiceDate: invoiceDate,
      paymentDueDate: dueDate,
      status: status,
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
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
      submittedBy: "Council Member",
      createdAt: new Date(
        invoiceDate.getTime() - Math.floor(Math.random() * 48) * 60 * 60 * 1000
      ),
    };
  });
};

const InvoiceRecords = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [invoiceData, setInvoiceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Load mock data on component mount
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Set mock data
        const mockData = generateMockInvoices();
        setInvoiceData(mockData);
        setFilteredData(mockData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Apply filters whenever search term or status filter changes
  useEffect(() => {
    let filtered = [...invoiceData];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
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

    setFilteredData(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, statusFilter, invoiceData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddInvoice = () => {
    navigate("/council/submit-invoices");
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
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
              Invoice Records
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleAddInvoice}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            Submit New Invoice
          </Button>
        </Box>

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
            <Grid item xs={12} md={6}>
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
                <InputLabel id="status-filter-label">
                  <FilterListIcon
                    sx={{ mr: 1, fontSize: 18, verticalAlign: "middle" }}
                  />
                  Status
                </InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ color: "#fff" }}>
                  {filteredData.length} invoice
                  {filteredData.length !== 1 ? "s" : ""} found
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
          ) : filteredData.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <ReceiptIcon
                sx={{ fontSize: 60, color: "rgba(255,255,255,0.3)", mb: 2 }}
              />
              <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
                No invoices found
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Submit your first invoice to get started"}
              </Typography>
              {!(searchTerm || statusFilter !== "all") && (
                <Button
                  variant="outlined"
                  onClick={handleAddInvoice}
                  startIcon={<AddIcon />}
                  sx={{
                    mt: 3,
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      borderColor: "#fff",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Submit New Invoice
                </Button>
              )}
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
                      <TableCell>Event Name</TableCell>
                      <TableCell>Vendor</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Invoice Date</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
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
                          <TableCell>{invoice.eventName}</TableCell>
                          <TableCell>{invoice.vendorName}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell>
                            {formatDate(invoice.invoiceDate)}
                          </TableCell>
                          <TableCell>
                            {formatDate(invoice.paymentDueDate)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                invoice.status.charAt(0).toUpperCase() +
                                invoice.status.slice(1)
                              }
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(invoice.status)
                                  .bg,
                                color: getStatusColor(invoice.status).color,
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewInvoice(invoice)}
                                sx={{ color: "rgba(255,255,255,0.7)" }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
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
                  label={
                    selectedInvoice.status.charAt(0).toUpperCase() +
                    selectedInvoice.status.slice(1)
                  }
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
                        Type:{" "}
                        {selectedInvoice.eventType.charAt(0).toUpperCase() +
                          selectedInvoice.eventType.slice(1)}
                      </Typography>
                      <Typography variant="body2">
                        Budget Code: {selectedInvoice.budgetCode}
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
                      <Typography variant="body2">
                        Invoice Number: {selectedInvoice.invoiceNumber}
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
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">Amount:</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatCurrency(selectedInvoice.amount)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">Invoice Date:</Typography>
                        <Typography variant="body2">
                          {formatDate(selectedInvoice.invoiceDate)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2">Payment Due:</Typography>
                        <Typography variant="body2">
                          {formatDate(selectedInvoice.paymentDueDate)}
                        </Typography>
                      </Box>
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
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {selectedInvoice.description ||
                          "No description provided."}
                      </Typography>

                      <Divider
                        sx={{ my: 2, backgroundColor: "rgba(255,255,255,0.1)" }}
                      />

                      <Typography
                        variant="subtitle2"
                        color="rgba(255,255,255,0.7)"
                        gutterBottom
                      >
                        Invoice Document
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        size="small"
                        sx={{
                          color: "#fff",
                          borderColor: "rgba(255,255,255,0.3)",
                          "&:hover": {
                            borderColor: "#fff",
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                        }}
                      >
                        Download Invoice
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 1,
                    }}
                  >
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">
                      Submitted by: {selectedInvoice.submittedBy}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">
                      Created:{" "}
                      {format(
                        new Date(selectedInvoice.createdAt),
                        "dd MMM yyyy, HH:mm"
                      )}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", p: 2 }}
            >
              <Button
                onClick={handleCloseDetails}
                sx={{
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default InvoiceRecords;
