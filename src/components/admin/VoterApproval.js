import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Button,
  Alert,
  Badge,
  Spinner,
} from "react-bootstrap";
import api from "../../utils/apiClient";

const VoterApproval = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingIds, setProcessingIds] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch all regular students
      const response = await api.users.getAllStudents();
      setStudents(response.students);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students. Please try again later.");
      setLoading(false);
    }
  };

  const handleTemporaryApproval = async (studentId, email, name) => {
    try {
      // Add to processing state to show loading indicator
      setProcessingIds((prev) => [...prev, studentId]);

      // Use the voting API to authorize voter for 5 minutes
      await api.voting.authorizeTemporaryVoter(studentId, email, name);

      // Show success message
      setSuccess(`Voting access granted for 5 minutes`);

      // Update the list to reflect changes
      setStudents(
        students.map((student) =>
          student._id === studentId
            ? {
                ...student,
                votingAuthorized: true,
                votingExpires: new Date(Date.now() + 5 * 60000).toISOString(),
              }
            : student
        )
      );

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating voter status:", err);
      setError("Failed to approve voting access. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      // Remove from processing state
      setProcessingIds((prev) => prev.filter((id) => id !== studentId));
    }
  };

  const filteredStudents = students.filter((student) => {
    // Apply search filter (case insensitive)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.rollNumber?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getVotingStatus = (student) => {
    if (!student.votingAuthorized) {
      return <Badge bg="secondary">Not Authorized</Badge>;
    }

    const expiryTime = new Date(student.votingExpires);
    const now = new Date();

    if (expiryTime > now) {
      return <Badge bg="success">Authorized</Badge>;
    } else {
      return <Badge bg="warning">Expired</Badge>;
    }
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">Voter Approval</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Search Students</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name, email, or roll number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Alert variant="info">No students found matching your search</Alert>
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Email</th>
              <th>Voting Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.rollNumber}</td>
                <td>{student.email}</td>
                <td>{getVotingStatus(student)}</td>
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      handleTemporaryApproval(
                        student._id,
                        student.email,
                        student.name
                      )
                    }
                    disabled={processingIds.includes(student._id)}
                  >
                    {processingIds.includes(student._id) ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="ms-2">Processing...</span>
                      </>
                    ) : (
                      "Approve for 5 Minutes"
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default VoterApproval;
