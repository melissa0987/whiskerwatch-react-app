import React from 'react';
import '../../css/Dashboard.css'; 

const Overview = ({ user, pets, bookings, getCustomerTypeDisplay, getBookingStatusDisplay, formatDate, formatTime }) => {
  return (
    <div className="overview-container">
      <h2 className="section-title">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        {(user.customerTypeId === 1 || user.customerTypeId === 3) && (
          <div className="stats-card pets">
            <h3>My Pets</h3>
            <p>{pets.length}</p>
          </div>
        )}
        <div className="stats-card bookings">
          <h3>Total Bookings</h3>
          <p>{bookings.length}</p>
        </div>
        <div className="stats-card account">
          <h3>Account Type</h3>
          <p>
            {user.customerTypeId === 3 
              ? "Owner, Sitter" 
              : getCustomerTypeDisplay(user.customerTypeId)
            }
          </p>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="overview-welcome-message">
        <h3>Welcome to Whisker Watch!</h3>
        <p>
          {user.customerTypeId === 1 && "As a pet owner, you can manage your pets and book trusted sitters for them."}
          {user.customerTypeId === 2 && "As a pet sitter, you can view and manage your booking requests from pet owners."}
          {user.customerTypeId === 3 && "You have both owner and sitter privileges - manage your pets and provide sitting services to other owners."}
        </p>
      </div>

      {/* Recent Activity */}
      {bookings.length > 0 && (
        <div className="recent-bookings">
          <h3>Recent Bookings</h3>
          {bookings.slice(0, 3).map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <span>
                  {formatDate(booking.bookingDate)} at {formatTime(booking.startTime)}
                </span>
                <span className={`booking-status ${booking.statusId === 2 ? 'confirmed' : 'pending'}`}>
                  {getBookingStatusDisplay(booking.statusId)}
                </span>
              </div>
              {booking.specialRequests && (
                <p>{booking.specialRequests}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Overview;