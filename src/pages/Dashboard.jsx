import React, { useState, useEffect } from 'react';
import { PawPrint, User, Settings, Calendar, Search, Briefcase } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider, useAuth } from '../contexts/AuthContext';
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
import LoadingSpinner from '../components/common/LoadingSpinner';

import '../css/Dashboard.css'; 

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching data for user:', user);
      
      // Fetch pets for owners
      if (user.customerTypeId === 1) {
        try {
          const petsResponse = await apiService.getPetsByOwner(user.id);
          if (petsResponse.success) {
            setPets(petsResponse.data || []);
          } else {
            setPets([]);
          }
        } catch (petsError) {
          console.warn('Error fetching pets:', petsError);
          setPets([]);
        }

        try {
          const ownerBookingsResponse = await apiService.getBookingsByOwner(user.id);
          if (ownerBookingsResponse.success) {
            setBookings(ownerBookingsResponse.data || []);
          } else {
            setBookings([]);
          }
        } catch (bookingsError) {
          console.warn('Error fetching owner bookings:', bookingsError);
          setBookings([]);
        }
      }
      
      // Fetch bookings for sitters
      if (user.customerTypeId === 2) {
        try {
          const sitterBookingsResponse = await apiService.getBookingsBySitter(user.id);
          if (sitterBookingsResponse.success) {
            setBookings(sitterBookingsResponse.data || []);
          } else {
            setBookings([]);
          }
        } catch (sitterBookingsError) {
          console.warn('Error fetching sitter bookings:', sitterBookingsError);
          setBookings([]);
        }
      }

    } catch (generalError) {
      console.error('General error fetching user data:', generalError);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  // This is the ONE refresh function we'll use everywhere
  const refreshData = async () => {
    await fetchUserData();
  };

  const getCustomerTypeDisplay = (customerTypeId) => {
    switch (customerTypeId) {
      case 1: return 'Pet Owner';
      case 2: return 'Pet Sitter';
      case 3: return 'Pet Owner & Sitter';
      default: return 'User';
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleProfileUpdate = async (updatedUser) => {
    updateUser(updatedUser);
    setShowEditModal(false);
    await refreshData(); // Refresh after profile update
  };

  if (!user) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const renderActiveTab = () => {
    const commonProps = {
      user,
      pets,
      bookings,
      loading,
      error,
      getCustomerTypeDisplay,
      refreshData // Pass the refresh function to ALL components
    };

    switch (activeTab) {
      case 'overview':
        return <Overview {...commonProps} />;
      case 'pets':
        return user.customerTypeId === 1 ? 
          <MyPets {...commonProps} /> : 
          <div className="no-access">This section is only available for pet owners.</div>;
      case 'bookings':
        return <Bookings {...commonProps} />;
      case 'profile':
        return (
          <Profile 
            {...commonProps}
            onEditProfile={handleEditProfile}
            onLogout={logout}
          />
        );
      case 'requests':
        return user.customerTypeId === 2 ? 
          <SittingRequestPage {...commonProps} /> : 
          <div className="no-access">This section is only available for pet sitters.</div>;
      case 'jobs':
        return user.customerTypeId === 2 ? 
          <SittingJobs {...commonProps} /> : 
          <div className="no-access">This section is only available for pet sitters.</div>;
      default:
        return <Overview {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={user} 
        onLogout={logout}
        isAuthenticated={true}
      />
      
      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>Dashboard</h2>
            <p>Welcome back, {user.firstName}!</p>
          </div>
          
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <PawPrint size={20} />
              Overview
            </button>
            
            {user.customerTypeId === 1 && (
              <button
                className={`nav-item ${activeTab === 'pets' ? 'active' : ''}`}
                onClick={() => setActiveTab('pets')}
              >
                <PawPrint size={20} />
                My Pets
              </button>
            )}
            
            <button
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={20} />
              Bookings
            </button>
            
            {user.customerTypeId === 2 && (
              <>
                <button
                  className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  <Search size={20} />
                  Browse Requests
                </button>
                
                <button
                  className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  <Briefcase size={20} />
                  My Jobs
                </button>
              </>
            )}
            
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              Profile
            </button>
          </nav>
        </div>
        
        <div className="dashboard-main">
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={refreshData} className="retry-button">
                Retry
              </button>
            </div>
          )}
          
          {renderActiveTab()}
        </div>
      </div>
      
      {showEditModal && (
        <EditProfile
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
          getCustomerTypeDisplay={getCustomerTypeDisplay}
        />
      )}
      
      <Footer currentUser={user} />
    </div>
  );
};

export default Dashboard;