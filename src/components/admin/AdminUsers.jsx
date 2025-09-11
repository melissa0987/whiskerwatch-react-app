import React, { useState, useMemo } from 'react';
import { Users, Search, Filter, Edit, Trash2, UserCheck, UserX, Mail, Phone, MapPin } from 'lucide-react';
import '../../css/admin/AdminUsers.css';
import apiService from '../../services/apiService';

const AdminUsers = ({ dashboardData, loading, refreshData }) => {
  const { users } = dashboardData;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(user => {
        switch (filterType) {
          case 'owners': return user.customerTypeName === 'OWNER';
          case 'sitters': return user.customerTypeName === 'SITTER';
          case 'active': return user.isActive === true;
          case 'inactive': return user.isActive === false;
          case 'admins': return user.roleName === 'ADMIN';
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [users, searchTerm, filterType, sortBy, sortOrder]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      console.log(`Toggling user ${userId} status from ${currentStatus}`);

      await apiService.updateUserStatus(userId, !currentStatus);
      await refreshData();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`Deleting user ${userId}`);
      // Implement user deletion API call
      await apiService.deleteUserAsAdmin(userId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-page-header">
        <h2 className="admin-page-title">
          <Users size={24} />
          Users Management
        </h2>
        <div className="admin-page-stats">
          <span className="stat-item">Total: {users.length}</span>
          <span className="stat-item">Active: {users.filter(u => u.isActive).length}</span>
          <span className="stat-item">Filtered: {filteredUsers.length}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-controls">
        <div className="search-control">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="owners">Pet Owners</option>
              <option value="sitters">Pet Sitters</option>
              <option value="admins">Administrators</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>

          <div className="sort-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Date Created</option>
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
              <option value="email">Email</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-toggle"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.userId} onClick={() => handleUserClick(user)} className="clickable-row">
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.firstName} {user.lastName}</div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div className="contact-item">
                      <Mail size={14} />
                      {user.email}
                    </div>
                    {user.phoneNumber && (
                      <div className="contact-item">
                        <Phone size={14} />
                        {user.phoneNumber}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="user-type">
                    <span className={`type-badge ${user.roleName?.toLowerCase()}`}>
                      {user.roleName}
                    </span>
                    {user.customerTypeName && (
                      <span className={`customer-type ${user.customerTypeName.toLowerCase()}`}>
                        {user.customerTypeName}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? (
                      <>
                        <UserCheck size={14} />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX size={14} />
                        Inactive
                      </>
                    )}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleUserStatus(user.userId, user.isActive)}
                      className={`action-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                      title={user.isActive ? 'Deactivate user' : 'Activate user'}
                    >
                      {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.userId, `${user.firstName} ${user.lastName}`)}
                      className="action-btn delete"
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <Users size={48} />
            <h3>No users found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="user-detail-grid">
                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <div className="detail-item">
                    <strong>Username:</strong> @{selectedUser.username}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedUser.email}
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong> {selectedUser.phoneNumber || 'Not provided'}
                  </div>
                  <div className="detail-item">
                    <strong>Address:</strong> {selectedUser.address || 'Not provided'}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Account Information</h4>
                  <div className="detail-item">
                    <strong>Role:</strong> 
                    <span className={`type-badge ${selectedUser.roleName?.toLowerCase()}`}>
                      {selectedUser.roleName}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Customer Type:</strong> 
                    <span className={`customer-type ${selectedUser.customerTypeName?.toLowerCase()}`}>
                      {selectedUser.customerTypeName || 'Not specified'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> 
                    <span className={`status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Created:</strong> {formatDate(selectedUser.createdAt)}
                  </div>
                  <div className="detail-item">
                    <strong>Updated:</strong> {formatDate(selectedUser.updatedAt)}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Statistics</h4>
                  <div className="detail-item">
                    <strong>Owned Pets:</strong> {selectedUser.ownedPetsCount || 0}
                  </div>
                  <div className="detail-item">
                    <strong>Owner Bookings:</strong> {selectedUser.ownerBookingsCount || 0}
                  </div>
                  <div className="detail-item">
                    <strong>Sitter Bookings:</strong> {selectedUser.sitterBookingsCount || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;