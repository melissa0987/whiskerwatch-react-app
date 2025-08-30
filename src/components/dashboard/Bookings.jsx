import React from 'react';
import { Calendar, PawPrint } from 'lucide-react';

const Bookings = ({ bookings, error, getBookingStatusDisplay, formatDate, formatTime, pets = [] }) => {
  const getStatusClass = (statusId) => {
    switch (statusId) {
      case 2: return 'confirmed';
      case 1: return 'pending';
      default: return 'cancelled';
    }
  };

  // Helper function to get pet name by ID
  const getPetName = (petId) => {
    const pet = pets.find(p => (p.petId || p.id) === petId);
    return pet ? pet.name : `Pet #${petId}`;
  };

  // Group bookings by date, time, and location (same booking session)
  const groupBookings = (bookings) => {
    const groups = {};
    
    bookings.forEach(booking => {
      // Create a key based on date, start time, end time, and special requests
      // This helps identify bookings that were created together
      const key = `${booking.bookingDate}_${booking.startTime}_${booking.endTime}_${booking.specialRequests || 'none'}`;
      
      if (!groups[key]) {
        groups[key] = {
          ...booking,
          pets: [booking.petId],
          bookingIds: [booking.id]
        };
      } else {
        // If we find another booking with same date/time/requests, it's likely part of the same group
        groups[key].pets.push(booking.petId);
        groups[key].bookingIds.push(booking.id);
      }
    });
    
    return Object.values(groups);
  };

  const groupedBookings = groupBookings(bookings);

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">My Bookings</h2>
        <div className="text-sm text-gray-600">
          {bookings.length > 0 && (
            <span>
              {groupedBookings.length} booking session{groupedBookings.length !== 1 ? 's' : ''} 
              ({bookings.length} total pet{bookings.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>
      
      {bookings.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="#dee2e6" />
          <p>
            {error ? 'Unable to load bookings due to server connection issues.' : 'No bookings found.'}
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {groupedBookings.map((booking, index) => {
            const isMultiPet = booking.pets.length > 1;
            
            return (
              <div key={`group-${index}`} className="booking-detail-card">
                <div className="booking-detail-header">
                  <h4 className="booking-detail-title">
                    {isMultiPet ? (
                      <span className="flex items-center gap-2">
                        <PawPrint size={16} />
                        Multi-Pet Booking #{booking.bookingIds.join(', #')}
                        <span className="text-sm font-normal text-gray-600">
                          ({booking.pets.length} pets)
                        </span>
                      </span>
                    ) : (
                      `Booking #${booking.id}`
                    )}
                  </h4>
                  <span className={`booking-detail-status ${getStatusClass(booking.statusId)}`}>
                    {getBookingStatusDisplay(booking.statusId)}
                  </span>
                </div>
                
                {/* Pet Information */}
                {isMultiPet && (
                  <div className="booking-pets-info" style={{ 
                    marginBottom: '12px', 
                    padding: '8px 12px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    <strong>Pets: </strong>
                    {booking.pets.map(petId => getPetName(petId)).join(', ')}
                  </div>
                )}
                
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
                  {!isMultiPet && (
                    <div>
                      <strong>Pet:</strong> {getPetName(booking.petId)}
                    </div>
                  )}
                </div>
                
                {booking.specialRequests && (
                  <div className="booking-special-requests">
                    <strong>Special Requests:</strong> {booking.specialRequests}
                  </div>
                )}
                
                {/* Show individual booking IDs for multi-pet bookings */}
                {isMultiPet && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '12px', 
                    color: '#6c757d' 
                  }}>
                    Individual booking IDs: #{booking.bookingIds.join(', #')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;