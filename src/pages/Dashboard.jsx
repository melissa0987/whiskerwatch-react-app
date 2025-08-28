import React, { useState, useEffect } from 'react';
import { PawPrint, User, Settings, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import apiService from '../services/apiService';
import '../css/Dashboard.css'; // Custom CSS

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    
    // For now, we'll handle CORS errors gracefully
    try {
      console.log('Fetching data for user:', user);
      
      // Only attempt to fetch data if user is an owner (customerTypeId 1 or 3)
      if (user.customerTypeId === 1 || user.customerTypeId === 3) {
        try {
          console.log('Fetching pets for owner ID:', user.id);
          const petsData = await apiService.getPetsByOwner(user.id);
          console.log('Pets data:', petsData);
          setPets(petsData.success ? petsData.data : []);
        } catch (corsError) {
          console.warn('CORS error fetching pets - using mock data for now', corsError);
          setPets([]); // Set empty array for now
        }

        try {
          console.log('Fetching owner bookings for user ID:', user.id);
          const ownerBookingsData = await apiService.getBookingsByOwner(user.id);
          console.log('Owner bookings data:', ownerBookingsData);
          setBookings(ownerBookingsData.success ? ownerBookingsData.data : []);
        } catch (corsError) {
          console.warn('CORS error fetching bookings - using mock data for now', corsError);
          setBookings([]); // Set empty array for now
        }
      }

      // If user is also a sitter (customerTypeId 2 or 3), fetch sitter bookings
      if (user.customerTypeId === 2 || user.customerTypeId === 3) {
        try {
          console.log('Fetching sitter bookings for user ID:', user.id);
          const sitterBookingsData = await apiService.getBookingsBySitter(user.id);
          console.log('Sitter bookings data:', sitterBookingsData);
          if (sitterBookingsData.success) {
            // Combine with existing bookings if user is both owner and sitter
            if (user.customerTypeId === 3) {
              setBookings(prev => [...prev, ...sitterBookingsData.data]);
            } else {
              setBookings(sitterBookingsData.data);
            }
          }
        } catch (corsError) {
          console.warn('CORS error fetching sitter bookings - using mock data for now', corsError);
          // Don't overwrite existing bookings if this fails
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.message && err.message.includes('CORS')) {
        setError('Unable to connect to server. Please check that your backend is running and CORS is configured properly.');
      } else {
        setError('Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchUserData();
    }
  }, [user]);

  const getCustomerTypeDisplay = (customerTypeId) => {
    switch (customerTypeId) {
      case 1: return 'Pet Owner';
      case 2: return 'Pet Sitter';
      case 3: return 'Both';
      default: return 'Unknown';
    }
  };

  const getBookingStatusDisplay = (statusId) => {
    switch (statusId) {
      case 1: return 'Pending';
      case 2: return 'Confirmed';
      case 3: return 'In Progress';
      case 4: return 'Completed';
      case 5: return 'Cancelled';
      case 6: return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getPetTypeDisplay = (typeId) => {
    const petTypes = {
      1: 'Dog', 2: 'Cat', 3: 'Bird', 4: 'Fish', 5: 'Rabbit',
      6: 'Hamster', 7: 'Guinea Pig', 8: 'Reptile', 9: 'Ferret', 10: 'Chinchilla'
    };
    return petTypes[typeId] || 'Unknown';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading your dashboard...
      </div>
    );
  }

  // Define navigation items with proper icon destructuring
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  // Add pets and bookings tabs only if user is a pet owner
  if (user.customerTypeId === 1 || user.customerTypeId === 3) {
    navigationItems.splice(1, 0, 
      { id: 'pets', label: 'My Pets', icon: PawPrint },
      { id: 'bookings', label: 'Bookings', icon: Calendar }
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #dee2e6',
        padding: '16px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PawPrint size={32} color="#2563eb" />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Whisker Watch</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '16px' }}>Welcome, {user.firstName}!</span>
            <button
              onClick={onLogout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Navigation Tabs */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          marginBottom: '20px',
          padding: '0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <nav style={{ 
            display: 'flex',
            borderBottom: '1px solid #dee2e6'
          }}>
            {navigationItems.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    style={{
                    padding: '16px 24px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: activeTab === id ? '3px solid #2563eb' : '3px solid transparent',
                    color: activeTab === id ? '#2563eb' : '#6c757d',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '16px',
                    fontWeight: activeTab === id ? 'bold' : 'normal'
                    }}
                >
                    <Icon size={20} />
                    {label}
                </button>
                ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ marginBottom: '24px', color: '#343a40' }}>Dashboard Overview</h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px',
                marginBottom: '30px'
              }}>
                {(user.customerTypeId === 1 || user.customerTypeId === 3) && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>My Pets</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1565c0' }}>
                      {pets.length}
                    </p>
                  </div>
                )}
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f3e5f5',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#7b1fa2' }}>Total Bookings</h3>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#7b1fa2' }}>
                    {bookings.length}
                  </p>
                </div>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>Account Type</h3>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#2e7d32' }}>
                    {getCustomerTypeDisplay(user.customerTypeId)}
                  </p>
                </div>
              </div>

              {/* Welcome Message */}
              <div style={{
                padding: '20px',
                backgroundColor: '#f0f8ff',
                borderRadius: '8px',
                border: '1px solid #b6d7ff'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#0056b3' }}>Welcome to Whisker Watch!</h3>
                <p style={{ margin: 0, color: '#004085' }}>
                  {user.customerTypeId === 1 && "As a pet owner, you can manage your pets and book trusted sitters for them."}
                  {user.customerTypeId === 2 && "As a pet sitter, you can view and manage your booking requests from pet owners."}
                  {user.customerTypeId === 3 && "You have both owner and sitter privileges - manage your pets and provide sitting services to other owners."}
                </p>
              </div>

              {/* Recent Activity */}
              {bookings.length > 0 && (
                <>
                  <h3 style={{ marginTop: '30px', marginBottom: '16px', color: '#343a40' }}>Recent Bookings</h3>
                  {bookings.slice(0, 3).map(booking => (
                    <div key={booking.id} style={{
                      padding: '12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>
                          {formatDate(booking.bookingDate)} at {formatTime(booking.startTime)}
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: booking.statusId === 2 ? '#d4edda' : '#fff3cd',
                          color: booking.statusId === 2 ? '#155724' : '#856404'
                        }}>
                          {getBookingStatusDisplay(booking.statusId)}
                        </span>
                      </div>
                      {booking.specialRequests && (
                        <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                          {booking.specialRequests}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Pets Tab - Only show for owners */}
          {activeTab === 'pets' && (user.customerTypeId === 1 || user.customerTypeId === 3) && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#343a40' }}>My Pets</h2>
                <button style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Plus size={16} />
                  Add Pet
                </button>
              </div>

              {pets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  <PawPrint size={48} color="#dee2e6" />
                  <p style={{ marginTop: '16px' }}>
                    {error ? 'Unable to load pets due to server connection issues.' : 'No pets added yet. Add your first pet to get started!'}
                  </p>
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '20px' 
                }}>
                  {pets.map(pet => (
                    <div key={pet.id} style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, color: '#343a40' }}>{pet.name}</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #6c757d',
                            padding: '4px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#6c757d'
                          }}>
                            <Edit2 size={14} />
                          </button>
                          <button style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #dc3545',
                            padding: '4px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#dc3545'
                          }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.5' }}>
                        <p style={{ margin: '4px 0' }}><strong>Type:</strong> {getPetTypeDisplay(pet.typeId)}</p>
                        <p style={{ margin: '4px 0' }}><strong>Breed:</strong> {pet.breed || 'Not specified'}</p>
                        <p style={{ margin: '4px 0' }}><strong>Age:</strong> {pet.age} years old</p>
                        <p style={{ margin: '4px 0' }}><strong>Weight:</strong> {pet.weight ? `${pet.weight} lbs` : 'Not specified'}</p>
                        {pet.specialInstructions && (
                          <p style={{ margin: '8px 0 0 0' }}>
                            <strong>Special Instructions:</strong> {pet.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab - Only show for owners and sitters */}
          {activeTab === 'bookings' && (
            <div>
              <h2 style={{ marginBottom: '24px', color: '#343a40' }}>My Bookings</h2>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  <Calendar size={48} color="#dee2e6" />
                  <p style={{ marginTop: '16px' }}>
                    {error ? 'Unable to load bookings due to server connection issues.' : 'No bookings found.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bookings.map(booking => (
                    <div key={booking.id} style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, color: '#343a40' }}>
                          Booking #{booking.id}
                        </h4>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          backgroundColor: booking.statusId === 2 ? '#d4edda' : booking.statusId === 1 ? '#fff3cd' : '#f8d7da',
                          color: booking.statusId === 2 ? '#155724' : booking.statusId === 1 ? '#856404' : '#721c24'
                        }}>
                          {getBookingStatusDisplay(booking.statusId)}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '16px',
                        fontSize: '14px',
                        color: '#6c757d'
                      }}>
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
                        <div style={{ marginTop: '12px', fontSize: '14px' }}>
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ marginBottom: '24px', color: '#343a40' }}>Profile Information</h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px',
                maxWidth: '600px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>First Name</label>
                  <input 
                    type="text" 
                    value={user.firstName || ''} 
                    readOnly 
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Last Name</label>
                  <input 
                    type="text" 
                    value={user.lastName || ''} 
                    readOnly 
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Username</label>
                  <input 
                    type="text" 
                    value={user.userName || ''} 
                    readOnly 
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Email</label>
                  <input 
                    type="email" 
                    value={user.email || ''} 
                    readOnly 
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={user.phoneNumber || ''} 
                    readOnly 
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Account Type</label>
                  <input 
                    type="text" 
                    value={getCustomerTypeDisplay(user.customerTypeId)} 
                    readOnly 
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Address</label>
                  <textarea 
                    value={user.address || ''} 
                    readOnly 
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '24px' }}>
                <button style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }} disabled>
                  Edit Profile (Coming Soon)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;