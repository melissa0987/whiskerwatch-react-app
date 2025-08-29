import React from 'react';
import { Calendar } from 'lucide-react';

const Bookings = ({ bookings, error, getBookingStatusDisplay, formatDate, formatTime }) => {
  const getStatusClass = (statusId) => {
    switch (statusId) {
      case 2: return 'confirmed';
      case 1: return 'pending';
      default: return 'cancelled';
    }
  };

  return (
    <div>
      <h2 className="section-title">My Bookings</h2>
      
      {bookings.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="#dee2e6" />
          <p>
            {error ? 'Unable to load bookings due to server connection issues.' : 'No bookings found.'}
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-detail-card">
              <div className="booking-detail-header">
                <h4 className="booking-detail-title">
                  Booking #{booking.id}
                </h4>
                <span className={`booking-detail-status ${getStatusClass(booking.statusId)}`}>
                  {getBookingStatusDisplay(booking.statusId)}
                </span>
              </div>
              
              <div className="booking-detail-grid">
                <div>
                  <strong>Date:</strong> {formatDate(booking.bookingDate)}
                </div>
                <div>
                  <strong>Time:</strong> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </div>
                <div>
                  <strong>Total Cost:</strong> ${booking.totalCost ? booking.totalCost.toFixed(2) : '0.00'}
                </div>
              </div>
              
              {booking.specialRequests && (
                <div className="booking-special-requests">
                  <strong>Special Requests:</strong> {booking.specialRequests}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;