import React, { useState, useEffect } from 'react';
import { Users, PawPrint, Calendar, Settings, BarChart3 } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import Header from '../components/homepage/Header';
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsers from '../components/admin/AdminUsers';
import AdminPets from '../components/admin/AdminPets';
import AdminBookings from '../components/admin/AdminBookings';
import Footer from '../components/homepage/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';

import '../css/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    users: [],
    pets: [],
    bookings: [],
    stats: {
      totalUsers: 0,
      totalPets: 0,
      totalBookings: 0,
      activeUsers: 0,
      pendingBookings: 0,
      completedBookings: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    if (user && user.roleName !== 'ADMIN') {
      // Redirect non-admin users
      window.location.href = '/dashboard';
    }
  }, [user]);

  const fetchAdminData = async () => {
    if (!user || user.roleName !== 'ADMIN') {
      console.log('fetchAdminData: User is not admin, skipping fetch');
      return;
    }
    
    console.log('fetchAdminData: Starting fetch for admin user:', user);
    setLoading(true);
    setError('');
    
    try {
      // Fetch all data concurrently
      const [usersResponse, petsResponse, bookingsResponse] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllPets(), 
        apiService.getAllBookings()
      ]);

      console.log('Admin data responses:', { usersResponse, petsResponse, bookingsResponse });

      const users = usersResponse.success ? usersResponse.data : [];
      const pets = petsResponse.success ? petsResponse.data : [];
      const bookings = bookingsResponse.success ? bookingsResponse.data : [];

      // Calculate stats
      const stats = {
        totalUsers: users.length,
        totalPets: pets.length,
        totalBookings: bookings.length,
        activeUsers: users.filter(u => u.isActive).length,
        pendingBookings: bookings.filter(b => b.statusName === 'PENDING').length,
        completedBookings: bookings.filter(b => b.statusName === 'COMPLETED').length,
        owners: users.filter(u => u.customerTypeName === 'OWNER').length,
        sitters: users.filter(u => u.customerTypeName === 'SITTER').length,
        inProgressBookings: bookings.filter(b => b.statusName === 'IN_PROGRESS').length,
        cancelledBookings: bookings.filter(b => b.statusName === 'CANCELLED').length
      };

      setDashboardData({
        users,
        pets,
        bookings,
        stats
      });

    } catch (generalError) {
      console.error('General error fetching admin data:', generalError);
      setError('Failed to load admin dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const refreshData = async () => {
    await fetchAdminData();
  };

  if (!user) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  if (user.roleName !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    const commonProps = {
      user,
      dashboardData,
      loading,
      error,
      refreshData
    };

    switch (activeTab) {
      case 'overview':
        return <AdminOverview {...commonProps} />;
      case 'users':
        return <AdminUsers {...commonProps} />;
      case 'pets':
        return <AdminPets {...commonProps} />;
      case 'bookings':
        return <AdminBookings {...commonProps} />;
      default:
        return <AdminOverview {...commonProps} />;
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
            <div className="admin-badge" style={{
              backgroundColor: '#dc3545',
              color: 'white',
              padding: ' 8px',
              borderRadius: '4px',
              fontSize: '12px',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              ADMINISTRATOR
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={20} />
              Overview
            </button>
            
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={20} />
              Users
            </button>
            
            <button
              className={`nav-item ${activeTab === 'pets' ? 'active' : ''}`}
              onClick={() => setActiveTab('pets')}
            >
              <PawPrint size={20} />
              Pets
            </button>
            
            <button
              className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={20} />
              Bookings
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
      
      <Footer currentUser={user} />
    </div>
  );
};

export default AdminDashboard;