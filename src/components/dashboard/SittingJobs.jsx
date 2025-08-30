import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PawPrint, MapPin, DollarSign, MessageSquare, CheckCircle, Play, User, Phone, Mail } from 'lucide-react';
import apiService from '../../services/apiService';
import '../../css/dashboard/SittingJobs.css';

const SittingJobs = ({ 
  user, 
  onRefreshBookings,
  formatDate, 
  formatTime,
  getPetTypeDisplay 
}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [processingJob, setProcessingJob] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, in-progress, completed
  const [petDetails, setPetDetails] = useState({});
  const [ownerDetails, setOwnerDetails] = useState({});

  // Status mapping for better display
  const statusClassMap = {
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };

  const getStatusClass = (statusName) => {
    return statusClassMap[statusName.toUpperCase()] || 'unknown-status';
  };

  // Fetch pet details
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

  // Fetch owner details
  const fetchOwnerDetails = async (ownerIds) => {
    const newOwnerDetails = { ...ownerDetails };
    const missingOwnerIds = ownerIds.filter(id => !newOwnerDetails[id]);
    if (missingOwnerIds.length === 0) return;

    try {
      await Promise.all(missingOwnerIds.map(async (ownerId) => {
        try {
          const response = await fetch(`http://localhost:8080/api/users/${ownerId}`);
          if (response.ok) {
            const ownerData = await response.json();
            newOwnerDetails[ownerId] = ownerData;
          } else {
            newOwnerDetails[ownerId] = { 
              id: ownerId, 
              firstName: 'Unknown', 
              lastName: 'Owner',
              email: '',
              phoneNumber: ''
            };
          }
        } catch {
          newOwnerDetails[ownerId] = { 
            id: ownerId, 
            firstName: 'Unknown', 
            lastName: 'Owner',
            email: '',
            phoneNumber: ''
          };
        }
      }));
      setOwnerDetails(newOwnerDetails);
    } catch (err) {
      console.error('Error fetching owner details:', err);
    }
  };

  // Fetch accepted sitting jobs
  const fetchSittingJobs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getBookingsBySitter(user.id);
      
      if (response.success) {
        // Filter for jobs that are confirmed, in progress, or completed
        const acceptedJobs = response.data.filter(booking => 
          ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(booking.statusName)
        );
        setJobs(acceptedJobs);
        
        // Fetch additional details for pets and owners
        const allPetIds = [...new Set(acceptedJobs.map(job => job.petId))];
        const allOwnerIds = [...new Set(acceptedJobs.map(job => job.ownerId))];
        
        if (allPetIds.length > 0) await fetchPetDetails(allPetIds);
        if (allOwnerIds.length > 0) await fetchOwnerDetails(allOwnerIds);
      } else {
        setError('Failed to load your sitting jobs');
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching sitting jobs:', err);
      setError('Unable to load your sitting jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.customerTypeId === 2 || user.customerTypeId === 3)) {
      fetchSittingJobs();
    }
  }, [user]);

  // Group jobs by same time/date/owner
  const groupJobs = (jobs) => {
    const groups = {};
    jobs.forEach(job => {
      const key = `${job.bookingDate}_${job.startTime}_${job.endTime}_${job.ownerId}_${job.specialRequests || 'none'}`;
      if (!groups[key]) {
        const owner = ownerDetails[job.ownerId];
        groups[key] = { 
          ...job, 
          pets: [job.petId], 
          bookingIds: [job.id],
          ownerName: owner 
            ? `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Pet Owner'
            : `${job.ownerFirstName || ''} ${job.ownerLastName || ''}`.trim() || 'Pet Owner',
          ownerEmail: owner?.email || job.ownerEmail || '',
          ownerPhoneNumber: owner?.phoneNumber || job.ownerPhoneNumber || ''
        };
      } else {
        groups[key].pets.push(job.petId);
        groups[key].bookingIds.push(job.id);
      }
    });
    return Object.values(groups);
  };

  // Filter jobs based on selected filter
  const getFilteredJobs = () => {
    const grouped = groupJobs(jobs);
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'upcoming':
        return grouped.filter(job => 
          job.bookingDate >= today && job.statusName === 'CONFIRMED'
        );
      case 'in-progress':
        return grouped.filter(job => job.statusName === 'IN_PROGRESS');
      case 'completed':
        return grouped.filter(job => 
          job.statusName === 'COMPLETED' || job.statusName === 'CANCELLED'
        );
      default:
        return grouped;
    }
  };

  const handleStartJob = async (job) => {
    setProcessingJob(job.id || job.bookingIds?.[0]);
    setActionMessage('');

    try {
      const isGroupJob = job.bookingIds && job.bookingIds.length > 1;

      if (isGroupJob) {
        // Start all bookings in the group
        const updatePromises = job.bookingIds.map(bookingId => 
          apiService.updateBookingStatus(bookingId, 3) // 3 = IN_PROGRESS
        );

        const results = await Promise.all(updatePromises);
        const successCount = results.filter(r => r.success).length;

        if (successCount === results.length) {
          setActionMessage(`Started sitting job for ${job.pets.length} pets!`);
        } else {
          setActionMessage(`Partially successful: ${successCount}/${results.length} jobs started.`);
        }
      } else {
        // Start single job
        const result = await apiService.updateBookingStatus(job.id, 3);
        
        if (result.success) {
          setActionMessage('Sitting job started!');
        } else {
          setActionMessage(result.message || 'Failed to start job');
        }
      }

      // Refresh the jobs list
      await fetchSittingJobs();
      if (onRefreshBookings) await onRefreshBookings();

    } catch (err) {
      console.error('Error starting job:', err);
      setActionMessage('Failed to start job. Please try again.');
    } finally {
      setProcessingJob(null);
    }
  };

  const handleCompleteJob = async (job) => {
    setProcessingJob(job.id || job.bookingIds?.[0]);
    setActionMessage('');

    try {
      const isGroupJob = job.bookingIds && job.bookingIds.length > 1;

      if (isGroupJob) {
        // Complete all bookings in the group
        const updatePromises = job.bookingIds.map(bookingId => 
          apiService.updateBookingStatus(bookingId, 4) // 4 = COMPLETED
        );

        const results = await Promise.all(updatePromises);
        const successCount = results.filter(r => r.success).length;

        if (successCount === results.length) {
          setActionMessage(`Completed sitting job for ${job.pets.length} pets!`);
        } else {
          setActionMessage(`Partially successful: ${successCount}/${results.length} jobs completed.`);
        }
      } else {
        // Complete single job
        const result = await apiService.updateBookingStatus(job.id, 4);
        
        if (result.success) {
          setActionMessage('Sitting job completed!');
        } else {
          setActionMessage(result.message || 'Failed to complete job');
        }
      }

      // Refresh the jobs list
      await fetchSittingJobs();
      if (onRefreshBookings) await onRefreshBookings();

    } catch (err) {
      console.error('Error completing job:', err);
      setActionMessage('Failed to complete job. Please try again.');
    } finally {
      setProcessingJob(null);
    }
  };

  const getJobActions = (job) => {
    const isProcessing = processingJob === (job.id || job.bookingIds?.[0]);
    
    switch (job.statusName) {
      case 'CONFIRMED':
        return (
          <button
            onClick={() => handleStartJob(job)}
            disabled={isProcessing}
            className="action-btn start"
          >
            {isProcessing ? (
              <>
                <div className="loading-spinner-small"></div>
                Starting...
              </>
            ) : (
              <>
                <Play size={16} />
                Start Job
              </>
            )}
          </button>
        );
      case 'IN_PROGRESS':
        return (
          <button
            onClick={() => handleCompleteJob(job)}
            disabled={isProcessing}
            className="action-btn complete"
          >
            {isProcessing ? (
              <>
                <div className="loading-spinner-small"></div>
                Completing...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Mark Complete
              </>
            )}
          </button>
        );
      case 'COMPLETED':
      case 'CANCELLED':
        return (
          <span className="status-badge completed">
            {job.statusName === 'COMPLETED' ? 'Completed' : 'Cancelled'}
          </span>
        );
      default:
        return null;
    }
  };

  const formatPetInfo = (petIds) => {
    if (!Array.isArray(petIds)) {
      const pet = petDetails[petIds];
      return pet ? `${pet.name} (${getPetTypeDisplay ? getPetTypeDisplay(pet.typeId) : 'Pet'})` : `Pet #${petIds}`;
    }
    
    if (petIds.length === 1) {
      const pet = petDetails[petIds[0]];
      return pet ? `${pet.name} (${getPetTypeDisplay ? getPetTypeDisplay(pet.typeId) : 'Pet'})` : `Pet #${petIds[0]}`;
    }
    
    if (petIds.length <= 4) {
      return petIds.map(id => {
        const pet = petDetails[id];
        return pet ? `${pet.name} (${getPetTypeDisplay ? getPetTypeDisplay(pet.typeId) : 'Pet'})` : `Pet #${id}`;
      }).join(', ');
    }
    
    return `${petIds.slice(0,3).map(id => {
      const pet = petDetails[id];
      return pet ? `${pet.name} (${getPetTypeDisplay ? getPetTypeDisplay(pet.typeId) : 'Pet'})` : `Pet #${id}`;
    }).join(', ')} and ${petIds.length - 3} more`;
  };

  const filteredJobs = getFilteredJobs();

  return (
    <div className="sitting-jobs-container">
      <div className="section-header">
        <h2 className="section-title">My Sitting Jobs</h2>
        <p className="section-subtitle">Manage your accepted pet sitting appointments</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { id: 'all', label: 'All Jobs', count: groupJobs(jobs).length },
          { id: 'upcoming', label: 'Upcoming', count: getFilteredJobs().length },
          { id: 'in-progress', label: 'In Progress', count: jobs.filter(j => j.statusName === 'IN_PROGRESS').length },
          { id: 'completed', label: 'Completed', count: jobs.filter(j => j.statusName === 'COMPLETED' || j.statusName === 'CANCELLED').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`filter-tab ${filter === tab.id ? 'active' : ''}`}
          >
            {tab.label}
            <span className="tab-count">{filter === tab.id ? filteredJobs.length : tab.count}</span>
          </button>
        ))}
      </div>

      {actionMessage && (
        <div className={`mb-4 p-4 rounded-lg ${actionMessage.includes('success') || actionMessage.includes('Started') || actionMessage.includes('Completed')
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your sitting jobs...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <AlertCircle size={48} color="#ef4444" />
          <p>{error}</p>
          <button 
            onClick={fetchSittingJobs}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="#dee2e6" />
          <p>
            {filter === 'all' ? 'No sitting jobs found.' :
             filter === 'upcoming' ? 'No upcoming jobs.' :
             filter === 'in-progress' ? 'No jobs in progress.' :
             'No completed jobs.'}
          </p>
          <button 
            onClick={fetchSittingJobs}
            className="refresh-btn"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job, index) => {
            const isMultiPet = job.pets.length > 1;
            const statusClass = getStatusClass(job.statusName);

            return (
              <div key={index} className={`job-card ${statusClass}`}>
                <div className="job-header">
                  <div className="job-status-badge">
                    <span className={`status-indicator ${statusClass}`}>
                      {job.statusName.charAt(0) + job.statusName.slice(1).toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div className="job-pet-info">
                    <PawPrint size={16} className="text-green-600" />
                    <span>{formatPetInfo(job.pets)}</span>
                  </div>
                </div>

                <div className="job-owner-info">
                  <User size={18} className="text-blue-600" />
                  <div>
                    <h4 className="owner-name">{job.ownerName}</h4>
                    {job.ownerPhoneNumber && (
                      <div className="contact-info">
                        <Phone size={14} />
                        <span>{job.ownerPhoneNumber}</span>
                      </div>
                    )}
                    {job.ownerEmail && (
                      <div className="contact-info">
                        <Mail size={14} />
                        <span>{job.ownerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="job-details">
                  <div className="detail-row">
                    <Calendar size={16} />
                    <span>{formatDate(job.bookingDate)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <Clock size={16} />
                    <span>
                      {formatTime(job.startTime)} - {formatTime(job.endTime)}
                    </span>
                  </div>

                  {job.location && (
                    <div className="detail-row">
                      <MapPin size={16} />
                      <span className="location">{job.location}</span>
                    </div>
                  )}

                  {job.totalCost && (
                    <div className="detail-row">
                      <DollarSign size={16} />
                      <span className="cost">${job.totalCost.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {job.specialRequests && (
                  <div className="special-requests">
                    <MessageSquare size={16} />
                    <div>
                      <strong>Special Instructions:</strong>
                      <p>{job.specialRequests}</p>
                    </div>
                  </div>
                )}

                <div className="job-actions">
                  {getJobActions(job)}
                </div>

                {isMultiPet && (
                  <div className="multi-pet-indicator">
                    <span>Group booking: {job.bookingIds.length} pets</span>
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

export default SittingJobs;