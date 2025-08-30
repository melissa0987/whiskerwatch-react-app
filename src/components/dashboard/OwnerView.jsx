import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PawPrint, DollarSign, MessageSquare, Send, Check, X, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import '../../css/dashboard/SittingRequestPage.css';

const OwnerView = ({ user, formatDate, formatTime, getPetTypeDisplay, pets = [] }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New request state
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

  // Fetch owner requests
  const fetchOwnerRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getUpcomingBookings();
      if (response.success) {
        const ownerRequests = response.data.filter(b => b.ownerId === user.id);
        setRequests(ownerRequests);
      } else {
        setError('Failed to load your requests.');
      }
    } catch (err) {
      setError('Unable to load your sitting requests.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.customerTypeId === 1) {
      fetchOwnerRequests();
    }
  }, [user]);

  // Handle form changes
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
    if (new Date(formData.startDate) > new Date(formData.endDate)) errors.dateRange = 'End date must be after start date.';
    if (!formData.location.trim()) errors.location = 'Location is required.';
    if (!formData.budgetRange) errors.budget = 'Select a budget range.';
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
      const bookingPromises = formData.selectedPets.map(petId => {
        return apiService.createBooking({
          bookingDate: formData.startDate,
          startTime: `${formData.startTime}:00`,
          endTime: `${formData.endTime}:00`,
          statusId: 1, // PENDING
          totalCost: null,
          specialRequests: formData.specialRequests,
          petId,
          ownerId: user.id,
          sitterId: null,
          bookingGroupId: groupId,
          location: formData.location,
          urgency: formData.urgency
        });
      });
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
    <div className="sitting-requests-container max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Your Sitting Requests</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && requests.length === 0 && <p>You haven’t created any requests yet.</p>}

      <div className="requests-grid mb-8">
        {requests.map(req => (
          <div key={req.id} className="request-card">
            <h3>{req.petName} ({getPetTypeDisplay(req.petTypeId)})</h3>
            <p>{formatDate(req.bookingDate)} | {formatTime(req.startTime)} - {formatTime(req.endTime)}</p>
            <p>Status: 
              {req.statusName === 'CONFIRMED' && <Check className="text-green-600 inline ml-1"/>}
              {req.statusName === 'REJECTED' && <X className="text-red-600 inline ml-1"/>}
              {req.statusName === 'PENDING' && <AlertCircle className="text-yellow-600 inline ml-1"/>}
              {req.statusName}
            </p>
          </div>
        ))}
      </div>

      {/* Add new request form */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><PawPrint size={24}/> Post a New Sitting Request</h2>
        {submitMessage && <p className="mb-4 text-green-700">{submitMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pets */}
          <div>
            <label className="block font-medium mb-2">Select Pets</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(pets.length ? pets : []).map(pet => (
                <label key={pet.petId || pet.id} className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center ${
                  formData.selectedPets.includes(pet.petId || pet.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}>
                  <span>{pet.name} ({pet.petTypeName})</span>
                  <input type="checkbox" checked={formData.selectedPets.includes(pet.petId || pet.id)}
                    onChange={() => handlePetSelection(pet.petId || pet.id)} className="sr-only"/>
                </label>
              ))}
            </div>
            {formErrors.pets && <p className="text-red-600 text-sm">{formErrors.pets}</p>}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Start Date</label>
              <input type="date" value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="input-field"/>
              {formErrors.startDate && <p className="text-red-600 text-sm">{formErrors.startDate}</p>}
            </div>
            <div>
              <label className="block mb-1">End Date</label>
              <input type="date" value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
                className="input-field"/>
              {formErrors.endDate && <p className="text-red-600 text-sm">{formErrors.endDate}</p>}
              {formErrors.dateRange && <p className="text-red-600 text-sm">{formErrors.dateRange}</p>}
            </div>
            <div>
              <label className="block mb-1">Start Time</label>
              <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="input-field"/>
            </div>
            <div>
              <label className="block mb-1">End Time</label>
              <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="input-field"/>
            </div>
          </div>

          {/* Location & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Location</label>
              <textarea value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} rows={2} className="input-field"/>
              {formErrors.location && <p className="text-red-600 text-sm">{formErrors.location}</p>}
            </div>
            <div>
              <label className="block mb-1">Budget</label>
              <select value={formData.budgetRange} onChange={e => setFormData({...formData, budgetRange: e.target.value})} className="input-field">
                <option value="">Select budget range</option>
                <option value="low">$</option>
                <option value="medium">$$</option>
                <option value="high">$$$</option>
              </select>
              {formErrors.budget && <p className="text-red-600 text-sm">{formErrors.budget}</p>}
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block mb-1">Special Requests</label>
            <textarea value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})} rows={3} className="input-field" placeholder="Any notes for the sitter..."/>
          </div>

          {/* Urgency */}
          <div>
            <label className="block mb-1">Urgency</label>
            <div className="flex gap-4">
              {['low','normal','high','urgent'].map(level => (
                <label key={level} className="flex items-center gap-1">
                  <input type="radio" value={level} checked={formData.urgency===level} onChange={e=>setFormData({...formData, urgency:e.target.value})}/>
                  {level.charAt(0).toUpperCase()+level.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
            <Send size={16}/>{submitting ? 'Posting...' : 'Post Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerView;
