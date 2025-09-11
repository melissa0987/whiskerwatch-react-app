import React, { useState, useEffect } from 'react';
import '../../css/dashboard/EditProfile.css';

const EditProfile = ({ user, onClose, onSave, refreshData }) => {
  // Add useEffect to manage body class for modal
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Parse existing address or set defaults
  const parseAddress = (address) => {
    if (!address) return { name: '', street: '', city: '', province: '', postalCode: '' };
    
    // Try to parse existing address format: "Name, Street, City, Province PostalCode"
    const parts = address.split(', ');
    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1]; // "Province PostalCode"
      const lastSpaceIndex = lastPart.lastIndexOf(' ');
      
      return {
        name: parts[0] || '',
        street: parts[1] || '',
        city: parts[2] || '',
        province: lastSpaceIndex > 0 ? lastPart.substring(0, lastSpaceIndex) : '',
        postalCode: lastSpaceIndex > 0 ? lastPart.substring(lastSpaceIndex + 1) : ''
      };
    }
    
    // If parsing fails, put everything in street field
    return { name: '', street: address, city: '', province: '', postalCode: '' };
  };

  const [editForm, setEditForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    customerTypeId: user.customerTypeId || 1,
    address: parseAddress(user.address)
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!editForm.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!editForm.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!editForm.username.trim()) newErrors.username = 'username is required';
    if (!editForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      newErrors.email = 'Email format is invalid';
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (editForm.phoneNumber && !/^[+]?[\d\s\-()]{10,}$/.test(editForm.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatAddress = (addressObj) => {
    const { name, street, city, province, postalCode } = addressObj;
    const parts = [name, street, city, `${province} ${postalCode}`.trim()].filter(part => part.trim());
    return parts.join(', ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Format the complete address
    const formattedAddress = formatAddress(editForm.address);
    
    const updatedData = {
      username: editForm.username,
      email: editForm.email,
      password: null, // Don't update password through profile edit
      roleId: user.roleId || 1, // Keep existing role
      customerTypeId: editForm.customerTypeId,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phoneNumber: editForm.phoneNumber,
      address: formattedAddress,
      isActive: user.isActive !== undefined ? user.isActive : true // Keep existing status
    };

    console.log("Updated profile data:", updatedData);
    
    // Call the correct parent function
    if (onSave) {
      onSave(updatedData); // This will update the user and close modal
    }
    
    // Refresh data after successful update
    if (refreshData) {
      await refreshData();
    }
  };

  // Handle overlay click to close modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getCustomerTypeDisplayLocal = (customerTypeId) => {
    switch (customerTypeId) {
      case 1: return 'Pet Owner';
      case 2: return 'Pet Sitter'; 
      default: return 'Pet Owner';
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="auth-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="input-row">
                <div className="form-field">
                  <input 
                    type="text" 
                    name="firstName"
                    placeholder="First Name"
                    value={editForm.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <div className="error-text">{errors.firstName}</div>}
                </div>
                <div className="form-field">
                  <input 
                    type="text" 
                    name="lastName"
                    placeholder="Last Name"
                    value={editForm.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <div className="error-text">{errors.lastName}</div>}
                </div>
              </div>

              <div className="form-field">
                <input 
                  type="text" 
                  name="username"
                  placeholder="username"
                  value={editForm.username}
                  onChange={handleChange}
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <div className="error-text">{errors.username}</div>}
              </div>

              <div className="form-field">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email"
                  value={editForm.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <div className="error-text">{errors.email}</div>}
              </div>

              <div className="form-field">
                <input 
                  type="tel" 
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={editForm.phoneNumber}
                  onChange={handleChange}
                  className={errors.phoneNumber ? 'error' : ''}
                />
                {errors.phoneNumber && <div className="error-text">{errors.phoneNumber}</div>}
              </div>

              <div className="form-field">
                <select 
                  name="customerTypeId" 
                  value={editForm.customerTypeId} 
                  onChange={handleChange}
                >
                  <option value={1}>Pet Owner</option>
                  <option value={2}>Pet Sitter</option> 
                </select>
              </div>

              <p>
                Current account type: <strong>{getCustomerTypeDisplayLocal(editForm.customerTypeId)}</strong>
              </p>
            </div>

            {/* Address Section */}
            <div className="form-section">
              <h4>Address Details</h4>
              
              <div className="form-field">
                <input 
                  type="text" 
                  name="address.name"
                  placeholder="Name/Building (optional)"
                  value={editForm.address.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <input 
                  type="text" 
                  name="address.street"
                  placeholder="Street Address"
                  value={editForm.address.street}
                  onChange={handleChange}
                />
              </div>

              <div className="input-row">
                <div className="form-field">
                  <input 
                    type="text" 
                    name="address.city"
                    placeholder="City"
                    value={editForm.address.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <input 
                    type="text" 
                    name="address.province"
                    placeholder="Province"
                    value={editForm.address.province}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <input 
                  type="text" 
                  name="address.postalCode"
                  placeholder="Postal Code"
                  value={editForm.address.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address Preview */}
            {(editForm.address.street || editForm.address.city) && (
              <div className="address-preview">
                <strong>Address Preview:</strong>
                <div className="preview-text">
                  {formatAddress(editForm.address) || 'No address specified'}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={Object.keys(errors).length > 0}
            >
              Update Profile
            </button>
          </form>
        </div>

        <div className="auth-modal-footer">
          
        </div>
      </div>
    </div>
  );
};

export default EditProfile;