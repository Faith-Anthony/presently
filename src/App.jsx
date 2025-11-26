import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts & Pages
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateWishlistPage from './pages/CreateWishlistPage';
import WishlistDetailsPage from './pages/WishlistDetailsPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        {/* Landing Page with Header/Footer */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />

        {/* Auth Pages - NO LAYOUT (No Header/Footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes (Require Login + Layout) */}
        <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
        <Route path="/create-wishlist" element={<PrivateRoute><Layout><CreateWishlistPage /></Layout></PrivateRoute>} />

        {/* Public Wishlist View */}
        <Route path="/presently/:name/:id" element={<Layout><WishlistDetailsPage /></Layout>} />
        <Route path="/wishlist/:id" element={<Layout><WishlistDetailsPage /></Layout>} />
      </Routes>
    </>
  );
}

export default App;