import React, { useState, useMemo } from 'react';
import { Calendar, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Eye, Edit, Trash2, User, PawPrint, DollarSign } from 'lucide-react';
import '../../css/admin/AdminBookings.css';
import apiService from '../../services/apiService';

const AdminBookings = ({ dashboardData, loading, refreshData }) => {
  const { bookings } = dashboardData;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.sitterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.sitterEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.specialRequests?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => {
        switch (filterStatus) {
          case 'pending': return booking.statusName === 'PENDING';
          case 'confirmed': return booking.statusName === 'CONFIRMED';
          case 'in-progress': return booking.statusName === 'IN_PROGRESS';
          case 'completed': return booking.statusName === 'COMPLETED';
          case 'cancelled': return booking.statusName === 'CANCELLED';
          case 'rejected': return booking.statusName === 'REJECTED';
          default: return true;
        }
      });
    }

    // Apply date filter
    if (filterDate !== 'all') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      filtered = filtered.filter(booking => {
        const bookingDate = booking.bookingDate;
        switch (filterDate) {
          case 'today': return bookingDate === todayStr;
          case 'upcoming': return bookingDate >= todayStr;
          case 'past': return bookingDate < todayStr;
          case 'this-week': {
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return bookingDate >= todayStr && bookingDate <= weekFromNow.toISOString().split('T')[0];
          }
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'bookingDate') {
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
  }, [bookings, searchTerm, filterStatus, filterDate, sortBy, sortOrder]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString?.slice(0, 5) || 'N/A';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return <Clock size={16} className="text-yellow-500" />;
      case 'CONFIRMED': return <CheckCircle size={16} className="text-blue-500" />;
      case 'IN_PROGRESS': return <TrendingUp size={16} className="text-orange-500" />;
      case 'COMPLETED': return <CheckCircle size={16} className="text-green-500" />;
      case 'CANCELLED': return <XCircle size={16} className="text-red-500" />;
      case 'REJECTED': return <XCircle size={16} className="text-gray-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleDeleteBooking = async (bookingId, petName) => {
    if (!window.confirm(`Are you sure you want to delete the booking for "${petName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`Deleting booking ${bookingId}`);

      await apiService.deleteBookingAsAdmin(bookingId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatusId) => {
    try {
      console.log(`Updating booking ${bookingId} status to ${newStatusId}`);

      await apiService.updateBookingStatus(bookingId, newStatusId);
      await refreshData();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="admin-bookings">
      <div className="admin-page-header">
        <h2 className="admin-page-title">
          <Calendar size={24} />
          Bookings Management
        </h2>
        <div className="admin-page-stats">
          <span className="stat-item">Total: {bookings.length}</span>
          <span className="stat-item">Pending: {bookings.filter(b => b.statusName === 'PENDING').length}</span>
          <span className="stat-item">Filtered: {filteredBookings.length}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-controls">
        <div className="search-control">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search bookings by pet, owner, sitter, or requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <Calendar size={16} />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          <div className="sort-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Date Created</option>
              <option value="bookingDate">Booking Date</option>
              <option value="petName">Pet Name</option>
              <option value="ownerName">Owner Name</option>
              <option value="statusName">Status</option>
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

      {/* Bookings Table */}
      <div className="admin-table-container">
        <table className="admin-table bookings-table">
          <thead>
            <tr>
              <th>Booking Details</th>
              <th>Participants</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.bookingId} onClick={() => handleBookingClick(booking)} className="clickable-row">
                <td>
                  <div className="booking-details">
                    <div className="booking-id">#{booking.bookingId}</div>
                    <div className="pet-info">
                      <PawPrint size={14} />
                      <strong>{booking.petName || `Pet #${booking.petId}`}</strong>
                    </div>
                    <div className="booking-type">{booking.petTypeName}</div>
                  </div>
                </td>
                <td>
                  <div className="participants">
                    <div className="participant owner">
                      <User size={14} />
                      <span className="participant-name">{booking.ownerName || 'Unknown Owner'}</span>
                      <span className="participant-email">{booking.ownerEmail}</span>
                    </div>
                    {booking.sitterName && (
                      <div className="participant sitter">
                        <User size={14} />
                        <span className="participant-name">{booking.sitterName}</span>
                        <span className="participant-email">{booking.sitterEmail}</span>
                      </div>
                    )}
                    {!booking.sitterName && (
                      <div className="no-sitter">No sitter assigned</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="schedule">
                    <div className="schedule-date">
                      <Calendar size={14} />
                      {formatDate(booking.bookingDate)}
                    </div>
                    <div className="schedule-time">
                      <Clock size={14} />
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge booking-status ${booking.statusName?.toLowerCase()}`}>
                    {getStatusIcon(booking.statusName)}
                    {booking.statusName || 'Unknown'}
                  </span>
                </td>
                <td>
                  <div className="cost-info">
                    {booking.totalCost ? (
                      <>
                        <DollarSign size={14} />
                        <span className="cost-amount">${booking.totalCost.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="no-cost">Not set</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleBookingClick(booking)}
                      className="action-btn view"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(booking.bookingId, booking.petName)}
                      className="action-btn delete"
                      title="Delete booking"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="no-results">
            <Calendar size={48} />
            <h3>No bookings found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details #{selectedBooking.bookingId}</h3>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="booking-detail-grid">
                <div className="detail-section">
                  <h4>Pet Information</h4>
                  <div className="detail-item">
                    <strong>Pet:</strong> {selectedBooking.petName || `Pet #${selectedBooking.petId}`}
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong> {selectedBooking.petTypeName || 'Unknown'}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Schedule</h4>
                  <div className="detail-item">
                    <strong>Date:</strong> {formatDate(selectedBooking.bookingDate)}
                  </div>
                  <div className="detail-item">
                    <strong>Start Time:</strong> {formatTime(selectedBooking.startTime)}
                  </div>
                  <div className="detail-item">
                    <strong>End Time:</strong> {formatTime(selectedBooking.endTime)}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> 
                    <span className={`status-badge ${selectedBooking.statusName?.toLowerCase()}`}>
                      {getStatusIcon(selectedBooking.statusName)}
                      {selectedBooking.statusName || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Owner Information</h4>
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedBooking.ownerName || 'Unknown'}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedBooking.ownerEmail || 'Not available'}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Sitter Information</h4>
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedBooking.sitterName || 'No sitter assigned'}
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong> {selectedBooking.sitterEmail || 'Not available'}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Financial</h4>
                  <div className="detail-item">
                    <strong>Total Cost:</strong> {selectedBooking.totalCost ? `${selectedBooking.totalCost.toFixed(2)}` : 'Not set'}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Timestamps</h4>
                  <div className="detail-item">
                    <strong>Created:</strong> {formatDate(selectedBooking.createdAt)}
                  </div>
                  <div className="detail-item">
                    <strong>Updated:</strong> {formatDate(selectedBooking.updatedAt)}
                  </div>
                </div>

                {selectedBooking.specialRequests && (
                  <div className="detail-section full-width">
                    <h4>Special Requests</h4>
                    <div className="special-requests-content">
                      {selectedBooking.specialRequests}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              <div className="admin-actions">
                <h4>Admin Actions</h4>
                <div className="status-update-controls">
                  <label>Update Status:</label>
                  <select
                    value={selectedBooking.statusName || ''}
                    onChange={(e) => {
                      const statusMap = {
                        'PENDING': 1,
                        'CONFIRMED': 2,
                        'IN_PROGRESS': 3,
                        'COMPLETED': 4,
                        'CANCELLED': 5,
                        'REJECTED': 6
                      };
                      handleUpdateBookingStatus(selectedBooking.bookingId, statusMap[e.target.value]);
                    }}
                    className="status-select"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;