import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/apiClient";

const MyAccount = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // User profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contactNumber: "",
    department: "",
    designation: "",
    // Student fields
    rollNumber: "",
    yearOfJoining: "",
    yearOfGraduation: "",
    program: "",
    // Faculty fields
    employeeId: "",
    // Council fields
    position: "",
    // Address fields
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    },
  });

  // File upload states
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState("");

  // Refs for file inputs
  const profilePhotoRef = useRef();
  const signatureRef = useRef();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await api.users.getProfile();

        if (response && response.data) {
          const userData = response.data;
          setProfile({
            ...userData,
            // Ensure address is not null
            address: userData.address || {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "India",
            },
            // Ensure these are strings or empty strings for form inputs
            yearOfJoining: userData.yearOfJoining
              ? userData.yearOfJoining.toString()
              : "",
            yearOfGraduation: userData.yearOfGraduation
              ? userData.yearOfGraduation.toString()
              : "",
          });

          // Set photo previews if available
          if (userData.profilePhoto && userData.profilePhoto.url) {
            setProfilePhotoPreview(userData.profilePhoto.url);
          }

          if (userData.digitalSignature && userData.digitalSignature.url) {
            setSignaturePreview(userData.digitalSignature.url);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Handle nested properties (address)
      const [parent, child] = name.split(".");
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  // Handle profile photo change
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      setError("Please upload an image file (JPEG, PNG, GIF)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5MB");
      return;
    }

    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  // Handle signature file change
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type;
    if (
      !fileType.match(/^image\/(jpeg|jpg|png|gif)$/) &&
      fileType !== "application/pdf"
    ) {
      setError("Please upload an image or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5MB");
      return;
    }

    setSignatureFile(file);

    if (fileType.startsWith("image/")) {
      setSignaturePreview(URL.createObjectURL(file));
    } else {
      // For PDF, use a placeholder
      setSignaturePreview("/images/pdf-placeholder.png");
    }
    setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      // Update profile details
      const profileData = {
        ...profile,
        yearOfJoining: profile.yearOfJoining
          ? parseInt(profile.yearOfJoining, 10)
          : undefined,
        yearOfGraduation: profile.yearOfGraduation
          ? parseInt(profile.yearOfGraduation, 10)
          : undefined,
      };

      await api.users.updateProfile(profileData);

      // Upload profile photo if selected
      if (profilePhotoFile) {
        await api.users.uploadProfilePhoto(profilePhotoFile);
      }

      // Upload signature if selected
      if (signatureFile) {
        await api.users.uploadDigitalSignature(signatureFile);
      }

      setSuccess("Profile updated successfully");
      // Clean up file upload states
      setProfilePhotoFile(null);
      setSignatureFile(null);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine which fields to show based on user role
  const showStudentFields = profile.role === "student";
  const showFacultyFields = profile.role === "faculty";
  const showCouncilFields = profile.role === "council";

  // Loading state
  if (isLoading) {
    return (
      <div className="my-account-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="my-account-page">
      <div className="container">
        <div className="account-header">
          <h1>My Account</h1>
          <p>Update your personal information and profile</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Left column - Personal Info */}
            <div className="col-md-8">
              <div className="card mb-4">
                <div className="card-header">
                  <h5>Personal Information</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={profile.email}
                        readOnly
                        disabled
                      />
                      <small className="text-muted">
                        Email cannot be changed
                      </small>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="contactNumber" className="form-label">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="contactNumber"
                        name="contactNumber"
                        value={profile.contactNumber || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="department" className="form-label">
                        Department
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="department"
                        name="department"
                        value={profile.department || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-12">
                      <label htmlFor="designation" className="form-label">
                        Designation
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="designation"
                        name="designation"
                        value={profile.designation || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Role-specific fields */}
                  {showStudentFields && (
                    <div className="student-fields">
                      <h6 className="mt-4">Student Information</h6>
                      <hr />

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="rollNumber" className="form-label">
                            Roll Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="rollNumber"
                            name="rollNumber"
                            value={profile.rollNumber || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="program" className="form-label">
                            Program
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="program"
                            name="program"
                            value={profile.program || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="yearOfJoining" className="form-label">
                            Year of Joining
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="yearOfJoining"
                            name="yearOfJoining"
                            value={profile.yearOfJoining || ""}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="yearOfGraduation"
                            className="form-label"
                          >
                            Year of Graduation
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="yearOfGraduation"
                            name="yearOfGraduation"
                            value={profile.yearOfGraduation || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {showFacultyFields && (
                    <div className="faculty-fields">
                      <h6 className="mt-4">Faculty Information</h6>
                      <hr />

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="employeeId" className="form-label">
                            Employee ID
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="employeeId"
                            name="employeeId"
                            value={profile.employeeId || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {showCouncilFields && (
                    <div className="council-fields">
                      <h6 className="mt-4">Council Information</h6>
                      <hr />

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="position" className="form-label">
                            Position
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="position"
                            name="position"
                            value={profile.position || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <h6 className="mt-4">Address</h6>
                  <hr />

                  <div className="row mb-3">
                    <div className="col-md-12">
                      <label htmlFor="street" className="form-label">
                        Street Address
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="street"
                        name="address.street"
                        value={profile.address?.street || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="city" className="form-label">
                        City
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="address.city"
                        value={profile.address?.city || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="state" className="form-label">
                        State
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="state"
                        name="address.state"
                        value={profile.address?.state || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="zipCode" className="form-label">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="zipCode"
                        name="address.zipCode"
                        value={profile.address?.zipCode || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="country" className="form-label">
                        Country
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="country"
                        name="address.country"
                        value={profile.address?.country || "India"}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Photos and signature */}
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-header">
                  <h5>Profile Photo</h5>
                </div>
                <div className="card-body text-center">
                  <div className="mb-3">
                    {profilePhotoPreview ? (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile Preview"
                        className="img-thumbnail profile-photo-preview"
                        style={{ maxWidth: "100%", maxHeight: "200px" }}
                      />
                    ) : (
                      <div className="profile-photo-placeholder">
                        <span>No profile photo</span>
                      </div>
                    )}
                  </div>

                  <div className="d-grid">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => profilePhotoRef.current.click()}
                    >
                      Change Photo
                    </button>
                    <input
                      type="file"
                      ref={profilePhotoRef}
                      onChange={handleProfilePhotoChange}
                      className="d-none"
                      accept="image/jpeg,image/png,image/gif"
                    />
                  </div>
                  <small className="form-text text-muted mt-2">
                    Upload a clear photo. Max size: 5MB. Formats: JPG, PNG, GIF
                  </small>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header">
                  <h5>Digital Signature</h5>
                </div>
                <div className="card-body text-center">
                  <div className="mb-3">
                    {signaturePreview ? (
                      <img
                        src={signaturePreview}
                        alt="Signature Preview"
                        className="img-thumbnail signature-preview"
                        style={{ maxWidth: "100%", maxHeight: "150px" }}
                      />
                    ) : (
                      <div className="signature-placeholder">
                        <span>No signature uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="d-grid">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => signatureRef.current.click()}
                    >
                      Upload Signature
                    </button>
                    <input
                      type="file"
                      ref={signatureRef}
                      onChange={handleSignatureChange}
                      className="d-none"
                      accept="image/jpeg,image/png,image/gif,application/pdf"
                    />
                  </div>
                  <small className="form-text text-muted mt-2">
                    Upload your signature. Max size: 5MB. Formats: JPG, PNG,
                    GIF, PDF
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions mt-4 mb-5">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyAccount;
