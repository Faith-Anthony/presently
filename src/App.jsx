import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import WishlistDetailsPage from './pages/WishlistDetailsPage';
import CreateWishlistPage from './pages/CreateWishlistPage';
import ManageItemsPage from './pages/ManageItemsPage'; // 1. Import the correct page

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/wishlist/:id" element={<WishlistDetailsPage />} />

          {/* --- Protected Routes --- */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create-wishlist" element={<ProtectedRoute><CreateWishlistPage /></ProtectedRoute>} />

          {/* 2. UPDATE this route to use the new page */}
          <Route path="/wishlist/:id/manage" element={<ProtectedRoute><ManageItemsPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;