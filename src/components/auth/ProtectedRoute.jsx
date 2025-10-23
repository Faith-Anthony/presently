import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner'; // Import the spinner

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth(); // Get the loading state from our context

  // 1. If we are still checking for a user, show a loading spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. If the check is complete and there's NO user, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // 3. If the check is complete AND there IS a user, show the requested page
  return children;
};

export default ProtectedRoute;