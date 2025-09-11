import React from 'react';
import { Users, PawPrint, Calendar, TrendingUp, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import '../../css/admin/AdminOverview.css';

const AdminOverview = ({ dashboardData, loading }) => {
  const { stats, bookings, users } = dashboardData;

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Recent activity data
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentUsers = users
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return <Clock size={16} className="text-yellow-500" />;
      case 'CONFIRMED': return <CheckCircle size={16} className="text-blue-500" />;
      case 'IN_PROGRESS': return <TrendingUp size={16} className="text-orange-500" />;
      case 'COMPLETED': return <CheckCircle size={16} className="text-green-500" />;
      case 'CANCELLED': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="admin-overview">
      <h2 className="admin-page-title">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card primary">
          <div className="stat-icon">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-details">
              <span className="stat-detail">
                <UserCheck size={14} /> {stats.activeUsers} active
              </span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card success">
          <div className="stat-icon">
            <PawPrint size={32} />
          </div>
          <div className="stat-content">
            <h3>Total Pets</h3>
            <div className="stat-number">{stats.totalPets}</div>
            <div className="stat-details">
              <span className="stat-detail">Across all owners</span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card warning">
          <div className="stat-icon">
            <Calendar size={32} />
          </div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <div className="stat-number">{stats.totalBookings}</div>
            <div className="stat-details">
              <span className="stat-detail">
                <Clock size={14} /> {stats.pendingBookings} pending
              </span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card info">
          <div className="stat-icon">
            <CheckCircle size={32} />
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <div className="stat-number">{stats.completedBookings}</div>
            <div className="stat-details">
              <span className="stat-detail">Successful bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="admin-secondary-stats">
        <div className="secondary-stat">
          <span className="secondary-stat-label">Pet Owners:</span>
          <span className="secondary-stat-value">{stats.owners || 0}</span>
        </div>
        <div className="secondary-stat">
          <span className="secondary-stat-label">Pet Sitters:</span>
          <span className="secondary-stat-value">{stats.sitters || 0}</span>
        </div>
        <div className="secondary-stat">
          <span className="secondary-stat-label">In Progress:</span>
          <span className="secondary-stat-value">{stats.inProgressBookings || 0}</span>
        </div>
        <div className="secondary-stat">
          <span className="secondary-stat-label">Cancelled:</span>
          <span className="secondary-stat-value">{stats.cancelledBookings || 0}</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-recent-activity">
        <div className="activity-section">
          <h3 className="activity-title">Recent Bookings</h3>
          <div className="activity-list">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {getStatusIcon(booking.statusName)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <span className="activity-title-text">
                        {booking.petName || `Pet #${booking.petId}`}
                      </span>
                      <span className="activity-status">
                        {booking.statusName || 'Unknown'}
                      </span>
                    </div>
                    <div className="activity-details">
                      <span>{formatDate(booking.bookingDate)}</span>
                      <span>{booking.ownerName || 'Unknown Owner'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">No recent bookings</div>
            )}
          </div>
        </div>

        <div className="activity-section">
          <h3 className="activity-title">Recent Users</h3>
          <div className="activity-list">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <Users size={16} className="text-blue-500" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <span className="activity-title-text">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className={`activity-status ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="activity-details">
                      <span>{user.email}</span>
                      <span>{user.customerTypeName || 'Unknown Type'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">No recent users</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => window.location.reload()}>
            <TrendingUp size={20} />
            Refresh Data
          </button>
          <button className="quick-action-btn" onClick={() => console.log('Export data functionality')}>
            <CheckCircle size={20} />
            Export Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;