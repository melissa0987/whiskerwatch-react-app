import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PawPrint, MapPin, DollarSign, MessageSquare, Check, X, AlertCircle, User, Phone, Mail } from 'lucide-react';
import apiService from '../../services/apiService';
import '../../css/dashboard/SitterView.css';


const SitterView = ({ 
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

  // ðŸ”¹ Fetch pet details
    const fetchPetDetails = async (petIds) => {
    const newPetDetails = { ...petDetails };
    const missingPetIds = petIds.filter(id => !newPetDetails[id]);
    if (missingPetIds.length === 0) return;

    try {
        await Promise.all(missingPetIds.map(async (petId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/pets/${petId}`);
            if (response.ok) {
            newPetDetails[petId] = await response.json();
            } else {
            newPetDetails[petId] = { id: petId, name: `Pet ${petId}`, typeId: 1, breed: 'Unknown', age: 'Unknown' };
            }
        } catch {
            newPetDetails[petId] = { id: petId, name: `Pet ${petId}`, typeId: 1, breed: 'Unknown', age: 'Unknown' };
        }
        }));
        setPetDetails(newPetDetails);
    } catch (err) {
        console.error('Error fetching pet details:', err);
    }
    };


  // ðŸ”¹ Fetch available sitting requests (only pending w/o sitter)
  const fetchSittingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getUpcomingBookings();
      if (response.success) {
        const pendingRequests = response.data.filter(
          booking => booking.statusName === 'PENDING' && (!booking.sitterId || booking.sitterId === null)
        );
        setRequests(pendingRequests);
        const allPetIds = [...new Set(pendingRequests.map(r => r.petId))];
        if (allPetIds.length > 0) await fetchPetDetails(allPetIds);
      } else {
        setError('Failed to load sitting requests');
        setRequests([]);
      }
    } catch (err) {
      setError('Unable to load sitting requests.', err);
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

  //  Accept & Reject Handlers
  const handleAcceptRequest = async (request) => {
    setProcessingRequest(request.id);
    setActionMessage('');
    try {
      const updateData = { sitterId: user.id, statusId: 2 }; // CONFIRMED
      const response = await fetch(`http://localhost:8080/api/bookings/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (response.ok) {
        setActionMessage('Request accepted!');
        await fetchSittingRequests();
        if (onRefreshBookings) await onRefreshBookings();
      } else {
        setActionMessage('Failed to accept request.');
      }
    } catch {
      setActionMessage('Network error.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (request) => {
    setProcessingRequest(request.id);
    try {
      const result = await apiService.updateBookingStatus(request.id, 6); // REJECTED
      setActionMessage(result.success ? 'Request declined.' : 'Failed to decline request.');
      await fetchSittingRequests();
      if (onRefreshBookings) await onRefreshBookings();
    } catch {
      setActionMessage('Error rejecting request.');
    } finally {
      setProcessingRequest(null);
    }
  };

  //  Helper: Format
  const formatOwnerName = (firstName, lastName) => {
    return (firstName || '') + ' ' + (lastName || '') || 'Pet Owner';
  };

  return (
    <div className="sitting-requests-container">
      <h2>Available Sitting Requests</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && requests.length === 0 && <p>No requests right now.</p>}
      <div className="requests-grid">
        {requests.map((request) => {
          const isProcessing = processingRequest === request.id;
          const pet = petDetails[request.petId];
          return (
            <div key={request.id} className="request-card">
              <h3>{formatOwnerName(request.ownerFirstName, request.ownerLastName)}</h3>
              <p>{formatDate(request.bookingDate)} | {formatTime(request.startTime)} - {formatTime(request.endTime)}</p>
              {pet && <p>Pet: {pet.name} ({getPetTypeDisplay(pet.typeId)})</p>}
              <div className="actions">
                <button onClick={() => handleRejectRequest(request)} disabled={isProcessing}>Decline</button>
                <button onClick={() => handleAcceptRequest(request)} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Accept'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SitterView;