import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Import Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ManageItemsPage from './pages/ManageItemsPage';
import ViewWishlistPage from './pages/ViewWishlistPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreateWishlistPage from './pages/CreateWishlistPage';

// Standard Auth Guard
const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6b7280' }}>
        Loading...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Public Wishlist View (No Auth Required) */}
      <Route path="/wishlist/:id" element={<ViewWishlistPage />} />

      {/* Private Routes (Require Login) */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      } />
      
      <Route path="/create-wishlist" element={
        <PrivateRoute>
          <CreateWishlistPage />
        </PrivateRoute>
      } />

      <Route path="/manage-items/:id" element={
        <PrivateRoute>
          <ManageItemsPage />
        </PrivateRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;