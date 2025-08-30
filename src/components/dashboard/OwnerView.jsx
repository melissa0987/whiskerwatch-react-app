import React, { useState, useEffect } from 'react';
import { PawPrint, Send, Trash2 } from 'lucide-react';
import apiService from '../../services/apiService'; 
import '../../css/dashboard/OwnerView.css';

const OwnerView = ({ user, pets = [], onNavigateToBookings }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    selectedPets: [],
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    location: user?.address || '',
    budgetRange: '',
    specialRequests: '',
    urgency: 'normal'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(''); 

  useEffect(() => {
    if (user?.customerTypeId === 1) fetchOwnerRequests();
  }, [user]);

  // Fetch bookings and sort by creation date (desc)
  const fetchOwnerRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getUpcomingBookings();
      if (response.success) {
        const ownerRequests = response.data
          .filter(b => b.ownerId === user.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRequests(ownerRequests);
      } else {
        setError('Failed to load your requests.');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load your sitting requests.');
    } finally {
      setLoading(false);
    }
  };

  const handlePetSelection = (petId) => {
    setFormData(prev => ({
      ...prev,
      selectedPets: prev.selectedPets.includes(petId)
        ? prev.selectedPets.filter(id => id !== petId)
        : [...prev.selectedPets, petId]
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.selectedPets.length) errors.pets = 'Select at least one pet.';
    if (!formData.startDate) errors.startDate = 'Start date is required.';
    if (!formData.endDate) errors.endDate = 'End date is required.';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.dateRange = 'End date must be after start date.';
    }
    if (!formData.location.trim()) errors.location = 'Location is required.'; 

    if (!formData.budgetRange) {
        errors.budget = 'Budget is required.';
    } else if (isNaN(formData.budgetRange) || Number(formData.budgetRange) <= 0) {
        errors.budget = 'Budget must be a positive number.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitMessage('');
    try {
      const groupId = Date.now().toString();
      const bookingPromises = formData.selectedPets.map(petId => apiService.createBooking({
        bookingDate: formData.startDate,
        startTime: `${formData.startTime}:00`,
        endTime: `${formData.endTime}:00`,
        statusId: 1,
        totalCost: null,
        specialRequests: formData.specialRequests,
        petId,
        ownerId: user.id,
        sitterId: null,
        bookingGroupId: groupId,
        location: formData.location,
        urgency: formData.urgency
      }));

      const results = await Promise.all(bookingPromises);
      const successCount = results.filter(r => r.success).length;

      if (successCount > 0) {
        setSubmitMessage(`Successfully posted request for ${successCount} pet(s)!`);
        setFormData({
          selectedPets: [],
          startDate: '',
          endDate: '',
          startTime: '09:00',
          endTime: '17:00',
          location: user?.address || '',
          budgetRange: '',
          specialRequests: '',
          urgency: 'normal'
        });
        
        // Redirect to bookings page after successful submission
        setTimeout(() => {
          if (onNavigateToBookings) {
            onNavigateToBookings();
          }
        }, 2000); // 2 second delay to show success message
        
        fetchOwnerRequests();
      } else {
        setSubmitMessage('Failed to create any requests.');
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage('Error submitting request.');
    } finally {
      setSubmitting(false);
    }
  }; 

  return (
    <div className="owner-view-container max-w-4xl mx-auto p-6">
      {/* ------------------ Sitting Request Form ------------------ */}
      <div className="sitting-request-form">
        <h2><PawPrint size={24}/> Post a New Sitting Request</h2>
        <form onSubmit={handleSubmit}>
          {/* Pets Selection */}
          <div className="form-section">
            <label className="form-label">Select Pets</label>
            <div className="pets-selection-grid">
              {pets.map(pet => {
                const petId = pet.petId || pet.id;
                const isSelected = formData.selectedPets.includes(petId);
                return (
                  <div
                    key={petId}
                    className={`pet-selection-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePetSelection(petId)}
                  >
                    <div className="pet-info">
                      <div className="pet-name">{pet.name}</div>
                      <div className="pet-type">{pet.petTypeName || 'Unknown type'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {formErrors.pets && <p className="error">{formErrors.pets}</p>}
          </div>

          {/* Date & Time */}
          <div className="form-section grid-2">
            <div>
              <label className="form-label">Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}/>
              {formErrors.startDate && <p className="error">{formErrors.startDate}</p>}
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}/>
              {formErrors.endDate && <p className="error">{formErrors.endDate}</p>}
              {formErrors.dateRange && <p className="error">{formErrors.dateRange}</p>}
            </div>
          </div>

          {/* Time Range */}
          <div className="form-section">
            <label className="form-label">Time Range</label>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
              <input 
                type="time" 
                value={formData.startTime} 
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                style={{flex: 1}}
              />
              <span>to</span>
              <input 
                type="time" 
                value={formData.endTime} 
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                style={{flex: 1}}
              />
            </div>
          </div>

          {/* Location & Budget */}
          <div className="form-section grid-2">
            <div>
              <label className="form-label">Location</label>
              <textarea value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} rows={2}/>
              {formErrors.location && <p className="error">{formErrors.location}</p>}
            </div>
            <div>
              <label className="form-label">Budget ($)</label>
                <input 
                    type="number" 
                    min="0"
                    value={formData.budgetRange} 
                    onChange={e => setFormData({...formData, budgetRange: e.target.value})} 
                    placeholder="Enter your budget"
                />
              {formErrors.budget && <p className="error">{formErrors.budget}</p>}
            </div>
          </div>

          {/* Special Requests */}
          <div className="form-section">
            <label className="form-label">Special Requests</label>
            <textarea value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})} rows={3} placeholder="Any special instructions or notes for the sitter..."/>
          </div>

          {/* Urgency */}
          <div className="form-section">
            <label className="form-label">Urgency Level</label>
            <div className="urgency-options">
              {['low','normal','high','urgent'].map(level => (
                <label key={level}>
                  <input type="radio" value={level} checked={formData.urgency === level} onChange={e => setFormData({...formData, urgency: e.target.value})}/>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="submit-btn">
            <Send size={16}/> {submitting ? 'Posting Request...' : 'Post Sitting Request'}
          </button>
        </form>
        {submitMessage && (
          <div className="submit-message">
            {submitMessage}
            {submitMessage.includes('Successfully') && (
              <div style={{fontSize: '13px', color: '#6b7280', marginTop: '4px'}}>
                Redirecting to your bookings...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerView;