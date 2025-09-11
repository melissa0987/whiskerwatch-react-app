// App.jsx - Fixed with proper routing and error handling
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoadingSpinner from './components/common/LoadingSpinner'; 

// Route for Admin
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  //
  if (user?.roleName !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


const UserRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }


  if (user?.roleName === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// App Router Component
const AppRouter = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            user?.roleName === 'ADMIN' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Homepage />
          )
        } 
      />

      {/* User Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <UserRoute>
            <Dashboard />
          </UserRoute>
        }
      />

      {/* Admin Dashboard Route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={
              isAuthenticated 
                ? (user?.roleName === 'ADMIN' ? '/admin' : '/dashboard')
                : '/'
            } 
            replace 
          />
        } 
      />
    </Routes>
  );
};

// Alternative: Simple App Content (if you prefer no routing)
const AppContent = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        // Fixed: Check roleName, not roleid
        user?.roleName === 'ADMIN' ? (
          <AdminDashboard user={user} onLogout={logout} />
        ) : (
          <Dashboard user={user} onLogout={logout} />
        )
      ) : (
        <Homepage />
      )}
    </div>
  );
};

// Main App Component - Choose ONE of these approaches:

 
const App = () => {
  return ( 
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRouter />
          </div>
        </Router>
      </AuthProvider> 
  );
}; 

export default App;