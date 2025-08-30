import React, { useState } from 'react';
import { Calendar, PawPrint, Edit, Trash2, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import '../../css/dashboard/Bookings.css';

const Bookings = ({ 
  bookings, 
  error,  
  formatDate, 
  formatTime, 
  pets = [], 
  onRefreshBookings,
  onEditBooking
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  // Map API statusName to CSS classes
  const statusClassMap = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
    IN_PROGRESS: 'in-progress'
  };

  const getStatusClass = (statusName) => {
    return statusClassMap[statusName.toUpperCase()] || 'unknown-status';
  };

  // Helper functions
  const getPetName = (petId) => {
    const pet = pets.find(p => (p.petId || p.id) === petId);
    return pet ? pet.name : `Pet #${petId}`;
  };

  const formatPetNames = (petIds) => {
    if (!Array.isArray(petIds)) return getPetName(petIds);
    const names = petIds.map(id => getPetName(id));
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    if (names.length <= 4) return names.join(', ');
    return `${names.slice(0, 3).join(', ')} and ${names.length - 3} more`;
  };

  const canUpdateBooking = (statusName) => {
    const readOnlyStatuses = ['COMPLETED', 'CANCELLED', 'REJECTED'];
    return !readOnlyStatuses.includes(statusName.toUpperCase());
  };

  const canDeleteBooking = (statusName) => {
    const deletableStatuses = ['COMPLETED', 'CANCELLED'];
    return deletableStatuses.includes(statusName.toUpperCase());
  };

  const handleEditBooking = (booking) => {
    if (onEditBooking) onEditBooking(booking);
  };

  const handleDeleteClick = (booking, isGroup = false) => {
    // Add validation to ensure we have valid IDs
    if (isGroup) {
      if (!booking.bookingIds || booking.bookingIds.length === 0) {
        console.error('Cannot delete group booking: no booking IDs found');
        return;
      }
    } else {
      if (!booking.id) {
        console.error('Cannot delete booking: no booking ID found');
        return;
      }
    }
    
    setDeleteTarget({ booking, isGroup });
    setDeleteMessage('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteMessage('');

    try {
      const { booking, isGroup } = deleteTarget;

      if (isGroup) {
        // Handle grouped bookings
        if (!booking.bookingIds || booking.bookingIds.length === 0) {
          setDeleteMessage('Error: No booking IDs found for group deletion.');
          return;
        }
        
        const deletePromises = booking.bookingIds.map(id => apiService.deleteBooking(id));
        const results = await Promise.all(deletePromises);
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;

        setDeleteMessage(
          successCount === totalCount
            ? `Successfully deleted all ${totalCount} bookings for ${formatPetNames(booking.pets)}.`
            : `Partially successful: ${successCount}/${totalCount} bookings deleted for ${formatPetNames(booking.pets)}.`
        );
      } else {
        // Handle individual bookings - try different ID properties
        const bookingId = booking.id || booking.bookingId || booking.bookingNumber;
        if (!bookingId) {
          setDeleteMessage('Error: No valid booking ID found.');
          return;
        }
        
        const result = await apiService.deleteBooking(bookingId);
        setDeleteMessage(
          result.success
            ? `Successfully deleted booking for ${getPetName(booking.petId)}.`
            : result.message || 'Failed to delete booking.'
        );
      }

      if (onRefreshBookings) await onRefreshBookings();
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteMessage('Failed to delete booking. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const groupBookings = (bookings) => {
    const groups = {};
    bookings.forEach(booking => {
      // Try different possible ID property names
      const bookingId = booking.id || booking.bookingId || booking.bookingNumber;
      
      if (!bookingId) {
        console.error('No valid booking ID found in booking object:', booking);
        return; // Skip this booking
      }
      
      const key = `${booking.bookingDate}_${booking.startTime}_${booking.endTime}_${booking.specialRequests || 'none'}`;
      if (!groups[key]) {
        groups[key] = { 
          ...booking, 
          pets: [booking.petId], 
          bookingIds: [bookingId],
          id: bookingId  
        };
      } else {
        groups[key].pets.push(booking.petId);
        groups[key].bookingIds.push(bookingId); 
        delete groups[key].id;
      }
    });
    return Object.values(groups);
  };

  const groupedBookings = groupBookings(bookings);

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">My Bookings</h2>
        {bookings.length > 0 && (
          <div className="text-sm text-gray-600">
            {groupedBookings.length} booking session{groupedBookings.length !== 1 ? 's' : ''} 
            ({bookings.length} total pet{bookings.length !== 1 ? 's' : ''})
          </div>
        )}
      </div>

      {deleteMessage && (
        <div className={`mb-4 p-4 rounded-lg ${deleteMessage.includes('success') 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {deleteMessage}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="#dee2e6" />
          <p>{error ? 'Unable to load bookings due to server issues.' : 'No bookings found.'}</p>
        </div>
      ) : (
        <div className="bookings-list">
          {groupedBookings.map((booking, index) => {
            const isMultiPet = booking.pets.length > 1;
            const petNames = formatPetNames(booking.pets);
            const canUpdate = canUpdateBooking(booking.statusName);
            const canDelete = canDeleteBooking(booking.statusName);

            return (
              <div key={index} className="booking-detail-card">
                <div className="booking-detail-header">
                  <h4 className="booking-detail-title">
                    <span className="flex items-center gap-2">
                      <PawPrint size={16} className="text-blue-600" />
                      <span className="font-semibold">{petNames}</span>
                      {isMultiPet && <span className="text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded-full">{booking.pets.length} pets</span>}
                    </span>
                  </h4>

                  <div className="booking-header-right">
                    <span className={`booking-detail-status ${getStatusClass(booking.statusName)}`}>
                      {booking.statusName.charAt(0) + booking.statusName.slice(1).toLowerCase()}
                    </span>

                    <div className="booking-detail-actions">
                      {canUpdate && <button onClick={() => handleEditBooking(booking)} className="action-btn edit" title="Edit booking"><Edit size={16} /></button>}
                      {canDelete && <button onClick={() => handleDeleteClick(booking, isMultiPet)} className="action-btn delete" title="Delete booking"><Trash2 size={16} /></button>}
                    </div>
                  </div>
                </div>

                <div className="booking-detail-grid">
                  <div><strong>Date:</strong> {formatDate(booking.bookingDate)}</div>
                  <div><strong>Time:</strong> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</div>
                  <div><strong>Total Cost:</strong> ${booking.totalCost ? booking.totalCost.toFixed(2) : '0.00'}</div>
                  <div><strong>Pet{booking.pets.length > 1 ? 's' : ''}:</strong> {petNames}</div>
                </div>

                {booking.specialRequests && <div className="booking-special-requests"><strong>Special Requests:</strong> {booking.specialRequests}</div>}

                <div className="mt-3 flex gap-4 text-xs">
                  {canUpdate && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">Editable</span>}
                  {canDelete && <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded">Deletable</span>}
                  {!canUpdate && !canDelete && <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Read-only</span>}
                </div>

                {isMultiPet && <div className="mt-2 text-xs text-gray-400">Booking IDs: #{booking.bookingIds.join(', #')}</div>}
              </div>
            );
          })}
        </div>
      )}

      {showDeleteModal && deleteTarget && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-header">
              <AlertCircle className="delete-modal-icon" />
              <h3 className="delete-modal-title">Confirm Deletion</h3>
            </div>

            <div className="delete-modal-description">
              Are you sure you want to delete the booking for <strong>{formatPetNames(deleteTarget.isGroup ? deleteTarget.booking.pets : [deleteTarget.booking.petId])}</strong>? This action cannot be undone.
              {deleteTarget.isGroup && (
                <div className="delete-modal-warning">
                  <p className="delete-modal-warning-text">
                    This will permanently delete {deleteTarget.booking.bookingIds.length} individual bookings for: {formatPetNames(deleteTarget.booking.pets)}
                  </p>
                </div>
              )}
            </div>

            <div className="delete-modal-actions">
              <button type="button" onClick={() => {setShowDeleteModal(false); setDeleteTarget(null)}} disabled={isDeleting} className="delete-modal-btn cancel">Cancel</button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="delete-modal-btn confirm">
                {isDeleting ? <span className="flex items-center"><div className="delete-loading-spinner"></div> Deleting...</span> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
