import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PawPrint, MapPin, DollarSign, MessageSquare, Check, X, AlertCircle, User, Phone, Mail } from 'lucide-react';
import apiService from '../../services/apiService';
import '../../css/dashboard/SittingRequestPage.css';

const SittingRequests = ({ 
  user, 
  onRefreshBookings,
  formatDate, 
  formatTime,
  getPetTypeDisplay
}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [processingRequest, setProcessingRequest] = useState(null);
  const [petDetails, setPetDetails] = useState({});

  // Fetch pet details individually
  const fetchPetDetails = async (petIds) => {
    const newPetDetails = { ...petDetails };
    const missingPetIds = petIds.filter(id => !newPetDetails[id]);
    
    if (missingPetIds.length === 0) return;

    try {
      for (const petId of missingPetIds) {
        try {
          // Try to fetch individual pet details
          const response = await fetch(`http://localhost:8080/api/pets/${petId}`);
          if (response.ok) {
            const petData = await response.json();
            newPetDetails[petId] = petData;
          } else {
            // Fallback for missing pet data
            newPetDetails[petId] = { 
              id: petId,
              name: `Pet ${petId}`, 
              typeId: 1,
              breed: 'Unknown',
              age: 'Unknown'
            };
          }
        } catch (err) {
          console.warn(`Failed to fetch pet ${petId}:`, err);
          // Fallback for failed requests
          newPetDetails[petId] = { 
            id: petId,
            name: `Pet ${petId}`, 
            typeId: 1,
            breed: 'Unknown',
            age: 'Unknown'
          };
        }
      }

      setPetDetails(newPetDetails);
    } catch (err) {
      console.error('Error fetching pet details:', err);
    }
  };

  // Fetch available sitting requests
  const fetchSittingRequests = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get all pending bookings without a sitter
      const response = await apiService.getUpcomingBookings();
      
      if (response.success) {
        // Filter for requests that are pending and don't have a sitter
        const pendingRequests = response.data.filter(booking => 
          booking.statusName === 'PENDING' && (!booking.sitterId || booking.sitterId === null)
        );
        
        console.log('Pending requests found:', pendingRequests);
        setRequests(pendingRequests);
        
        // Fetch pet details for all pets in the requests
        const allPetIds = [...new Set(pendingRequests.map(r => r.petId))];
        if (allPetIds.length > 0) {
          await fetchPetDetails(allPetIds);
        }
      } else {
        setError('Failed to load sitting requests');
        setRequests([]);
      }
    } catch (err) {
      console.error('Error fetching sitting requests:', err);
      setError('Unable to load sitting requests. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.customerTypeId === 2 || user.customerTypeId === 3)) {
      fetchSittingRequests();
    }
  }, [user]);

  // Group requests by same time/date/owner
  const groupRequests = (requests) => {
    const groups = {};
    requests.forEach(request => {
      const key = `${request.bookingDate}_${request.startTime}_${request.endTime}_${request.ownerId}_${request.specialRequests || 'none'}`;
      if (!groups[key]) {
        groups[key] = { 
          ...request, 
          pets: [request.petId], 
          bookingIds: [request.id],
          // Properly format owner name
          ownerName: formatOwnerName(request.ownerFirstName, request.ownerLastName),
          ownerEmail: request.ownerEmail,
          ownerPhone: request.ownerPhoneNumber
        };
      } else {
        groups[key].pets.push(request.petId);
        groups[key].bookingIds.push(request.id);
      }
    });
    return Object.values(groups);
  };

  const handleAcceptRequest = async (request) => {
    setProcessingRequest(request.id || request.bookingIds?.[0]);
    setActionMessage('');

    try {
      const isGroupRequest = request.bookingIds && request.bookingIds.length > 1;

      if (isGroupRequest) {
        // Accept all bookings in the group
        const updatePromises = request.bookingIds.map(async (bookingId) => {
          // First assign sitter, then update status
          try {
            // Update the booking to assign this sitter
            const updateData = {
              sitterId: user.id,
              statusId: 2 // CONFIRMED
            };
            
            const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateData)
            });

            if (response.ok) {
              return { success: true };
            } else {
              const errorData = await response.json();
              return { success: false, message: errorData.message || 'Failed to accept booking' };
            }
          } catch (err) {
            console.error(`Error accepting booking ${bookingId}:`, err);
            return { success: false, message: 'Network error' };
          }
        });

        const results = await Promise.all(updatePromises);
        const successCount = results.filter(r => r.success).length;

        if (successCount === results.length) {
          setActionMessage(`Successfully accepted sitting request for ${request.pets.length} pets!`);
        } else {
          setActionMessage(`Partially successful: ${successCount}/${results.length} bookings accepted.`);
        }
      } else {
        // Accept single booking
        try {
          const updateData = {
            sitterId: user.id,
            statusId: 2 // CONFIRMED
          };
          
          const response = await fetch(`http://localhost:8080/api/bookings/${request.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
          });

          if (response.ok) {
            setActionMessage('Sitting request accepted successfully!');
          } else {
            const errorData = await response.json();
            setActionMessage(errorData.message || 'Failed to accept request');
          }
        } catch (err) {
          console.error('Error accepting request:', err);
          setActionMessage('Failed to accept request. Please try again.');
        }
      }

      // Refresh the requests list
      await fetchSittingRequests();
      if (onRefreshBookings) await onRefreshBookings();

    } catch (err) {
      console.error('Error accepting request:', err);
      setActionMessage('Failed to accept request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (request) => {
    setProcessingRequest(request.id || request.bookingIds?.[0]);
    setActionMessage('');

    try {
      const isGroupRequest = request.bookingIds && request.bookingIds.length > 1;

      if (isGroupRequest) {
        // Reject all bookings in the group
        const updatePromises = request.bookingIds.map(bookingId => 
          apiService.updateBookingStatus(bookingId, 6) // 6 = REJECTED
        );

        const results = await Promise.all(updatePromises);
        const successCount = results.filter(r => r.success).length;

        if (successCount === results.length) {
          setActionMessage(`Sitting request for ${request.pets.length} pets has been declined.`);
        } else {
          setActionMessage(`Partially successful: ${successCount}/${results.length} bookings declined.`);
        }
      } else {
        // Reject single booking
        const result = await apiService.updateBookingStatus(request.id, 6);
        
        if (result.success) {
          setActionMessage('Sitting request declined.');
        } else {
          setActionMessage(result.message || 'Failed to decline request');
        }
      }

      // Refresh the requests list
      await fetchSittingRequests();
      if (onRefreshBookings) await onRefreshBookings();

    } catch (err) {
      console.error('Error rejecting request:', err);
      setActionMessage('Failed to decline request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Helper functions
  const formatOwnerName = (firstName, lastName) => {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';
    
    if (first && last) {
      return `${first} ${last}`;
    } else if (first) {
      return first;
    } else if (last) {
      return last;
    }
    return 'Pet Owner'; // Better fallback than "Unknown Owner"
  }; 


  const formatPetCount = (pets) => {
    if (pets.length === 1) return `1 pet`;
    return `${pets.length} pets`;
  };

  const calculateDuration = (startTime, endTime) => {
    try {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      return hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : 'Invalid time range';
    } catch  {
      return 'Duration unknown';
    }
  };

  const groupedRequests = groupRequests(requests);

  return (
    <div className="sitting-requests-container">
      <div className="section-header">
        <h2 className="section-title">Available Sitting Requests</h2>
        <p className="section-subtitle">Browse and accept pet sitting opportunities</p>
        {groupedRequests.length > 0 && (
          <div className="text-sm text-gray-600">
            {groupedRequests.length} request{groupedRequests.length !== 1 ? 's' : ''} available
          </div>
        )}
      </div>

      {actionMessage && (
        <div className={`mb-4 p-4 rounded-lg ${actionMessage.includes('success') || actionMessage.includes('accepted')
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : actionMessage.includes('declined') || actionMessage.includes('Failed')
          ? 'bg-red-50 text-red-800 border border-red-200'
          : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading sitting requests...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <AlertCircle size={48} color="#ef4444" />
          <p>{error}</p>
          <button 
            onClick={fetchSittingRequests}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      ) : groupedRequests.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="#dee2e6" />
          <p>No sitting requests available at the moment.</p>
          <button 
            onClick={fetchSittingRequests}
            className="refresh-btn"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="requests-grid">
          {groupedRequests.map((request, index) => {
            const isMultiPet = request.pets.length > 1;
            const isProcessing = processingRequest === (request.id || request.bookingIds?.[0]);

            return (
              <div key={index} className="request-card">
                {/* Owner Information Header */}
                <div className="request-header">
                  <div className="request-owner-info">
                    <User size={20} className="text-blue-600" />
                    <div className="owner-details">
                      <h3 className="owner-name">{request.ownerName}</h3>
                      <div className="owner-contact-info">
                        {request.ownerEmail && (
                          <div className="contact-item">
                            <Mail size={14} />
                            <span>{request.ownerEmail}</span>
                          </div>
                        )}
                        {request.ownerPhone && (
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{request.ownerPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="request-pet-count">
                    <PawPrint size={16} className="text-green-600" />
                    <span>{formatPetCount(request.pets)}</span>
                  </div>
                </div>

                {/* Pet Details Section */}
                <div className="pets-section">
                  <h4 className="pets-title">
                    <PawPrint size={16} />
                    Pet{request.pets.length > 1 ? 's' : ''} to Care For:
                  </h4>
                  <div className="pets-list">
                    {request.pets.map((petId) => {
                      const pet = petDetails[petId];
                      return (
                        <div key={petId} className="pet-item">
                          <div className="pet-main-info">
                            <span className="pet-name">
                              {pet?.name || `Pet #${petId}`}
                            </span>
                            <span className="pet-type">
                              ({pet?.typeId ? getPetTypeDisplay(pet.typeId) : 'Pet'})
                            </span>
                          </div>
                          {pet && (pet.breed || pet.age) && (
                            <div className="pet-additional-info">
                              {pet.breed && pet.breed !== 'Unknown' && (
                                <span className="pet-breed">{pet.breed}</span>
                              )}
                              {pet.age && pet.age !== 'Unknown' && (
                                <span className="pet-age">{pet.age} years old</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="request-details">
                  <div className="detail-row">
                    <Calendar size={16} />
                    <span className="detail-value">{formatDate(request.bookingDate)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <Clock size={16} />
                    <span className="detail-value">
                      {formatTime(request.startTime)} - {formatTime(request.endTime)}
                      <span className="duration">({calculateDuration(request.startTime, request.endTime)})</span>
                    </span>
                  </div>

                  {request.location && (
                    <div className="detail-row">
                      <MapPin size={16} />
                      <span className="detail-value location">{request.location}</span>
                    </div>
                  )}

                  {request.totalCost && (
                    <div className="detail-row">
                      <DollarSign size={16} />
                      <span className="detail-value cost">${parseFloat(request.totalCost).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Special Requests */}
                {request.specialRequests && (
                  <div className="special-requests">
                    <MessageSquare size={16} />
                    <div>
                      <strong>Special Instructions:</strong>
                      <p>{request.specialRequests}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="request-actions">
                  <button
                    onClick={() => handleRejectRequest(request)}
                    disabled={isProcessing}
                    className="action-btn decline"
                  >
                    <X size={16} />
                    Decline
                  </button>
                  
                  <button
                    onClick={() => handleAcceptRequest(request)}
                    disabled={isProcessing}
                    className="action-btn accept"
                  >
                    {isProcessing ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Accept Request
                      </>
                    )}
                  </button>
                </div>

                {/* Multi-pet indicator */}
                {isMultiPet && (
                  <div className="multi-pet-indicator">
                    <span>Group booking: {request.bookingIds.length} individual bookings</span>
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

export default SittingRequests;