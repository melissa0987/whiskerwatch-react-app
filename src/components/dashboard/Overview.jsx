import React from 'react';
import '../../css/Dashboard.css'; 

const Overview = ({ 
    user, 
    pets, 
    bookings, 
    getCustomerTypeDisplay,  
    formatDate, 
    formatTime,  
  }) => { 
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
          <div className="recent-bookings-grid">
            {bookings.slice(0, 3).map((booking, index) => {
              const petArray = Array.isArray(booking.petId) ? booking.petId : [booking.petId];
              const petNames = petArray
                .map(id => {
                  const pet = pets.find(p => (p.petId || p.id) === id);
                  return pet ? pet.name : `Pet #${id}`;
                })
                .join(', ');

              const statusClassMap = {
                PENDING: 'pending',
                CONFIRMED: 'confirmed',
                COMPLETED: 'completed',
                CANCELLED: 'cancelled',
                REJECTED: 'rejected',
                IN_PROGRESS: 'in-progress'
              };
              const statusClass = statusClassMap[booking.statusName?.toUpperCase()] || 'unknown-status';

              return (
                <div key={index} className="booking-card">
                  <div className="booking-card-header">
                    <span className="booking-date">
                      {formatDate(booking.bookingDate)} at {formatTime(booking.startTime)}
                    </span>
                    <span className={`booking-status ${statusClass}`}>
                      {booking.statusName
                        ? booking.statusName.charAt(0) + booking.statusName.slice(1).toLowerCase()
                        : 'Unknown'}
                    </span>
                  </div>

                  <div className="booking-details">
                    <div className="booking-info-row">
                      <strong>Pet{petArray.length > 1 ? 's' : ''}:</strong> {petNames}
                    </div>
                    {booking.ownerName && (
                      <div className="booking-info-row">
                        <strong>Owner:</strong> {booking.ownerName}
                      </div>
                    )}
                    {booking.sitterName && (
                      <div className="booking-info-row">
                        <strong>Sitter:</strong> {booking.sitterName}
                      </div>
                    )}
                    {booking.endTime && (
                      <div className="booking-info-row">
                        <strong>Duration:</strong> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                    )}
                    {booking.specialRequests && (
                      <div className="booking-info-row">
                        <strong>Special Requests:</strong> {booking.specialRequests}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {bookings.length > 3 && (
            <p className="view-all-bookings">
              ... and {bookings.length - 3} more booking{bookings.length - 3 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}


      {/* No bookings message */}
      {bookings.length === 0 && (
        <div className="no-bookings-message">
          <h3>No Bookings Yet</h3>
          <p>
            {user.customerTypeId === 1 && "Start by adding your pets and then request a sitting service!"}
            {user.customerTypeId === 2 && "Browse available sitting requests to start earning!"}
            {user.customerTypeId === 3 && "Add your pets to request sitting services, or browse requests to offer your sitting services!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Overview;