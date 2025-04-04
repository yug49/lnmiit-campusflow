import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
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
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import DoneAllIcon from "@mui/icons-material/DoneAll";

// Mock data for demonstration
const mockPendingStudentRequests = [
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
        status: "approved",
        email: "hod.cse@lnmiit.ac.in",
        date: "2024-04-03",
      },
      {
        role: "Library",
        status: "approved",
        email: "library@lnmiit.ac.in",
        date: "2024-04-03",
      },
      {
        role: "Admin",
        status: "pending",
        email: "admin@lnmiit.ac.in",
        date: null,
      },
    ],
  },
];

const mockPendingFacultyRequests = [
  {
    id: 1,
    name: "Dr. Jane Smith",
    employeeId: "FAC123",
    department: "CSE",
    submissionDate: "2024-04-04",
    status: "pending",
    email: "jane.smith@lnmiit.ac.in",
    mobileNumber: "9876543220",
    bankDetails: {
      accountHolderName: "Jane Smith",
      accountNumber: "9876543210",
      branch: "City Branch",
      bankName: "HDFC Bank",
      city: "Jaipur",
      ifscCode: "HDFC0001234",
      cancelledCheque: "cheque3.pdf",
    },
    address: "456, Faculty Housing, LNMIIT Campus, Jaipur",
    approvals: [
      {
        role: "Director",
        status: "approved",
        email: "director@lnmiit.ac.in",
        date: "2024-04-03",
      },
      {
        role: "Admin",
        status: "pending",
        email: "admin@lnmiit.ac.in",
        date: null,
      },
    ],
  },
];

const mockApprovedStudentRequests = [
  {
    id: 2,
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
      {
        role: "Admin",
        status: "approved",
        email: "admin@lnmiit.ac.in",
        date: "2024-04-01",
      },
    ],
  },
];

const mockApprovedFacultyRequests = [
  {
    id: 2,
    name: "Dr. Robert Wilson",
    employeeId: "FAC124",
    department: "CSE",
    submissionDate: "2024-03-30",
    approvalDate: "2024-04-01",
    status: "approved",
    email: "robert.wilson@lnmiit.ac.in",
    mobileNumber: "9876543221",
    bankDetails: {
      accountHolderName: "Robert Wilson",
      accountNumber: "9876543211",
      branch: "Main Branch",
      bankName: "State Bank of India",
      city: "Jaipur",
      ifscCode: "SBIN0001235",
      cancelledCheque: "cheque4.pdf",
    },
    address: "789, Faculty Housing, LNMIIT Campus, Jaipur",
    approvals: [
      {
        role: "Director",
        status: "approved",
        email: "director@lnmiit.ac.in",
        date: "2024-03-31",
      },
      {
        role: "Admin",
        status: "approved",
        email: "admin@lnmiit.ac.in",
        date: "2024-04-01",
      },
    ],
  },
];

const AdminNoDuesApproval = () => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleViewDetails = (request, category) => {
    setSelectedRequest(request);
    setSelectedCategory(category);
    setDetailsOpen(true);
  };

  const handleApprove = (requestId) => {
    // Add API call to approve the request
    console.log("Approving request:", requestId);
    setDetailsOpen(false);
  };

  const renderRequestDetails = () => {
    if (!selectedRequest) return null;

    const isStudent = selectedCategory?.includes("student");

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
            {isStudent ? "Student" : "Faculty"} No-Dues Details
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
                    {isStudent ? "Roll Number:" : "Employee ID:"}
                  </Typography>
                  <Typography>
                    {isStudent
                      ? selectedRequest.rollNumber
                      : selectedRequest.employeeId}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {isStudent ? "Branch:" : "Department:"}
                  </Typography>
                  <Typography>
                    {isStudent
                      ? selectedRequest.branch
                      : selectedRequest.department}
                  </Typography>
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

            {/* Student-specific sections */}
            {isStudent && (
              <>
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
              </>
            )}

            {/* Address */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Address
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

  const renderCard = (title, count, icon, isPending, type) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card
        sx={{
          height: "100%",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          transition: "transform 0.2s",
          "&:hover": {
            transform: "scale(1.02)",
            cursor: "pointer",
          },
        }}
        onClick={() => {
          const requests = isPending
            ? type === "student"
              ? mockPendingStudentRequests
              : mockPendingFacultyRequests
            : type === "student"
            ? mockApprovedStudentRequests
            : mockApprovedFacultyRequests;
          if (requests.length > 0) {
            handleViewDetails(
              requests[0],
              `${type}-${isPending ? "pending" : "approved"}`
            );
          }
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              color: "#fff",
            }}
          >
            {icon}
            <Typography variant="h6" component="div" sx={{ ml: 1 }}>
              {title}
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{ color: "#fff", textAlign: "center", my: 2 }}
          >
            {count}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}
          >
            {isPending ? "Pending Approval" : "Approved"}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
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
            No-Dues Approval Dashboard
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {renderCard(
            "Students Pending",
            mockPendingStudentRequests.length,
            <PersonIcon sx={{ fontSize: 30 }} />,
            true,
            "student"
          )}
          {renderCard(
            "Faculty Pending",
            mockPendingFacultyRequests.length,
            <SchoolIcon sx={{ fontSize: 30 }} />,
            true,
            "faculty"
          )}
          {renderCard(
            "Students Approved",
            mockApprovedStudentRequests.length,
            <DoneAllIcon sx={{ fontSize: 30 }} />,
            false,
            "student"
          )}
          {renderCard(
            "Faculty Approved",
            mockApprovedFacultyRequests.length,
            <DoneAllIcon sx={{ fontSize: 30 }} />,
            false,
            "faculty"
          )}
        </Grid>
      </Container>
      {renderRequestDetails()}
    </>
  );
};

export default AdminNoDuesApproval;
