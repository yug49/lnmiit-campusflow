import React, { useState } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import WaveBackground from "../WaveBackground";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";

// Mock data for demonstration - replace with actual API calls
const mockPendingMOUs = [
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
    submittedBy: {
      name: "Student Council President",
      email: "council.president@lnmiit.ac.in",
    },
    approvals: [
      {
        role: "Faculty Mentor",
        status: "approved",
        email: "faculty.mentor@lnmiit.ac.in",
        date: "2025-04-05",
        comments:
          "Excellent opportunity for students to gain industry exposure.",
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
    status: "pending",
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
    submittedBy: {
      name: "Student Council Technical Secretary",
      email: "tech.secretary@lnmiit.ac.in",
    },
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
        status: "pending",
        email: "director@lnmiit.ac.in",
        date: null,
        comments: null,
      },
    ],
  },
];

const mockApprovedMOUs = [
  {
    id: 3,
    title: "Cultural Exchange Program",
    partnerName: "International Arts Foundation",
    partnerType: "nonprofit",
    submissionDate: "2025-03-15",
    approvalDate: "2025-03-25",
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
    submittedBy: {
      name: "Student Council Cultural Secretary",
      email: "cultural.secretary@lnmiit.ac.in",
    },
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
  {
    id: 4,
    title: "Industry Internship Partnership",
    partnerName: "Global Tech Solutions",
    partnerType: "industry",
    submissionDate: "2025-03-10",
    approvalDate: "2025-03-20",
    startDate: "2025-05-01",
    endDate: "2026-05-01",
    status: "approved",
    purpose: "To establish a structured internship program for LNMIIT students",
    scope:
      "Summer internships, industry mentorship, and potential placement opportunities",
    financialTerms:
      "Partner will provide stipend to interns as per industry standards",
    contactPersonName: "Vikram Malhotra",
    contactPersonEmail: "v.malhotra@globaltechsolutions.com",
    contactPersonPhone: "9988776655",
    mouDocument: "gts_internship_mou.pdf",
    supportingDocuments: ["internship_structure.pdf", "selection_process.pdf"],
    submittedBy: {
      name: "Student Council President",
      email: "council.president@lnmiit.ac.in",
    },
    approvals: [
      {
        role: "Faculty Mentor",
        status: "approved",
        email: "faculty.mentor@lnmiit.ac.in",
        date: "2025-03-15",
        comments:
          "Well-structured internship program with clear benefits for students.",
      },
      {
        role: "Director",
        status: "approved",
        email: "director@lnmiit.ac.in",
        date: "2025-03-20",
        comments: "Approved. Ensure proper monitoring of intern progress.",
      },
    ],
  },
];

const mockRejectedMOUs = [
  {
    id: 5,
    title: "Campus Food Service Partnership",
    partnerName: "QuickBite Foods",
    partnerType: "industry",
    submissionDate: "2025-03-05",
    rejectionDate: "2025-03-15",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    status: "rejected",
    purpose: "To establish additional food service options on campus",
    scope:
      "Setting up food kiosks in designated areas with special student discounts",
    financialTerms: "Monthly rent to be paid to the institution",
    contactPersonName: "Rohan Kapoor",
    contactPersonEmail: "r.kapoor@quickbite.com",
    contactPersonPhone: "8877665544",
    mouDocument: "quickbite_proposal.pdf",
    supportingDocuments: ["menu_options.pdf", "pricing_structure.pdf"],
    submittedBy: {
      name: "Student Council General Secretary",
      email: "general.secretary@lnmiit.ac.in",
    },
    rejectionReason:
      "The proposal conflicts with existing exclusive food service contract. Additionally, there are concerns about the quality standards and space requirements that cannot be accommodated at this time.",
    approvals: [
      {
        role: "Faculty Mentor",
        status: "rejected",
        email: "faculty.mentor@lnmiit.ac.in",
        date: "2025-03-12",
        comments:
          "Conflicts with existing food service contracts. Space constraints are a concern.",
      },
      {
        role: "Director",
        status: "rejected",
        email: "director@lnmiit.ac.in",
        date: "2025-03-15",
        comments:
          "Cannot approve due to existing contractual obligations and space limitations.",
      },
    ],
  },
];

const AdminMOUApproval = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMOU, setSelectedMOU] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (mou) => {
    setSelectedMOU(mou);
    setDetailsOpen(true);
    setComments("");
  };

  const handleApprove = () => {
    // Add API call to approve the MOU
    console.log("Approving MOU:", selectedMOU.id, "with comments:", comments);
    setDetailsOpen(false);

    // In a real app, this would update the server data and refresh the list
  };

  const handleOpenRejectionDialog = () => {
    setRejectionDialog(true);
  };

  const handleReject = () => {
    // Add API call to reject the MOU
    console.log(
      "Rejecting MOU:",
      selectedMOU.id,
      "with reason:",
      rejectionReason
    );
    setRejectionDialog(false);
    setDetailsOpen(false);

    // In a real app, this would update the server data and refresh the list
  };

  const renderMOUDetails = () => {
    if (!selectedMOU) return null;

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
            {/* Status Banner for rejected MOUs */}
            {selectedMOU.status === "rejected" && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: "error.main",
                    color: "white",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    This MOU was rejected on {selectedMOU.rejectionDate}
                  </Typography>
                  <Typography variant="body2">
                    Reason: {selectedMOU.rejectionReason}
                  </Typography>
                </Box>
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
                    Submitted By:
                  </Typography>
                  <Typography>
                    {selectedMOU.submittedBy.name} (
                    {selectedMOU.submittedBy.email})
                  </Typography>
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
                      console.log("Downloading:", selectedMOU.mouDocument);
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
                            console.log("Downloading supporting doc:", doc);
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
                    {selectedMOU.approvals.map((approval, index) => (
                      <TableRow key={index}>
                        <TableCell>{approval.role}</TableCell>
                        <TableCell>
                          <Chip
                            label={approval.status}
                            color={
                              approval.status === "approved"
                                ? "success"
                                : approval.status === "rejected"
                                ? "error"
                                : "warning"
                            }
                            size="small"
                            icon={
                              approval.status === "approved" ? (
                                <CheckCircleIcon fontSize="small" />
                              ) : approval.status === "rejected" ? (
                                <CancelIcon fontSize="small" />
                              ) : (
                                <PendingIcon fontSize="small" />
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>{approval.email}</TableCell>
                        <TableCell>{approval.date || "Pending"}</TableCell>
                        <TableCell>
                          {approval.comments || "No comments"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Comments Section (only for pending MOUs) */}
            {selectedMOU.status === "pending" && (
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 2 }}
                >
                  Your Comments (as Director)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Add your comments or notes about this MOU (optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {selectedMOU.status === "pending" && (
            <>
              <Button
                onClick={handleOpenRejectionDialog}
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                color="primary"
                startIcon={<CheckCircleIcon />}
              >
                Approve as Director
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
      onClose={() => setRejectionDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Reject MOU</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Please provide a reason for rejecting this MOU.
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
        <Button onClick={() => setRejectionDialog(false)}>Cancel</Button>
        <Button
          onClick={handleReject}
          variant="contained"
          color="error"
          disabled={!rejectionReason.trim()}
        >
          Confirm Rejection
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderPendingMOUs = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Partner Organization</TableCell>
            <TableCell>Submitted By</TableCell>
            <TableCell>Submission Date</TableCell>
            <TableCell>Faculty Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockPendingMOUs.map((mou) => {
            const facultyApproval = mou.approvals.find(
              (a) => a.role === "Faculty Mentor"
            );
            return (
              <TableRow key={mou.id}>
                <TableCell>{mou.title}</TableCell>
                <TableCell>{mou.partnerName}</TableCell>
                <TableCell>{mou.submittedBy.name}</TableCell>
                <TableCell>{mou.submissionDate}</TableCell>
                <TableCell>
                  <Chip
                    label={facultyApproval?.status || "pending"}
                    color={
                      facultyApproval?.status === "approved"
                        ? "success"
                        : facultyApproval?.status === "rejected"
                        ? "error"
                        : "warning"
                    }
                    size="small"
                    icon={
                      facultyApproval?.status === "approved" ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : facultyApproval?.status === "rejected" ? (
                        <CancelIcon fontSize="small" />
                      ) : (
                        <PendingIcon fontSize="small" />
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleViewDetails(mou)}
                    disabled={facultyApproval?.status !== "approved"}
                  >
                    Review MOU
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderApprovedMOUs = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Partner Organization</TableCell>
            <TableCell>Submission Date</TableCell>
            <TableCell>Approval Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockApprovedMOUs.map((mou) => (
            <TableRow key={mou.id}>
              <TableCell>{mou.title}</TableCell>
              <TableCell>{mou.partnerName}</TableCell>
              <TableCell>{mou.submissionDate}</TableCell>
              <TableCell>{mou.approvalDate}</TableCell>
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

  const renderRejectedMOUs = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Partner Organization</TableCell>
            <TableCell>Submission Date</TableCell>
            <TableCell>Rejection Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockRejectedMOUs.map((mou) => (
            <TableRow key={mou.id}>
              <TableCell>{mou.title}</TableCell>
              <TableCell>{mou.partnerName}</TableCell>
              <TableCell>{mou.submissionDate}</TableCell>
              <TableCell>{mou.rejectionDate}</TableCell>
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
            {activeTab === 1 && renderApprovedMOUs()}
            {activeTab === 2 && renderRejectedMOUs()}
          </Box>
        </Paper>
      </Container>
      {renderMOUDetails()}
      {renderRejectionDialog()}
    </>
  );
};

export default AdminMOUApproval;
