import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Header.module.css';
import Logo from './Logo'; // Import the reusable Logo component

const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const navLinks = ["Features", "Pricing", "Testimonials", "FAQs"];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out.');
    }
  };

  return (
    <header className={styles.header}>
      <Logo /> {/* Use the new Logo component */}
      
      <nav className={styles.navigation}>
        {navLinks.map((link) => (
          <a key={link} href={`#${link.toLowerCase().replace(' ', '-')}`} className={styles.navLink}>
            {link}
          </a>
        ))}
      </nav>

      <div className={styles.buttonGroup}>
        {currentUser ? (
          <button onClick={handleLogout} className={styles.loginButton}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className={`${styles.loginButton} ${styles.linkButton}`}>Log In</Link>
            <Link to="/signup" className={`${styles.signupButton} ${styles.linkButton}`}>Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;