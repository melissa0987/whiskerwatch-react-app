import React, { useState } from 'react';
import { Calendar, PawPrint, Edit, Trash2, AlertCircle, Send, X, Plus } from 'lucide-react';
import apiService from '../../services/apiService';
import OwnerView from './OwnerView';
import '../../css/dashboard/Bookings.css';

const Bookings = ({ 
  bookings = [], 
  error,  
  formatDate, 
  formatTime, 
  pets = [], 
  refreshData,
  user
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  
  // Edit modal states
  const [editingRequest, setEditingRequest] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  // Create request modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Default format functions if not provided
  const safeFormatDate = formatDate || ((date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  });
  
  const safeFormatTime = formatTime || ((time) => {
    if (!time) return 'N/A';
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return time?.slice(0, 5) || 'N/A';
    }
  });

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
    if (!statusName) return 'unknown-status';
    return statusClassMap[statusName.toUpperCase()] || 'unknown-status';
  };

  // Helper functions
  const getPetName = (petId) => {
    if (!petId || !pets || !Array.isArray(pets)) return `Pet #${petId || 'Unknown'}`;
    const pet = pets.find(p => (p.petId || p.id) === petId);
    return pet ? pet.name : `Pet #${petId}`;
  };

  const formatPetNames = (petIds) => {
    if (!petIds) return 'Unknown Pet';
    if (!Array.isArray(petIds)) return getPetName(petIds);
    
    const names = petIds.map(id => getPetName(id));
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    if (names.length <= 4) return names.join(', ');
    return `${names.slice(0, 3).join(', ')} and ${names.length - 3} more`;
  };

  // Updated permission logic - owners can edit/delete PENDING, COMPLETED, and CANCELLED bookings
  const canEditBooking = (statusName) => {
    if (!statusName) return false;
    const editableStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    return editableStatuses.includes(statusName.toUpperCase());
  };

  const canDeleteBooking = (statusName) => {
    if (!statusName) return false;
    const deletableStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    return deletableStatuses.includes(statusName.toUpperCase());
  };

  // Create new request functionality
  const handleCreateRequest = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    setDeleteMessage('New sitting request created successfully!');
    if (refreshData) await refreshData();
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  // Edit functionality
  const handleEditBooking = (booking) => {
    if (!booking) return;
    
    setEditingRequest(booking);
    setEditFormData({
      bookingDate: booking.bookingDate || '',
      startTime: booking.startTime?.slice(0, 5) || '09:00',
      endTime: booking.endTime?.slice(0, 5) || '17:00',
      specialRequests: booking.specialRequests || '',
      totalCost: booking.totalCost || ''
    });
    setEditErrors({});
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.bookingDate) errors.bookingDate = 'Date is required.';
    if (!editFormData.startTime) errors.startTime = 'Start time is required.';
    if (!editFormData.endTime) errors.endTime = 'End time is required.';
    
    // Check if end time is after start time
    if (editFormData.startTime && editFormData.endTime && editFormData.startTime >= editFormData.endTime) {
      errors.timeRange = 'End time must be after start time.';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm() || !editingRequest) return;

    setUpdating(true);
    try {
     
      const updateData = {
        bookingDate: editFormData.bookingDate,
        startTime: `${editFormData.startTime}:00`,
        endTime: `${editFormData.endTime}:00`,
        statusId: editingRequest.statusId || 1,
        totalCost: editFormData.totalCost ? parseFloat(editFormData.totalCost) : null,
        specialRequests: editFormData.specialRequests || null,
        petId: editingRequest.petId,
        ownerId: user.id, // 
        sitterId: editingRequest.sitterId || null 
      };

      console.log('Updating booking with data:', updateData);
      
      const response = await apiService.updateBooking(editingRequest.bookingId || editingRequest.id, updateData);

      if (response.success) {
        setEditingRequest(null);
        setDeleteMessage('Booking updated successfully!');
        if (refreshData) await refreshData();
      } else {
        setEditErrors({ submit: response.message || 'Failed to update the booking.' });
      }
    } catch (err) {
      console.error('Edit booking error:', err);
      setEditErrors({ submit: 'Error updating the booking.' });
    } finally {
      setUpdating(false);
    }
  };

  const closeEditModal = () => {
    setEditingRequest(null);
    setEditFormData({});
    setEditErrors({});
  };

  const handleDeleteClick = (booking, isGroup = false) => {
    if (!booking) return;
    
    
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

      if (refreshData) await refreshData();
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
    if (!bookings || !Array.isArray(bookings)) return [];
    
    const groups = {};
    bookings.forEach(booking => {
      if (!booking) return;
      
      
      const bookingId = booking.id || booking.bookingId || booking.bookingNumber;
      
      if (!bookingId) {
        console.error('No valid booking ID found in booking object:', booking);
        return; 
      }
      
      const key = `${booking.bookingDate || 'unknown'}_${booking.startTime || 'unknown'}_${booking.endTime || 'unknown'}_${booking.specialRequests || 'none'}`;
      if (!groups[key]) {
        groups[key] = { 
          ...booking, 
          pets: [booking.petId], 
          bookingIds: [bookingId],
          id: bookingId  
        };
      } else {
        if (booking.petId) groups[key].pets.push(booking.petId);
        groups[key].bookingIds.push(bookingId); 
        delete groups[key].id;
      }
    });
    return Object.values(groups);
  };

  
  if (!Array.isArray(bookings)) {
    return (
      <div>
        <div className="section-header">
          <h2 className="section-title">My Bookings</h2>
        </div>
        <div className="empty-state">
          <Calendar size={48} color="#dee2e6" />
          <p>Error loading bookings data.</p>
        </div>
      </div>
    );
  }

  const groupedBookings = groupBookings(bookings);
  const isOwner = user && user.customerTypeId === 1;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">My Bookings</h2>
        <div className="section-header-actions">
          {bookings.length > 0 && (
            <div className="text-sm text-gray-600">
              {groupedBookings.length} booking session{groupedBookings.length !== 1 ? 's' : ''} 
              ({bookings.length} total pet{bookings.length !== 1 ? 's' : ''})
            </div>
          )}
          {isOwner && (
            <button 
              onClick={handleCreateRequest}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              New Request
            </button>
          )}
        </div>
      </div>

      {deleteMessage && (
        <div className={`mb-4 p-4 rounded-lg ${deleteMessage.includes('success') || deleteMessage.includes('Successfully')
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {deleteMessage}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="#dee2e6" />
          <p>{error ? 'Unable to load bookings due to server issues.' : 'No bookings found.'}</p>
          {isOwner && !error && (
            <button 
              onClick={handleCreateRequest}
              className="btn btn-primary"
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              Create Your First Sitting Request
            </button>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {groupedBookings.map((booking, index) => {
            if (!booking) return null;
            
            const isMultiPet = booking.pets && booking.pets.length > 1;
            const petNames = formatPetNames(booking.pets);
            const canEdit = canEditBooking(booking.statusName);
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
                      {booking.statusName ? booking.statusName.charAt(0) + booking.statusName.slice(1).toLowerCase() : 'Unknown'}
                    </span>

                    <div className="booking-detail-actions">
                      {canEdit && (
                        <button 
                          onClick={() => handleEditBooking(booking)} 
                          className="action-btn edit" 
                          title="Edit booking"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDeleteClick(booking, isMultiPet)} 
                          className="action-btn delete" 
                          title="Delete booking"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="booking-detail-grid">
                  <div><strong>Date:</strong> {safeFormatDate(booking.bookingDate)}</div>
                  <div><strong>Time:</strong> {safeFormatTime(booking.startTime)} - {safeFormatTime(booking.endTime)}</div>
                  <div><strong>Total Cost:</strong> ${booking.totalCost ? booking.totalCost.toFixed(2) : '0.00'}</div>
                  <div><strong>Pet{booking.pets && booking.pets.length > 1 ? 's' : ''}:</strong> {petNames}</div>
                </div>

                {booking.specialRequests && <div className="booking-special-requests"><strong>Special Requests:</strong> {booking.specialRequests}</div>}

                <div className="mt-3 flex gap-4 text-xs">
                  {canEdit && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">Editable</span>}
                  {canDelete && <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded">Deletable</span>}
                  {!canEdit && !canDelete && <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Read-only</span>}
                </div>

                {isMultiPet && booking.bookingIds && (
                  <div className="mt-2 text-xs text-gray-400">Booking IDs: #{booking.bookingIds.join(', #')}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------ Create Request Modal with OwnerView ------------------ */}
      {showCreateModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ 
            maxWidth: '800px', 
            width: '90%', 
            maxHeight: '90vh', 
            overflow: 'auto' 
          }}>
            <div className="modal-header">
              <h3>Create New Sitting Request</h3>
              <button className="close-btn" onClick={closeCreateModal}>
                <X size={20}/>
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '0' }}>
              <OwnerView 
                user={user}
                pets={pets}
                onNavigateToBookings={handleCreateSuccess}
                refreshData={refreshData}
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------ Delete Modal ------------------ */}
      {showDeleteModal && deleteTarget && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-header">
              <AlertCircle className="delete-modal-icon" />
              <h3 className="delete-modal-title">Confirm Deletion</h3>
            </div>

            <div className="delete-modal-description">
              Are you sure you want to delete the booking for <strong>{formatPetNames(deleteTarget.isGroup ? deleteTarget.booking.pets : [deleteTarget.booking.petId])}</strong>? This action cannot be undone.
              {deleteTarget.isGroup && deleteTarget.booking.bookingIds && (
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

      {/* ------------------ Edit Modal ------------------ */}
      {editingRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Request for {getPetName(editingRequest.petId)}</h3>
              <button className="close-btn" onClick={closeEditModal}>
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="edit-form">
              {/* Date */}
              <div className="form-section">
                <label className="form-label">Booking Date</label>
                <input 
                  type="date" 
                  value={editFormData.bookingDate} 
                  onChange={e => setEditFormData({...editFormData, bookingDate: e.target.value})}
                />
                {editErrors.bookingDate && <p className="error">{editErrors.bookingDate}</p>}
              </div>

              {/* Time Range */}
              <div className="form-section grid-2">
                <div>
                  <label className="form-label">Start Time</label>
                  <input 
                    type="time" 
                    value={editFormData.startTime} 
                    onChange={e => setEditFormData({...editFormData, startTime: e.target.value})}
                  />
                  {editErrors.startTime && <p className="error">{editErrors.startTime}</p>}
                </div>
                <div>
                  <label className="form-label">End Time</label>
                  <input 
                    type="time" 
                    value={editFormData.endTime} 
                    onChange={e => setEditFormData({...editFormData, endTime: e.target.value})}
                  />
                  {editErrors.endTime && <p className="error">{editErrors.endTime}</p>}
                </div>
              </div>
              {editErrors.timeRange && <p className="error">{editErrors.timeRange}</p>}

              {/* Budget */}
              <div className="form-section">
                <label className="form-label">Budget</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.totalCost} 
                  onChange={e => setEditFormData({...editFormData, totalCost: e.target.value})} 
                  placeholder="Enter your budget"
                />
              </div>

              {/* Special Requests */}
              <div className="form-section">
                <label className="form-label">Special Requests</label>
                <textarea 
                  value={editFormData.specialRequests} 
                  onChange={e => setEditFormData({...editFormData, specialRequests: e.target.value})} 
                  rows={3} 
                  placeholder="Any special instructions or notes for the sitter..."
                />
              </div>

              {editErrors.submit && <p className="error" style={{ color: '#dc3545', fontSize: '14px', marginBottom: '16px' }}>{editErrors.submit}</p>}

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="submit-btn">
                  <Send size={16}/> {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;