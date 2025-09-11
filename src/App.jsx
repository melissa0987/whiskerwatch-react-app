import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

// Main App Content Component
const AppContent = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <Dashboard user={user} onLogout={logout} />
      ) : (
        <Homepage />
      )}
    </div>
  );
};

// Main App Component with Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;