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
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Using mock data instead of API calls as per requirement
const FacultyNoDuesApproval = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Using mock data instead of API call
  useEffect(() => {
    // Mock data for pending requests
    const mockPendingRequests = [
      {
        id: "req001",
        name: "John Doe",
        rollNumber: "19UCS001",
        branch: "Computer Science",
        email: "student@lnmiit.ac.in",
        mobileNumber: "9876543210",
        residentialContact: "1234567890",
        submissionDate: "2025-04-15",
        status: "pending",
        bankDetails: {
          accountHolderName: "John Doe",
          accountNumber: "1234567890123",
          bankName: "SBI",
          branch: "LNMIIT Campus",
          ifscCode: "SBIN0001234",
          city: "Jaipur",
          cancelledCheque: "/path/to/cheque.pdf",
        },
        cautionMoneyDonation: "1000",
        fatherName: "James Doe",
        fatherMobile: "9876543211",
        address: "123 Main Street, Jaipur, Rajasthan",
        approvals: [
          {
            role: "Department",
            status: "approved",
            email: "department@lnmiit.ac.in",
            date: "2025-04-18",
          },
          {
            role: "Faculty",
            status: "pending",
            email: "",
            date: "",
          },
        ],
      },
      {
        id: "req002",
        name: "Jane Smith",
        rollNumber: "19UEC045",
        branch: "Electronics and Communication",
        email: "student2@lnmiit.ac.in",
        mobileNumber: "9876543212",
        residentialContact: "1234567891",
        submissionDate: "2025-04-16",
        status: "pending",
        bankDetails: {
          accountHolderName: "Jane Smith",
          accountNumber: "1234567890124",
          bankName: "ICICI",
          branch: "City Branch",
          ifscCode: "ICIC0001234",
          city: "Jaipur",
          cancelledCheque: "/path/to/cheque2.pdf",
        },
        cautionMoneyDonation: "2000",
        fatherName: "John Smith",
        fatherMobile: "9876543213",
        address: "456 Park Avenue, Jaipur, Rajasthan",
        approvals: [
          {
            role: "Department",
            status: "approved",
            email: "department@lnmiit.ac.in",
            date: "2025-04-19",
          },
          {
            role: "Faculty",
            status: "pending",
            email: "",
            date: "",
          },
        ],
      },
    ];

    // Mock data for approved requests
    const mockApprovedRequests = [
      {
        id: "req003",
        name: "Robert Johnson",
        rollNumber: "18UME034",
        branch: "Mechanical Engineering",
        email: "student3@lnmiit.ac.in",
        mobileNumber: "9876543214",
        residentialContact: "1234567892",
        submissionDate: "2025-04-10",
        approvalDate: "2025-04-14",
        status: "approved",
        bankDetails: {
          accountHolderName: "Robert Johnson",
          accountNumber: "1234567890125",
          bankName: "HDFC",
          branch: "Main Branch",
          ifscCode: "HDFC0001234",
          city: "Jaipur",
          cancelledCheque: "/path/to/cheque3.pdf",
        },
        cautionMoneyDonation: "1500",
        fatherName: "Michael Johnson",
        fatherMobile: "9876543215",
        address: "789 College Road, Jaipur, Rajasthan",
        approvals: [
          {
            role: "Department",
            status: "approved",
            email: "department@lnmiit.ac.in",
            date: "2025-04-12",
          },
          {
            role: "Faculty",
            status: "approved",
            email: "faculty@lnmiit.ac.in",
            date: "2025-04-14",
            comments: "All documents verified",
          },
        ],
      },
    ];

    // Simulate loading delay
    const timeoutId = setTimeout(() => {
      setPendingRequests(mockPendingRequests);
      setApprovedRequests(mockApprovedRequests);
      setInitialLoad(false);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
    setComments(""); // Reset comments when opening details
  };

  const handleApprove = async (requestId) => {
    try {
      setLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state without making API calls
      const updatedPendingRequests = pendingRequests.filter(
        (request) => request.id !== requestId
      );

      // Get the updated request
      const approvedRequest = pendingRequests.find(
        (request) => request.id === requestId
      );

      if (approvedRequest) {
        const updatedRequest = {
          ...approvedRequest,
          status: "approved",
          approvalDate: new Date().toISOString().split("T")[0],
          approvals: [
            ...approvedRequest.approvals.map((approval) =>
              approval.role === "Faculty"
                ? {
                    ...approval,
                    status: "approved",
                    email: "faculty@lnmiit.ac.in",
                    date: new Date().toISOString().split("T")[0],
                    comments: comments,
                  }
                : approval
            ),
          ],
        };

        setApprovedRequests([updatedRequest, ...approvedRequests]);
      }

      setPendingRequests(updatedPendingRequests);

      setNotification({
        open: true,
        message: "No-dues request approved successfully!",
        severity: "success",
      });

      setDetailsOpen(false);
    } catch (error) {
      console.error("Error approving request:", error);
      setNotification({
        open: true,
        message: "Failed to approve the request. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (docPath) => {
    try {
      // This is just UI functionality, no backend call
      setNotification({
        open: true,
        message: "Document download initiated. Check your downloads folder.",
        severity: "info",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: "Failed to download document. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const renderRequestDetails = () => {
    if (!selectedRequest) return null;

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
          <Typography variant="h6">Student No-Dues Details</Typography>
          <IconButton
            onClick={() => setDetailsOpen(false)}
            sx={{ color: "white" }}
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Name:
                  </Typography>
                  <Typography>{selectedRequest.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Roll Number:
                  </Typography>
                  <Typography>{selectedRequest.rollNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Branch:
                  </Typography>
                  <Typography>{selectedRequest.branch}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Email:
                  </Typography>
                  <Typography>{selectedRequest.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Mobile Number:
                  </Typography>
                  <Typography>{selectedRequest.mobileNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Residential Contact:
                  </Typography>
                  <Typography>
                    {selectedRequest.residentialContact || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Bank Details */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Bank Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Account Holder:
                  </Typography>
                  <Typography>
                    {selectedRequest.bankDetails.accountHolderName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Account Number:
                  </Typography>
                  <Typography>
                    {selectedRequest.bankDetails.accountNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Bank Name:
                  </Typography>
                  <Typography>
                    {selectedRequest.bankDetails.bankName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Branch:
                  </Typography>
                  <Typography>{selectedRequest.bankDetails.branch}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    IFSC Code:
                  </Typography>
                  <Typography>
                    {selectedRequest.bankDetails.ifscCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    City:
                  </Typography>
                  <Typography>{selectedRequest.bankDetails.city}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Cancelled Cheque:
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    size="small"
                    onClick={() =>
                      handleDownloadDocument(
                        selectedRequest.bankDetails.cancelledCheque
                      )
                    }
                  >
                    Download Cheque
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Donation Details */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Donation Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Caution Money Donation Amount:
                  </Typography>
                  <Typography>
                    ₹{selectedRequest.cautionMoneyDonation}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Father's Information */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Father's Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Father's Name:
                  </Typography>
                  <Typography>{selectedRequest.fatherName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Father's Mobile:
                  </Typography>
                  <Typography>{selectedRequest.fatherMobile}</Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Correspondence Address
              </Typography>
              <Typography>{selectedRequest.address}</Typography>
            </Grid>

            {/* Approval Status */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Approval Status
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Department</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedRequest.approvals &&
                      selectedRequest.approvals.map((approval, index) => (
                        <TableRow key={index}>
                          <TableCell>{approval.role}</TableCell>
                          <TableCell>
                            <Chip
                              label={approval.status}
                              color={
                                approval.status === "approved"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{approval.email}</TableCell>
                          <TableCell>{approval.date || "Pending"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Comments section for approval */}
            {selectedRequest.status === "pending" && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Approval Comments
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Add your comments (optional)"
                  variant="outlined"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  disabled={loading}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {selectedRequest.status === "pending" && (
            <Button
              onClick={() => handleApprove(selectedRequest.id)}
              variant="contained"
              color="primary"
              startIcon={
                loading ? <CircularProgress size={20} /> : <CheckCircleIcon />
              }
              disabled={loading}
            >
              {loading ? "Processing..." : "Approve No-Dues"}
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)} disabled={loading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderPendingRequests = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Roll Number</TableCell>
            <TableCell>Branch</TableCell>
            <TableCell>Submission Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.name}</TableCell>
                <TableCell>{request.rollNumber}</TableCell>
                <TableCell>{request.branch}</TableCell>
                <TableCell>
                  {new Date(request.submissionDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleViewDetails(request)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                {initialLoad ? "Loading..." : "No pending requests found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderApprovedRequests = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Roll Number</TableCell>
            <TableCell>Branch</TableCell>
            <TableCell>Submission Date</TableCell>
            <TableCell>Approval Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {approvedRequests.length > 0 ? (
            approvedRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.name}</TableCell>
                <TableCell>{request.rollNumber}</TableCell>
                <TableCell>{request.branch}</TableCell>
                <TableCell>
                  {new Date(request.submissionDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {request.approvalDate
                    ? new Date(request.approvalDate).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails(request)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {initialLoad ? "Loading..." : "No approved requests found."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
            Student No-Dues Approval
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
          >
            <Tab label={`Pending Approvals (${pendingRequests.length})`} />
            <Tab label={`Approved Requests (${approvedRequests.length})`} />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {loading && initialLoad ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : activeTab === 0 ? (
              renderPendingRequests()
            ) : (
              renderApprovedRequests()
            )}
          </Box>
        </Paper>
      </Container>

      {/* Render the details dialog */}
      {renderRequestDetails()}

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

export default FacultyNoDuesApproval;
