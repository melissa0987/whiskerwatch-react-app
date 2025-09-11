import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Trash2 } from 'lucide-react';
import apiService from '../../services/apiService';
import '../../css/dashboard/Profile.css';

const Profile = ({ user, getCustomerTypeDisplay, onEditProfile, onLogout }) => { 
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmText: ''
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  // visibility states for each password field
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
    delete: false
  });

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      // Use apiService which includes authentication headers
      const response = await apiService.changePassword(user.id, passwordData);
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Password updated successfully!' });
        return response;
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  const handleDeleteAccount = async (deleteData) => {
    try {
      // Use apiService which includes authentication headers
      const response = await apiService.deleteAccount(user.id, deleteData);
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  };

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteFormInput = (e) => {
    const { name, value } = e.target;
    setDeleteForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required.' });
      setIsLoading(false);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      setIsLoading(false);
      return;
    }

    try {
      await handlePasswordChange({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  }; 

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Clear previous messages
    setDeleteMessage({ type: '', text: '' });

    // Validation
    if (!deleteForm.password) {
      setDeleteMessage({ type: 'error', text: 'Password is required to delete your account.' });
      setIsLoading(false);
      return;
    }

    if (deleteForm.confirmText !== 'DELETE') {
      setDeleteMessage({ type: 'error', text: 'Please type "DELETE" exactly to confirm account deletion.' });
      setIsLoading(false);
      return;
    }

    try {
      await handleDeleteAccount({
        password: deleteForm.password
      });
      
      // If successful, show success message and logout
      setDeleteMessage({ type: 'success', text: 'Account deleted successfully. Logging out...' });
      
      // Clear form
      setDeleteForm({ password: '', confirmText: '' });
      
      // Logout user after a brief delay to show the success message
      setTimeout(() => {
        if (onLogout) {
          onLogout();
        }
      }, 1500);
      
    } catch (error) {
      setDeleteMessage({ type: 'error', text: error.message || 'Failed to delete account. Please check your password and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteForm(true);
    setDeleteMessage({ type: '', text: '' });
  };

  const handleCancelDelete = () => {
    setShowDeleteForm(false);
    setDeleteForm({ password: '', confirmText: '' });
    setDeleteMessage({ type: '', text: '' });
  };

  return (
    <div>
      {/* Profile Info */}
      <div className="profile-section">
        <h2 className="profile-section-title">Profile Information</h2>

        <div className="profile-form">
          <div className="profile-field"><label>First Name</label><input type="text" value={user.firstName || ''} readOnly className="profile-input" /></div>
          <div className="profile-field"><label>Last Name</label><input type="text" value={user.lastName || ''} readOnly className="profile-input" /></div>
          <div className="profile-field"><label>Username</label><input type="text" value={user.username || ''} readOnly className="profile-input" /></div>
          <div className="profile-field"><label>Email</label><input type="email" value={user.email || ''} readOnly className="profile-input" /></div>
          <div className="profile-field"><label>Phone Number</label><input type="tel" value={user.phoneNumber || ''} readOnly className="profile-input" /></div>
          <div className="profile-field"><label>Account Type</label><input type="text" value={getCustomerTypeDisplay(user.customerTypeId)} readOnly className="profile-input" /></div>
          <div className="profile-field full-width"><label>Address</label><textarea value={user.address || ''} readOnly rows="2" className="profile-textarea" /></div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary" onClick={onEditProfile}>Edit Profile</button>
        </div>
      </div>

      <hr className="profile-divider" />

      {/* Security Settings */}
      <div className="profile-section">
        <h3 className="profile-section-title">Security Settings</h3>
        
        <div className="security-actions">
          <button className="btn btn-warning" onClick={() => setShowPasswordForm(!showPasswordForm)} disabled={isLoading}>
            <Lock size={16} /> Change Password
          </button>
        </div>

        {message.text && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="security-form">
            {/* Current */}
            <div className="profile-field password-field">
              <label className="profile-label">Current Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChangeInput}
                  className="profile-input"
                  required
                  disabled={isLoading}
                />
                <button type="button" className="password-toggle-btn" onClick={() => toggleVisibility('current')} disabled={isLoading}>
                  {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New */}
            <div className="profile-field password-field">
              <label className="profile-label">New Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChangeInput}
                  className="profile-input"
                  required
                  disabled={isLoading}
                />
                <button type="button" className="password-toggle-btn" onClick={() => toggleVisibility('new')} disabled={isLoading}>
                  {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="profile-field password-field">
              <label className="profile-label">Confirm New Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChangeInput}
                  className="profile-input"
                  required
                  disabled={isLoading}
                />
                <button type="button" className="password-toggle-btn" onClick={() => toggleVisibility('confirm')} disabled={isLoading}>
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="security-actions">
              <button type="submit" className="btn btn-success" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setMessage({ type: '', text: '' });
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <hr className="profile-divider" />

      {/* Account Management */}
      <div className="profile-section">
        <h3 className="profile-section-title">Account Management</h3>
        <div className="account-management">
          <h4 className="account-management-title">Danger Zone</h4>
          <p className="account-management-description">
            These actions will affect your account and data. Please proceed with caution.
          </p>
          <div className="account-management-actions"> 
            <button className="btn btn-danger" onClick={handleDeleteAccountClick} disabled={isLoading}>
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>

        {deleteMessage.text && (
          <div className={`form-message ${deleteMessage.type}`} style={{ marginTop: '16px' }}>
            {deleteMessage.text}
          </div>
        )}

        {showDeleteForm && (
          <div className="security-form" style={{ backgroundColor: '#fff5f5', borderColor: '#fed7d7' }}>
            <h4 style={{ color: '#e53e3e', marginBottom: '16px' }}>Confirm Account Deletion</h4>
            <p style={{ color: '#744d4d', marginBottom: '20px' }}>
              This action cannot be undone. All your data including pets, bookings, and profile information will be permanently deleted.
            </p>
            
            <form onSubmit={handleDeleteSubmit}>
              {/* Password Confirmation */}
              <div className="profile-field password-field">
                <label className="profile-label">Enter your password to confirm</label>
                <div className="password-input-container">
                  <input
                    type={showPassword.delete ? 'text' : 'password'}
                    name="password"
                    value={deleteForm.password}
                    onChange={handleDeleteFormInput}
                    className="profile-input"
                    required
                    placeholder="Enter your current password"
                    disabled={isLoading}
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => toggleVisibility('delete')} disabled={isLoading}>
                    {showPassword.delete ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirmation Text */}
              <div className="profile-field">
                <label className="profile-label">Type "DELETE" to confirm</label>
                <input
                  type="text"
                  name="confirmText"
                  value={deleteForm.confirmText}
                  onChange={handleDeleteFormInput}
                  className="profile-input"
                  required
                  placeholder="Type DELETE to confirm"
                  disabled={isLoading}
                />
              </div>

              <div className="security-actions">
                <button 
                  type="submit" 
                  className="btn btn-danger"
                  disabled={deleteForm.confirmText !== 'DELETE' || !deleteForm.password || isLoading}
                >
                  <Trash2 size={16} /> {isLoading ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancelDelete}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!showDeleteForm && (
          <div className="form-message info" style={{ marginTop: '16px' }}>
            <strong>Account Deletion:</strong> Permanently removes all your data. This action cannot be undone.
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;