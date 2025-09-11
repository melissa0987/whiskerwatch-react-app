 
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PrivateRoute = ({ children, requireAuth = true, fallback = null }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return fallback || <div>Please log in to access this page.</div>;
  }

  // If authentication is not required and user is authenticated
  if (!requireAuth && isAuthenticated) {
    return fallback || <div>You are already logged in.</div>;
  }

  return children;
};

export default PrivateRoute;