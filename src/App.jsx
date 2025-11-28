import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateWishlistPage from './pages/CreateWishlistPage';
import ManageItemsPage from './pages/ManageItemsPage';
// NEW: Import the View Page
import ViewWishlistPage from './pages/ViewWishlistPage';

// Styles
import './App.css'; 

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* NEW: View Wishlist (Public - Friends can see this!) */}
        <Route path="/wishlist/:id" element={<ViewWishlistPage />} />

        {/* --- Private Routes (Login Required) --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-wishlist" 
          element={
            <ProtectedRoute>
              <CreateWishlistPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/manage/:id" 
          element={
            <ProtectedRoute>
              <ManageItemsPage />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;