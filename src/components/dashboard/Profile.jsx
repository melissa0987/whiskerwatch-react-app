import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Trash2 } from 'lucide-react';
import '../../css/dashboard/Profile.css';

const Profile = ({ user, getCustomerTypeDisplay, onEditProfile }) => { 
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // visibility states for each password field
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to change password');

      setMessage({ type: 'success', text: data.message });
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
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
    }
  }; 

  const handleDeleteAccount = () => {
    const confirmText = 'DELETE';
    const userInput = window.prompt(`This action cannot be undone. Type "${confirmText}" to confirm account deletion:`);
    if (userInput === confirmText) {
      console.log('Account deletion requested for user:', user.id);
      setMessage({ type: 'error', text: 'Account deletion request submitted. This action cannot be undone.' });
    }
  };

  return (
    <div>
      {/* Profile Info */}
      <div className="profile-section">
        <h2 className="profile-section-title">Profile Information</h2>

        <div className="profile-form">
          <div className="profile-field"><label>First Name</label><input type="text" value={user.firstName || ''} readOnly className="profile-input" /></div>
          <div className="profile-field"><label>Last Name</label><input type="text" value={user.lastName || ''} readOnly className="profile-input" /></div>
          <div className="profile-field"><label>Username</label><input type="text" value={user.userName || ''} readOnly className="profile-input" /></div>
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
          <button className="btn btn-warning" onClick={() => setShowPasswordForm(!showPasswordForm)}>
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
                />
                <button type="button" className="password-toggle-btn" onClick={() => toggleVisibility('current')}>
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
                />
                <button type="button" className="password-toggle-btn" onClick={() => toggleVisibility('new')}>
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
                />
                <button type="button" className="password-toggle-btn" onClick={() => toggleVisibility('confirm')}>
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="security-actions">
              <button type="submit" className="btn btn-success">Update Password</button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setMessage({ type: '', text: '' });
                }}
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
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
        <div className="form-message info" style={{ marginTop: '16px' }}>
          <strong>Account Deletion:</strong> Permanently removes all your data. This action cannot be undone.
        </div>
      </div>
    </div>
  );
};

export default Profile;
