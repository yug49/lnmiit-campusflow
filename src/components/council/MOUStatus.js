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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";

// Mock data for demonstration - replace with actual API calls in production
const mockMOUs = [
  {
    id: 1,
    title: "Technical Workshop Collaboration",
    partnerName: "TechNova Solutions",
    partnerType: "industry",
    submissionDate: "2025-04-04",
    startDate: "2025-05-15",
    endDate: "2026-05-14",
    status: "pending",
    purpose:
      "To establish a series of technical workshops for LNMIIT students in emerging technologies",
    scope:
      "Monthly technical workshops, internship opportunities, and access to industry tools and software.",
    financialTerms:
      "₹50,000 per semester to be paid by the partner for faculty involvement and infrastructure usage",
    contactPersonName: "Rajesh Kumar",
    contactPersonEmail: "rajesh.kumar@technova.com",
    contactPersonPhone: "9876543210",
    mouDocument: "technova_mou_draft.pdf",
    supportingDocuments: ["workshop_schedule.pdf", "resource_requirements.pdf"],
    approvals: [
      {
        role: "Faculty Mentor",
        status: "pending",
        email: "faculty.mentor@lnmiit.ac.in",
        date: null,
        comments: null,
      },
      {
        role: "Director",
        status: "pending",
        email: "director@lnmiit.ac.in",
        date: null,
        comments: null,
      },
    ],
  },
  {
    id: 2,
    title: "Research Collaboration on AI Ethics",
    partnerName: "National Institute of Ethics in AI",
    partnerType: "academic",
    submissionDate: "2025-04-02",
    startDate: "2025-06-01",
    endDate: "2027-05-31",
    status: "approved",
    purpose:
      "To establish joint research initiatives on ethical considerations in artificial intelligence",
    scope:
      "Joint research projects, student exchange, faculty collaboration, and publication of research papers.",
    financialTerms:
      "Shared project costs with potential for external funding applications",
    contactPersonName: "Dr. Priya Sharma",
    contactPersonEmail: "p.sharma@nieai.ac.in",
    contactPersonPhone: "8765432109",
    mouDocument: "nieai_research_mou.pdf",
    supportingDocuments: ["research_proposal.pdf", "funding_outline.pdf"],
    approvalDate: "2025-04-07",
    approvals: [
      {
        role: "Faculty Mentor",
        status: "approved",
        email: "faculty.mentor@lnmiit.ac.in",
        date: "2025-04-06",
        comments:
          "Great initiative that aligns well with our research objectives.",
      },
      {
        role: "Director",
        status: "approved",
        email: "director@lnmiit.ac.in",
        date: "2025-04-07",
        comments: "Approved. Please proceed with the formal signing process.",
      },
    ],
  },
  {
    id: 3,
    title: "Industry Training Partnership",
    partnerName: "GlobalTech Corporation",
    partnerType: "industry",
    submissionDate: "2025-03-25",
    startDate: "2025-05-01",
    endDate: "2026-04-30",
    status: "rejected",
    purpose:
      "To establish an internship program and training workshops for LNMIIT students",
    scope:
      "Semester-end internships, technical workshops, and industry visits for students",
    financialTerms:
      "Partner will provide stipends to interns; no financial obligation from LNMIIT",
    contactPersonName: "Vikram Mehta",
    contactPersonEmail: "v.mehta@globaltech.com",
    contactPersonPhone: "7654321098",
    mouDocument: "globaltech_partnership_mou.pdf",
    supportingDocuments: ["internship_structure.pdf"],
    rejectionDate: "2025-04-01",
    rejectionReason:
      "The financial terms are not clear regarding infrastructure usage. Please revise the proposal to include specific details about facility utilization and any associated costs. Also, the internship selection process needs to be more transparent and aligned with our academic calendar.",
    approvals: [
      {
        role: "Faculty Mentor",
        status: "rejected",
        email: "faculty.mentor@lnmiit.ac.in",
        date: "2025-04-01",
        comments:
          "Financial terms need more clarity. Selection process for internships is not well-defined.",
      },
      {
        role: "Director",
        status: "pending",
        email: "director@lnmiit.ac.in",
        date: null,
        comments: null,
      },
    ],
  },
  {
    id: 4,
    title: "Cultural Exchange Program",
    partnerName: "International Arts Foundation",
    partnerType: "nonprofit",
    submissionDate: "2025-03-15",
    startDate: "2025-04-10",
    endDate: "2026-04-09",
    status: "approved",
    purpose:
      "To establish a cultural exchange program for students to learn and appreciate diverse art forms",
    scope:
      "Quarterly cultural workshops, art exhibitions, student exchange programs.",
    financialTerms:
      "Foundation will sponsor travel expenses for international artists",
    contactPersonName: "Maya Johnson",
    contactPersonEmail: "m.johnson@intartsfoundation.org",
    contactPersonPhone: "7654321098",
    mouDocument: "iaf_cultural_mou.pdf",
    supportingDocuments: ["program_schedule.pdf", "artist_profiles.pdf"],
    approvalDate: "2025-03-25",
    approvals: [
      {
        role: "Faculty Mentor",
        status: "approved",
        email: "faculty.mentor@lnmiit.ac.in",
        date: "2025-03-20",
        comments: "Excellent opportunity for cultural enrichment.",
      },
      {
        role: "Director",
        status: "approved",
        email: "director@lnmiit.ac.in",
        date: "2025-03-25",
        comments: "Approved. Maintain documentation of all exchanges.",
      },
    ],
  },
];

const MOUStatus = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [mous, setMOUs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMOU, setSelectedMOU] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch MOUs
    setTimeout(() => {
      setMOUs(mockMOUs);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (mou) => {
    setSelectedMOU(mou);
    setDetailsOpen(true);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
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
        return {
          color: "warning",
          icon: <PendingIcon fontSize="small" />,
          label: "Pending",
        };
      default:
        return {
          color: "default",
          icon: <PendingIcon fontSize="small" />,
          label: status,
        };
    }
  };

  const handleEditMOU = (mouId) => {
    // In a real implementation, you would navigate to the edit form with the MOU ID
    alert(`Edit feature coming soon for MOU #${mouId}`);
    navigate(`/council/mou-addition?edit=${mouId}`);
  };

  const renderMOUDetails = () => {
    if (!selectedMOU) return null;

    const statusInfo = getStatusInfo(selectedMOU.status);

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
          <Typography variant="h6">MOU Details</Typography>
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
                  mb: 2,
                  borderRadius: 1,
                  bgcolor:
                    selectedMOU.status === "approved"
                      ? "rgba(46, 125, 50, 0.1)"
                      : selectedMOU.status === "rejected"
                      ? "rgba(211, 47, 47, 0.1)"
                      : "rgba(255, 167, 38, 0.1)",
                }}
              >
                <Box sx={{ mr: 1 }}>{statusInfo.icon}</Box>
                <Typography
                  variant="h6"
                  sx={{
                    color:
                      selectedMOU.status === "approved"
                        ? "success.main"
                        : selectedMOU.status === "rejected"
                        ? "error.main"
                        : "warning.main",
                  }}
                >
                  Status: {statusInfo.label}
                </Typography>
              </Box>
            </Grid>

            {/* Rejection Reason (if rejected) */}
            {selectedMOU.status === "rejected" && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Rejection Reason:
                  </Typography>
                  <Typography variant="body2">
                    {selectedMOU.rejectionReason}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Basic MOU Information */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    MOU Title:
                  </Typography>
                  <Typography>{selectedMOU.title}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Partner Organization:
                  </Typography>
                  <Typography>{selectedMOU.partnerName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Partner Type:
                  </Typography>
                  <Typography sx={{ textTransform: "capitalize" }}>
                    {selectedMOU.partnerType}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Submission Date:
                  </Typography>
                  <Typography>{selectedMOU.submissionDate}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedMOU.status === "approved"
                      ? "Approval Date:"
                      : selectedMOU.status === "rejected"
                      ? "Rejection Date:"
                      : ""}
                  </Typography>
                  {(selectedMOU.approvalDate || selectedMOU.rejectionDate) && (
                    <Typography>
                      {selectedMOU.approvalDate || selectedMOU.rejectionDate}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Start Date:
                  </Typography>
                  <Typography>{selectedMOU.startDate}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    End Date:
                  </Typography>
                  <Typography>{selectedMOU.endDate}</Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* MOU Details */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                MOU Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Purpose:
                  </Typography>
                  <Typography>{selectedMOU.purpose}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Scope of Collaboration:
                  </Typography>
                  <Typography>{selectedMOU.scope}</Typography>
                </Grid>
                {selectedMOU.financialTerms && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Financial Terms:
                    </Typography>
                    <Typography>{selectedMOU.financialTerms}</Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Contact Person Name:
                  </Typography>
                  <Typography>{selectedMOU.contactPersonName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Email:
                  </Typography>
                  <Typography>{selectedMOU.contactPersonEmail}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Phone:
                  </Typography>
                  <Typography>{selectedMOU.contactPersonPhone}</Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Documents */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
              >
                Documents
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    MOU Document:
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    size="small"
                    onClick={() => {
                      // Download logic would go here
                    }}
                  >
                    Download MOU Document
                  </Button>
                </Grid>
                {selectedMOU.supportingDocuments && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Supporting Documents:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {selectedMOU.supportingDocuments.map((doc, index) => (
                        <Button
                          key={index}
                          variant="text"
                          startIcon={<DownloadIcon />}
                          size="small"
                          onClick={() => {
                            // Download logic would go here
                          }}
                          sx={{ mr: 1, mb: 1 }}
                        >
                          {doc}
                        </Button>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
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
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Comments</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedMOU.approvals.map((approval, index) => {
                      const approvalStatusInfo = getStatusInfo(approval.status);
                      return (
                        <TableRow key={index}>
                          <TableCell>{approval.role}</TableCell>
                          <TableCell>
                            <Chip
                              label={approvalStatusInfo.label}
                              color={approvalStatusInfo.color}
                              size="small"
                              icon={approvalStatusInfo.icon}
                            />
                          </TableCell>
                          <TableCell>{approval.email}</TableCell>
                          <TableCell>{approval.date || "Pending"}</TableCell>
                          <TableCell>
                            {approval.comments || "No comments"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {selectedMOU.status === "rejected" && (
            <Button
              onClick={() => handleEditMOU(selectedMOU.id)}
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
            >
              Edit and Resubmit
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const filteredMOUs = (tab) => {
    switch (tab) {
      case 0: // All MOUs
        return mous;
      case 1: // Pending MOUs
        return mous.filter((mou) => mou.status === "pending");
      case 2: // Approved MOUs
        return mous.filter((mou) => mou.status === "approved");
      case 3: // Rejected MOUs
        return mous.filter((mou) => mou.status === "rejected");
      default:
        return mous;
    }
  };

  return (
    <>
      <WaveBackground />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <IconButton
            onClick={() => navigate("/council/dashboard")}
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
            MOU Status Dashboard
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
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All MOUs" />
            <Tab
              label="Pending"
              icon={<PendingIcon color="warning" />}
              iconPosition="start"
            />
            <Tab
              label="Approved"
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
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredMOUs(activeTab).length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Partner</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMOUs(activeTab).map((mou) => {
                    const statusInfo = getStatusInfo(mou.status);
                    return (
                      <TableRow key={mou.id}>
                        <TableCell>{mou.title}</TableCell>
                        <TableCell>{mou.partnerName}</TableCell>
                        <TableCell>{mou.submissionDate}</TableCell>
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
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(mou)}
                            sx={{ mr: 1 }}
                          >
                            View Details
                          </Button>
                          {mou.status === "rejected" && (
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditMOU(mou.id)}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No MOUs found in this category.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
      {renderMOUDetails()}
    </>
  );
};

export default MOUStatus;
