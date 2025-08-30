import React, { useState, useEffect } from 'react';
import { PawPrint, User, Settings, Calendar, Search, Briefcase } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

import apiService from '../services/apiService';
import Header from '../components/homepage/Header';
import Overview from '../components/dashboard/Overview';
import MyPets from '../components/dashboard/MyPets';
import Bookings from '../components/dashboard/Bookings';
import Profile from '../components/dashboard/Profile';
import EditProfile from '../components/dashboard/EditProfile';
import Footer from '../components/homepage/Footer';
import SittingRequestPage from '../components/dashboard/SittingRequestPage'; 
import SittingJobs from '../components/dashboard/SittingJobs';
// Add this import for the Browse Requests component
import SittingRequests from '../components/dashboard/SittingRequestPage'; 

import '../css/Dashboard.css'; 

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [editingBooking, setEditingBooking] = useState(null);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching data for user:', currentUser);
      
      // Only attempt to fetch data if user is an owner (customerTypeId 1 or 3)
      if (currentUser.customerTypeId === 1 || currentUser.customerTypeId === 3) {
        try {
          console.log('Fetching pets for owner ID:', currentUser.id);
          const petsData = await apiService.getPetsByOwner(currentUser.id);
          console.log('Pets data:', petsData);
          setPets(petsData.success ? petsData.data : []);
        } catch (corsError) {
          console.warn('CORS error fetching pets - using mock data for now', corsError);
          setPets([]);
        }

        try {
          console.log('Fetching owner bookings for user ID:', currentUser.id);
          const ownerBookingsData = await apiService.getBookingsByOwner(currentUser.id);
          console.log('Owner bookings data:', ownerBookingsData);
          setBookings(ownerBookingsData.success ? ownerBookingsData.data : []);
        } catch (corsError) {
          console.warn('CORS error fetching bookings - using mock data for now', corsError);
          setBookings([]);
        }
      }

      // If user is also a sitter (customerTypeId 2 or 3), fetch sitter bookings
      if (currentUser.customerTypeId === 2 || currentUser.customerTypeId === 3) {
        try {
          console.log('Fetching sitter bookings for user ID:', currentUser.id);
          const sitterBookingsData = await apiService.getBookingsBySitter(currentUser.id);
          console.log('Sitter bookings data:', sitterBookingsData);
          if (sitterBookingsData.success) {
            // Combine with existing bookings if user is both owner and sitter
            if (currentUser.customerTypeId === 3) {
              setBookings(prev => [...prev, ...sitterBookingsData.data]);
            } else {
              setBookings(sitterBookingsData.data);
            }
          }
        } catch (corsError) {
          console.warn('CORS error fetching sitter bookings - using mock data for now', corsError);
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
    if (currentUser && currentUser.id) {
      fetchUserData();
    }
  }, [currentUser]);

  // Set up the global edit booking function for the Bookings component
  useEffect(() => {
    window.editBooking = (booking) => {
      setEditingBooking(booking);
      setActiveTab('request');
    };

    return () => {
      delete window.editBooking;
    };
  }, []);

  // Utility functions
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

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        setCurrentUser(prev => ({ ...prev, ...updatedData }));
        setShowEditModal(false);
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleEditProfile = () => {
    console.log('handleEditProfile called - opening modal');
    setShowEditModal(true);
    console.log('Modal should be open, showEditModal:', true);
  };

  const getPetName = (petId) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : "Unknown Pet";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading your dashboard...
      </div>
    );
  }

  // Define navigation items based on user type
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  // Add owner-specific tabs
  if (currentUser.customerTypeId === 1 || currentUser.customerTypeId === 3) {
    navigationItems.push(
      { id: 'pets', label: 'My Pets', icon: PawPrint },
      { id: 'bookings', label: 'My Bookings', icon: Calendar },
      { id: 'request', label: 'Request Sitting', icon: PawPrint }
    );
  }

  // Add sitter-specific tabs
  if (currentUser.customerTypeId === 2 || currentUser.customerTypeId === 3) {
    navigationItems.push(
      { id: 'sitting-requests', label: 'Browse Requests', icon: Search },
      { id: 'sitting-jobs', label: 'My Jobs', icon: Briefcase }
    );
  }

  const refreshPets = async () => {
    if (currentUser.customerTypeId === 1 || currentUser.customerTypeId === 3) {
      try {
        console.log('Refreshing pets for user:', currentUser.id);
        const petsData = await apiService.getPetsByOwner(currentUser.id);
        console.log('Refreshed pets data:', petsData);
        setPets(petsData.success ? petsData.data : []);
      } catch (error) {
        console.error('Error refreshing pets:', error);
      }
    }
  };

  const refreshBookings = async () => {
    if (!currentUser) return;

    try {
      let newBookings = [];

      // Owner bookings
      if (currentUser.customerTypeId === 1 || currentUser.customerTypeId === 3) {
        const ownerBookingsData = await apiService.getBookingsByOwner(currentUser.id);
        if (ownerBookingsData.success) newBookings = [...newBookings, ...ownerBookingsData.data];
      }

      // Sitter bookings
      if (currentUser.customerTypeId === 2 || currentUser.customerTypeId === 3) {
        const sitterBookingsData = await apiService.getBookingsBySitter(currentUser.id);
        if (sitterBookingsData.success) newBookings = [...newBookings, ...sitterBookingsData.data];
      }

      setBookings(newBookings);
    } catch (err) {
      console.error('Error refreshing bookings:', err);
    }
  };

  // Component props object to avoid repetition
  const componentProps = {
    user: currentUser,
    pets,
    bookings,
    error,
    getCustomerTypeDisplay,
    getBookingStatusDisplay,
    getPetTypeDisplay,
    formatDate,
    formatTime,
    onUpdateProfile: handleUpdateProfile,
    onEditProfile: handleEditProfile,
    onRefreshPets: refreshPets, 
    onRefreshBookings: refreshBookings
  };

  console.log('Dashboard render - showEditModal:', showEditModal);

  return (
    <div className="dashboard-container">
      <Header currentUser={currentUser} onLogout={onLogout} />

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Navigation Tabs */}
        <div className="dashboard-nav-container">
          <nav className="dashboard-nav">
            {navigationItems.map(({ id, label, icon}) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  // Clear editing booking when switching tabs (except to request tab)
                  if (id !== 'request') {
                    setEditingBooking(null);
                  }
                }}
                className={`nav-tab ${activeTab === id ? 'active' : ''}`}
              >
                {React.createElement(icon, { size: 20 })}
                {label}
                {/* Show indicator if editing a booking on request tab */}
                {id === 'request' && editingBooking && (
                  <span className="ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Editing
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Render active tab component */}
          {activeTab === 'overview' && <Overview
            user={user}
            pets={pets}
            bookings={bookings}
            getCustomerTypeDisplay={getCustomerTypeDisplay}
            getBookingStatusDisplay={getBookingStatusDisplay}
            formatDate={formatDate}
            formatTime={formatTime}
            getPetName={getPetName}
          />}
          
 
          {activeTab === 'pets' && <MyPets {...componentProps} />}
          {activeTab === 'bookings' && (
            <Bookings 
              {...componentProps} 
              pets={pets} 
              onEditBooking={(booking) => {
                setEditingBooking(booking);
                setActiveTab('request');
              }}
            />
          )}
          {activeTab === 'request' && (
            <SittingRequestPage 
              {...componentProps} 
              editingBooking={editingBooking}
              onEditComplete={() => setEditingBooking(null)}
            />
          )}
          
          {/* Sitter-specific tabs */}
          {activeTab === 'sitting-requests' && (
            <SittingRequests 
              {...componentProps}
            />
          )}
          {activeTab === 'sitting-jobs' && (
            <SittingJobs 
              {...componentProps}
            />
          )}
          
          {/* Profile tab */}
          {activeTab === 'profile' && (
            <Profile 
              user={currentUser} 
              getCustomerTypeDisplay={getCustomerTypeDisplay} 
              onEditProfile={handleEditProfile}
              onLogout={onLogout} 
            />
          )}
        </div>
      </div>

      {/* Edit Profile Modal - Render at top level */}
      {showEditModal && (
        <div>
          {console.log('Rendering EditProfile modal')}
          <EditProfile 
            user={currentUser}
            onClose={() => {
              console.log('Modal close requested');
              setShowEditModal(false);
            }}
            onSuccess={(message) => {
              console.log('Modal success:', message);
              setShowEditModal(false);
            }}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>
      )}

      <Footer/>
    </div>
  );
};

export default Dashboard;