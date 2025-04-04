import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Mock data for demonstration - replace with actual API calls
const mockPendingRequests = [
  {
    id: 1,
    name: "John Doe",
    rollNumber: "19UCS123",
    branch: "CSE",
    submissionDate: "2024-04-04",
    status: "pending",
    email: "john.doe@lnmiit.ac.in",
    mobileNumber: "9876543210",
    bankDetails: {
      accountHolderName: "John Doe",
      accountNumber: "1234567890",
      branch: "Main Branch",
      bankName: "State Bank of India",
      city: "Jaipur",
      ifscCode: "SBIN0001234",
      cancelledCheque: "cheque1.pdf",
    },
    cautionMoneyDonation: "5000",
    residentialContact: "1234567890",
    fatherName: "James Doe",
    fatherMobile: "9876543211",
    address: "123, Street Name, City, State - 302017",
    approvals: [
      {
        role: "HOD",
        status: "pending",
        email: "hod.cse@lnmiit.ac.in",
        date: null,
      },
      {
        role: "Library",
        status: "approved",
        email: "library@lnmiit.ac.in",
        date: "2024-04-03",
      },
    ],
  },
];

const mockApprovedRequests = [
  {
    id: 3,
    name: "Alice Johnson",
    rollNumber: "19UCS125",
    branch: "CSE",
    submissionDate: "2024-03-30",
    approvalDate: "2024-04-01",
    status: "approved",
    email: "alice.johnson@lnmiit.ac.in",
    mobileNumber: "9876543212",
    bankDetails: {
      accountHolderName: "Alice Johnson",
      accountNumber: "9876543210",
      branch: "City Branch",
      bankName: "HDFC Bank",
      city: "Jaipur",
      ifscCode: "HDFC0001234",
      cancelledCheque: "cheque2.pdf",
    },
    cautionMoneyDonation: "10000",
    residentialContact: "1234567891",
    fatherName: "Robert Johnson",
    fatherMobile: "9876543213",
    address: "456, Another Street, City, State - 302018",
    approvals: [
      {
        role: "HOD",
        status: "approved",
        email: "hod.cse@lnmiit.ac.in",
        date: "2024-04-01",
      },
      {
        role: "Library",
        status: "approved",
        email: "library@lnmiit.ac.in",
        date: "2024-03-31",
      },
    ],
  },
];

const FacultyNoDuesApproval = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const handleApprove = (requestId) => {
    // Add API call to approve the request
    console.log("Approving request:", requestId);
    setDetailsOpen(false);
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
                    onClick={() => {
                      // Handle file download
                      console.log(
                        "Downloading:",
                        selectedRequest.bankDetails.cancelledCheque
                      );
                    }}
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
                    {selectedRequest.approvals.map((approval, index) => (
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
          </Grid>
        </DialogContent>
        <DialogActions>
          {selectedRequest.status === "pending" && (
            <Button
              onClick={() => handleApprove(selectedRequest.id)}
              variant="contained"
              color="primary"
              startIcon={<CheckCircleIcon />}
            >
              Approve No-Dues
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
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
          {mockPendingRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.name}</TableCell>
              <TableCell>{request.rollNumber}</TableCell>
              <TableCell>{request.branch}</TableCell>
              <TableCell>{request.submissionDate}</TableCell>
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
          ))}
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
          {mockApprovedRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.name}</TableCell>
              <TableCell>{request.rollNumber}</TableCell>
              <TableCell>{request.branch}</TableCell>
              <TableCell>{request.submissionDate}</TableCell>
              <TableCell>{request.approvalDate}</TableCell>
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
          ))}
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
            <Tab label="Pending Approvals" />
            <Tab label="Approved Requests" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0
              ? renderPendingRequests()
              : renderApprovedRequests()}
          </Box>
        </Paper>
      </Container>
      {renderRequestDetails()}
    </>
  );
};

export default FacultyNoDuesApproval;
