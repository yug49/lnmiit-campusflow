import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";
import apiClient from "../../utils/apiClient";

const CandidatureApproval = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [filteredCandidatures, setFilteredCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchCandidatures();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredCandidatures(candidatures);
    } else {
      setFilteredCandidatures(
        candidatures.filter(
          (candidate) =>
            candidate.status.toLowerCase() === activeTab.toLowerCase()
        )
      );
    }
  }, [activeTab, candidatures]);

  const fetchCandidatures = async () => {
    try {
      setLoading(true);
      const response = await apiClient.voting.getAllCandidatures();
      setCandidatures(response.candidatures);
      setFilteredCandidatures(response.candidatures);

      // Initialize remarks state
      const initialRemarks = {};
      response.candidatures.forEach((candidate) => {
        initialRemarks[candidate._id] = candidate.remark || "";
      });
      setRemarks(initialRemarks);

      setLoading(false);
    } catch (error) {
      setError("Failed to load candidature applications");
      setLoading(false);
      console.error(error);
    }
  };

  const handleRemarkChange = (candidateId, value) => {
    setRemarks({
      ...remarks,
      [candidateId]: value,
    });
  };

  const handleUpdateStatus = async (candidateId, status) => {
    try {
      setSelectedCandidate(candidateId);

      await apiClient.voting.updateCandidatureStatus(candidateId, {
        status,
        remark: remarks[candidateId],
      });

      // Update candidature in the local state
      const updatedCandidatures = candidatures.map((candidate) =>
        candidate._id === candidateId
          ? { ...candidate, status, remark: remarks[candidateId] }
          : candidate
      );

      setCandidatures(updatedCandidatures);

      // Update filtered candidates based on active tab
      if (activeTab === "all") {
        setFilteredCandidatures(updatedCandidatures);
      } else {
        setFilteredCandidatures(
          updatedCandidatures.filter(
            (candidate) =>
              candidate.status.toLowerCase() === activeTab.toLowerCase()
          )
        );
      }

      setUpdateSuccess(`Candidature status updated to ${status}`);

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (error) {
      setError("Failed to update candidature status");
      console.error(error);
      setSelectedCandidate(null);
    }
  };

  // Calculate stats for the summary cards
  const pendingCount = candidatures.filter(
    (c) => c.status === "Pending"
  ).length;
  const approvedCount = candidatures.filter(
    (c) => c.status === "Approved"
  ).length;
  const rejectedCount = candidatures.filter(
    (c) => c.status === "Rejected"
  ).length;
  const revertedCount = candidatures.filter(
    (c) => c.status === "Reverted"
  ).length;

  return (
    <Container className="py-4">
      <Row className="justify-content-center mb-4">
        <Col md={12}>
          <h2 className="mb-2">Candidature Approval</h2>
          <p className="text-muted">
            Manage and review candidate applications for elections
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mb-4"
            onClick={() => fetchCandidatures()}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {error && (
        <Row className="justify-content-center mb-4">
          <Col md={12}>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {updateSuccess && (
        <Row className="justify-content-center mb-4">
          <Col md={12}>
            <Alert
              variant="success"
              dismissible
              onClose={() => setUpdateSuccess(null)}
            >
              <i className="bi bi-check-circle me-2"></i>
              {updateSuccess}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Summary Cards */}
      <Row className="justify-content-center mb-4">
        <Col md={3} sm={6} className="mb-3">
          <div className="card">
            <div className="card-body">
              <div className="mb-2">Total Candidatures</div>
              <h3>{candidatures.length}</h3>
            </div>
          </div>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <div className="card">
            <div className="card-body">
              <div className="mb-2">Pending</div>
              <h3>{pendingCount}</h3>
            </div>
          </div>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <div className="card">
            <div className="card-body">
              <div className="mb-2">Approved</div>
              <h3>{approvedCount}</h3>
            </div>
          </div>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <div className="card">
            <div className="card-body">
              <div className="mb-2">Rejected</div>
              <h3>{rejectedCount}</h3>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center mb-4">
        <Col md={12}>
          {loading ? (
            <div className="text-center my-5 py-5">
              <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3 text-muted">
                Loading candidature applications...
              </p>
            </div>
          ) : (
            <>
              <ul className="list-unstyled mb-4">
                <li>
                  <Button
                    variant={
                      activeTab === "all" ? "primary" : "outline-primary"
                    }
                    className="me-2 mb-2"
                    onClick={() => setActiveTab("all")}
                  >
                    All {candidatures.length}
                  </Button>
                </li>
                <li>
                  <Button
                    variant={
                      activeTab === "pending" ? "primary" : "outline-primary"
                    }
                    className="me-2 mb-2"
                    onClick={() => setActiveTab("pending")}
                  >
                    Pending {pendingCount}
                  </Button>
                </li>
                <li>
                  <Button
                    variant={
                      activeTab === "approved" ? "primary" : "outline-primary"
                    }
                    className="me-2 mb-2"
                    onClick={() => setActiveTab("approved")}
                  >
                    Approved {approvedCount}
                  </Button>
                </li>
                <li>
                  <Button
                    variant={
                      activeTab === "rejected" ? "primary" : "outline-primary"
                    }
                    className="me-2 mb-2"
                    onClick={() => setActiveTab("rejected")}
                  >
                    Rejected {rejectedCount}
                  </Button>
                </li>
                <li>
                  <Button
                    variant={
                      activeTab === "reverted" ? "primary" : "outline-primary"
                    }
                    className="me-2 mb-2"
                    onClick={() => setActiveTab("reverted")}
                  >
                    Reverted {revertedCount}
                  </Button>
                </li>
              </ul>

              {filteredCandidatures.length === 0 ? (
                <Alert variant="info" className="text-center">
                  No candidature applications in this category
                </Alert>
              ) : (
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Position</th>
                      <th>Batch</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidatures.map((candidate) => (
                      <tr key={candidate._id}>
                        <td>{candidate.user?.name}</td>
                        <td>{candidate.position}</td>
                        <td>{candidate.batch}</td>
                        <td>{candidate.status}</td>
                        <td>
                          {new Date(candidate.submittedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              const expanded =
                                selectedCandidate === candidate._id;
                              setSelectedCandidate(
                                expanded ? null : candidate._id
                              );
                            }}
                          >
                            {selectedCandidate === candidate._id
                              ? "Hide"
                              : "View"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Col>
      </Row>

      {selectedCandidate && (
        <Row className="justify-content-center mb-4">
          <Col md={12}>
            {candidatures
              .filter((c) => c._id === selectedCandidate)
              .map((candidate) => (
                <Card key={candidate._id} className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Candidate Details</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p>
                          <strong>Name:</strong> {candidate.user?.name}
                        </p>
                        <p>
                          <strong>Roll Number:</strong>{" "}
                          {candidate.user?.rollNumber}
                        </p>
                        <p>
                          <strong>Email:</strong> {candidate.user?.email}
                        </p>
                        <p>
                          <strong>Batch:</strong> {candidate.batch}
                        </p>
                        <p>
                          <strong>Position:</strong> {candidate.position}
                        </p>
                      </Col>
                      <Col md={6}>
                        <p>
                          <strong>Status:</strong> {candidate.status}
                        </p>
                        <p>
                          <strong>Submitted:</strong>{" "}
                          {new Date(candidate.submittedAt).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Statement:</strong> {candidate.statement}
                        </p>
                        {candidate.experience && (
                          <p>
                            <strong>Experience:</strong> {candidate.experience}
                          </p>
                        )}
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Admin Remarks</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={remarks[candidate._id] || ""}
                        onChange={(e) =>
                          handleRemarkChange(candidate._id, e.target.value)
                        }
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        onClick={() =>
                          handleUpdateStatus(candidate._id, "Approved")
                        }
                        disabled={candidate.status === "Approved"}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          handleUpdateStatus(candidate._id, "Rejected")
                        }
                        disabled={candidate.status === "Rejected"}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="warning"
                        onClick={() =>
                          handleUpdateStatus(candidate._id, "Reverted")
                        }
                        disabled={candidate.status === "Reverted"}
                      >
                        Revert
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
          </Col>
        </Row>
      )}

      <footer className="text-center mt-5 pt-5 pb-3 text-muted">
        <p>© 2023 LNMIIT-CampusConnect • All rights reserved</p>
      </footer>
    </Container>
  );
};

export default CandidatureApproval;
