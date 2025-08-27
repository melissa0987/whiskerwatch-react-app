import React, { useState } from "react"; 

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    customerType: "OWNER",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage("");

    try {
      if (mode === "login") {
        console.log("Login attempt:", {
          email: formData.email,
          password: formData.password,
        });
        setMessage("Login functionality would connect to your backend API");
      } else {
        const userData = {
          ...formData,
          roleId: 1,
          customerTypeId:
            formData.customerType === "OWNER"
              ? 1
              : formData.customerType === "SITTER"
              ? 2
              : 3,
        };
        console.log("Signup attempt:", userData);
        setMessage("Signup functionality would POST to /api/users endpoint");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid = () => {
    if (mode === "login") {
      return formData.email && formData.password;
    } else {
      return (
        formData.userName &&
        formData.email &&
        formData.password &&
        formData.firstName &&
        formData.lastName &&
        formData.phoneNumber &&
        formData.address
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>{mode === "login" ? "Welcome Back" : "Join Whisker Watch"}</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {mode === "signup" && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {mode === "signup" && (
            <>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>I want to be a:</label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                >
                  <option value="OWNER">Pet Owner</option>
                  <option value="SITTER">Pet Sitter</option>
                  <option value="BOTH">Both Owner & Sitter</option>
                </select>
              </div>
            </>
          )}

          {message && (
            <div
              className={`alert ${
                message.includes("error") ? "alert-error" : "alert-info"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="btn btn-primary full-width"
          >
            {isSubmitting
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </div>

        <div className="modal-footer">
          <p>
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button onClick={onSwitchMode} className="link">
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
