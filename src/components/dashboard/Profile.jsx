import React, { useState } from 'react';
import { Lock, Trash2, UserX } from 'lucide-react';
import '../../css/dashboard/Profile.css';

const Profile = ({ user, getCustomerTypeDisplay, onEditProfile }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
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
    
    console.log('Password change requested:', {
      userId: user.id,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    
    setMessage({ type: 'success', text: 'Password changed successfully!' });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
  };

  const handleDeactivateAccount = () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action can be reversed by contacting support.')) {
      console.log('Account deactivation requested for user:', user.id);
      setMessage({ type: 'info', text: 'Account deactivation request submitted. You will receive a confirmation email.' });
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
      {/* Basic Profile Information */}
      <div className="profile-section">
        <h2 className="profile-section-title">Profile Information</h2>

        {message.text && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-form">
          <div className="profile-field">
            <label>First Name</label>
            <input type="text" value={user.firstName || ''} readOnly className="profile-input" />
          </div>
          <div className="profile-field">
            <label>Last Name</label>
            <input type="text" value={user.lastName || ''} readOnly className="profile-input" />
          </div>
          <div className="profile-field">
            <label>Username</label>
            <input type="text" value={user.userName || ''} readOnly className="profile-input" />
          </div>
          <div className="profile-field">
            <label>Email</label>
            <input type="email" value={user.email || ''} readOnly className="profile-input" />
          </div>
          <div className="profile-field">
            <label>Phone Number</label>
            <input type="tel" value={user.phoneNumber || ''} readOnly className="profile-input" />
          </div>
          <div className="profile-field">
            <label>Account Type</label>
            <input type="text" value={getCustomerTypeDisplay(user.customerTypeId)} readOnly className="profile-input" />
          </div>
          <div className="profile-field full-width">
            <label>Address</label>
            <textarea value={user.address || ''} readOnly rows="2" className="profile-textarea" />
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="btn btn-primary" 
            onClick={onEditProfile}
          >
            Edit Profile
          </button>
        </div>
      </div>

      <hr className="profile-divider" />

      {/* Security Settings */}
      <div className="profile-section">
        <h3 className="profile-section-title">Security Settings</h3>
        
        <div className="security-actions">
          <button 
            className="btn btn-warning"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <Lock size={16} />
            Change Password
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="security-form">
            <div className="profile-field">
              <label className="profile-label">Current Password</label>
              <input 
                type="password" 
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="profile-input"
                required
              />
            </div>
            
            <div className="profile-field">
              <label className="profile-label">New Password</label>
              <input 
                type="password" 
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="profile-input"
                minLength="8"
                required
              />
            </div>
            
            <div className="profile-field">
              <label className="profile-label">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="profile-input"
                minLength="8"
                required
              />
            </div>
            
            <div className="security-actions">
              <button type="submit" className="btn btn-success">
                Update Password
              </button>
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
            <button 
              className="btn btn-warning"
              onClick={handleDeactivateAccount}
            >
              <UserX size={16} />
              Deactivate Account
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={handleDeleteAccount}
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
        
        <div className="form-message info" style={{ marginTop: '16px' }}>
          <strong>Account Deactivation:</strong> Temporarily disables your account. You can reactivate by contacting support.<br />
          <strong>Account Deletion:</strong> Permanently removes all your data. This action cannot be undone.
        </div>
      </div>
    </div>
  );
};

export default Profile;