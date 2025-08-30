import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PawPrint, MapPin, DollarSign, MessageSquare, Send, X, Edit } from 'lucide-react';

import apiService from "../../services/apiService"; 
import '../../css/dashboard/SittingRequestPage.css';

const SittingRequestPage = ({ user, pets = [], onRefreshBookings, editingBooking, onEditComplete }) => {
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Mock pets data if none provided
  const mockPets = [
    { petId: 1, name: 'Buddy', petTypeName: 'Dog', breed: 'Golden Retriever' },
    { petId: 2, name: 'Whiskers', petTypeName: 'Cat', breed: 'Persian' },
    { petId: 3, name: 'Charlie', petTypeName: 'Dog', breed: 'Labrador' }
  ];

  const availablePets = pets.length > 0 ? pets : mockPets;

  const budgetOptions = [
    { value: '20-30', label: '$20-30 per day' },
    { value: '30-50', label: '$30-50 per day' },
    { value: '50-75', label: '$50-75 per day' },
    { value: '75+', label: '$75+ per day' },
    { value: 'negotiable', label: 'Negotiable' }
  ];

  // Effect to populate form when editing booking
  useEffect(() => {
    if (editingBooking) {
      setIsEditMode(true);
      setFormData({
        selectedPets: editingBooking.pets || [editingBooking.petId],
        startDate: editingBooking.bookingDate,
        endDate: editingBooking.bookingDate, // For now, single day bookings
        startTime: editingBooking.startTime ? editingBooking.startTime.substring(0, 5) : '09:00',
        endTime: editingBooking.endTime ? editingBooking.endTime.substring(0, 5) : '17:00',
        location: editingBooking.location || user?.address || '',
        budgetRange: editingBooking.budgetRange || '',
        specialRequests: editingBooking.specialRequests || '',
        urgency: editingBooking.urgency || 'normal'
      });
      setSubmitMessage('');
    } else {
      setIsEditMode(false);
    }
  }, [editingBooking, user?.address]);

  const handlePetSelection = (petId) => {
    setFormData(prev => ({
      ...prev,
      selectedPets: prev.selectedPets.includes(petId)
        ? prev.selectedPets.filter(id => id !== petId)
        : [...prev.selectedPets, petId]
    }));
  };

  const selectAllPets = () => {
    setFormData(prev => ({
      ...prev,
      selectedPets: availablePets.map(pet => pet.petId || pet.id)
    }));
  };

  const deselectAllPets = () => {
    setFormData(prev => ({
      ...prev,
      selectedPets: []
    }));
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    resetForm();
    if (onEditComplete) {
      onEditComplete();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.selectedPets.length === 0) {
      newErrors.pets = 'Please select at least one pet';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.dateRange = 'End date must be after start date';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.budgetRange) {
      newErrors.budget = 'Please select a budget range';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
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
    setErrors({});
    setSubmitMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      if (isEditMode && editingBooking) {
        // Editing an existing booking
        const isMultiPetBooking = editingBooking.pets && editingBooking.pets.length > 1;
        
        if (isMultiPetBooking && editingBooking.bookingIds) {
          // Update all bookings in the group
          const updatePromises = editingBooking.bookingIds.map(bookingId => {
            console.log('Updating booking ID:', bookingId);
            const updatedData = {
              bookingDate: formData.startDate,
              startTime: `${formData.startTime}:00`,
              endTime: `${formData.endTime}:00`,
              location: formData.location,
              budgetRange: formData.budgetRange,
              specialRequests: formData.specialRequests,
              urgency: formData.urgency
            };
            return apiService.updateBooking(bookingId, updatedData);
          });

          const results = await Promise.all(updatePromises);
          const successCount = results.filter(r => r.success).length;
          const totalCount = results.length;

          if (successCount === totalCount) {
            setSubmitMessage(`Successfully updated all ${totalCount} bookings in the group!`);
          } else {
            setSubmitMessage(`Partially successful: ${successCount}/${totalCount} bookings updated.`);
          }
        } else {
          // Update single booking - ensure we have a valid booking ID
          const bookingId = editingBooking.id || editingBooking.bookingIds?.[0];
          
          if (!bookingId) {
            setSubmitMessage('Error: No valid booking ID found for update');
            return;
          }

          console.log('Updating single booking ID:', bookingId);
          const updatedData = {
            bookingDate: formData.startDate,
            startTime: `${formData.startTime}:00`,
            endTime: `${formData.endTime}:00`,
            location: formData.location,
            budgetRange: formData.budgetRange,
            specialRequests: formData.specialRequests,
            urgency: formData.urgency
          };

          const result = await apiService.updateBooking(bookingId, updatedData);

          if (result.success) {
            setSubmitMessage('Booking updated successfully!');
          } else {
            setSubmitMessage(result.message || 'Failed to update booking');
          }
        }

        // Refresh bookings and exit edit mode
        if (onRefreshBookings) await onRefreshBookings();
        setTimeout(() => {
          setIsEditMode(false);
          if (onEditComplete) onEditComplete();
        }, 2000);

      } else {
        // Create new booking(s)
        const groupId = Date.now().toString();
        const bookingPromises = formData.selectedPets.map(petId => {
          const bookingData = {
            bookingDate: formData.startDate,
            startTime: `${formData.startTime}:00`,
            endTime: `${formData.endTime}:00`,
            statusId: 1,
            totalCost: null,
            specialRequests: formData.specialRequests,
            petId,
            ownerId: user?.id,
            sitterId: null,
            bookingGroupId: groupId,
            notes: `Group booking with ${formData.selectedPets.length} pets: ${availablePets
              .filter(p => formData.selectedPets.includes(p.petId || p.id))
              .map(p => p.name).join(', ')}`,
          };
          return apiService.createBooking(bookingData);
        });

        const results = await Promise.all(bookingPromises);
        const allSuccessful = results.every(r => r.success);
        const successCount = results.filter(r => r.success).length;

        if (allSuccessful) {
          setSubmitMessage(`Sitting request posted successfully for ${formData.selectedPets.length} pet(s)!`);
          resetForm();
          if (onRefreshBookings) await onRefreshBookings();
        } else if (successCount > 0) {
          const failedCount = results.filter(r => !r.success).length;
          setSubmitMessage(`Partially successful: ${successCount} created, ${failedCount} failed.`);
          if (onRefreshBookings) await onRefreshBookings();
        } else {
          setSubmitMessage('Failed to create any bookings.');
        }
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      setSubmitMessage('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    }
    return 0;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? (
                <span className="flex items-center gap-2">
                  <Edit size={32} />
                  Edit Booking
                </span>
              ) : (
                'Post a Sitting Request'
              )}
            </h1>
            <p className="text-gray-600">
              {isEditMode 
                ? `Editing booking ${editingBooking?.id || 'group'} - make your changes below`
                : 'Find trusted sitters for your beloved pets'
              }
            </p>
          </div>
          
          {isEditMode && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {submitMessage && (
        <div className={`mb-6 p-4 rounded-lg ${submitMessage.includes('success') 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Pet Selection */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <PawPrint className="text-blue-600" size={24} />
              Select Pets
              {isEditMode && (
                <span className="text-sm font-normal text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Editing Mode
                </span>
              )}
            </h2>
            <div className="space-x-2">
              <button
                type="button"
                onClick={selectAllPets}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <span className="text-gray-400">|</span>
              <button
                type="button"
                onClick={deselectAllPets}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePets.map(pet => (
              <label
                key={pet.petId || pet.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.selectedPets.includes(pet.petId || pet.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.selectedPets.includes(pet.petId || pet.id)}
                  onChange={() => handlePetSelection(pet.petId || pet.id)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{pet.name}</div>
                  <div className="text-sm text-gray-500">
                    {pet.petTypeName || 'Unknown type'} • {pet.breed || 'Mixed breed'}
                  </div>
                </div>
                {formData.selectedPets.includes(pet.petId || pet.id) && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </label>
            ))}
          </div>

          {errors.pets && (
            <p className="mt-2 text-sm text-red-600">{errors.pets}</p>
          )}
        </div>

        {/* Date and Time Selection */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} />
            When do you need sitting?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {errors.dateRange && (
            <p className="mt-2 text-sm text-red-600">{errors.dateRange}</p>
          )}

          {calculateDays() > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Duration: {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
              </p>
            </div>
          )}
        </div>

        {/* Location and Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Location
            </label>
            <textarea
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              rows={3}
              placeholder="Enter the address where sitting will take place"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign size={16} />
              Budget Range
            </label>
            <select
              value={formData.budgetRange}
              onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select budget range</option>
              {budgetOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
            )}
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Request Urgency
          </label>
          <div className="flex space-x-4">
            {[
              { value: 'low', label: 'Low - More than a week away' },
              { value: 'normal', label: 'Normal - Within a week' },
              { value: 'high', label: 'High - Within 2-3 days' },
              { value: 'urgent', label: 'Urgent - ASAP' }
            ].map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="urgency"
                  value={option.value}
                  checked={formData.urgency === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare size={16} />
            Special Requests or Instructions
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
            rows={4}
            placeholder="Any special instructions, medications, feeding schedules, or other important information for the sitter..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200 gap-3">
          {isEditMode && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel Changes
            </button>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                {isEditMode ? 'Updating...' : 'Posting Request...'}
              </>
            ) : (
              <>
                <Send size={20} />
                {isEditMode ? 'Update Booking' : 'Post Sitting Request'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SittingRequestPage;