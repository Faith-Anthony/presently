import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // 1. Wait for Firebase to verify if a user is logged in
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. If not logged in, redirect to the Login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // 3. If logged in, render the protected page (Dashboard, Create Wishlist, etc.)
  return children;
};

export default PrivateRoute;