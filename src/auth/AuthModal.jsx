 
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import '../css/AuthModal.css';

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode, defaultCustomerType }) => {
  const { login, signup, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    customerType: defaultCustomerType || ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [localMessage, setLocalMessage] = useState('');

  // Update customer type when modal opens
  useEffect(() => {
    if (isOpen && defaultCustomerType) {
      setFormData(prev => ({ ...prev, customerType: defaultCustomerType }));
    }
  }, [isOpen, defaultCustomerType]);

  // Clear errors when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      clearError();
      setLocalMessage('');
      setValidationErrors({});
    }
  }, [isOpen, clearError]);

  // Clear form when switching modes
  useEffect(() => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      customerType: defaultCustomerType || ''
    });
    setValidationErrors({});
    setLocalMessage('');
  }, [mode, defaultCustomerType]);

  if (!isOpen) return null;

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (mode === 'signup') {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.username.trim()) errors.username = 'Username is required';
      if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
      if (!formData.address.trim()) errors.address = 'Address is required';
      if (!formData.customerType) errors.customerType = 'Please select a customer type';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let response;
      
      if (mode === 'login') {
        response = await login(formData.email, formData.password);
      } else {
        const signupData = {
          ...formData,
          customerTypeId:
            formData.customerType === 'OWNER' ? 1 :
            formData.customerType === 'SITTER' ? 2 :
            null
        };
        response = await signup(signupData);
      }

      if (response.success) {
        setLocalMessage('Success! Welcome!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setLocalMessage(response.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setLocalMessage('An unexpected error occurred');
    }
  };

  const displayMessage = localMessage || error;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Join WhiskerWatch'}</h2>
          <button 
            type="button" 
            className="close-button"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={validationErrors.firstName ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {validationErrors.firstName && (
                    <span className="error-text">{validationErrors.firstName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={validationErrors.lastName ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {validationErrors.lastName && (
                    <span className="error-text">{validationErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={validationErrors.username ? 'error' : ''}
                  disabled={isLoading}
                />
                {validationErrors.username && (
                  <span className="error-text">{validationErrors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={validationErrors.phoneNumber ? 'error' : ''}
                  disabled={isLoading}
                />
                {validationErrors.phoneNumber && (
                  <span className="error-text">{validationErrors.phoneNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={validationErrors.address ? 'error' : ''}
                  disabled={isLoading}
                />
                {validationErrors.address && (
                  <span className="error-text">{validationErrors.address}</span>
                )}
              </div>

              <div className="form-group">
                <label>I am a *</label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  className={validationErrors.customerType ? 'error' : ''}
                  disabled={isLoading}
                >
                  <option value="">Select one</option>
                  <option value="OWNER">Pet Owner</option>
                  <option value="SITTER">Pet Sitter</option>
                </select>
                {validationErrors.customerType && (
                  <span className="error-text">{validationErrors.customerType}</span>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={validationErrors.email ? 'error' : ''}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <span className="error-text">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={validationErrors.password ? 'error' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {validationErrors.password && (
              <span className="error-text">{validationErrors.password}</span>
            )}
          </div>

          {displayMessage && (
            <div className={`message ${displayMessage.includes('Success') ? 'success' : 'error'}`}>
              {displayMessage}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={onSwitchMode}
                className="link-button"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={onSwitchMode}
                className="link-button"
                disabled={isLoading}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;