import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import toast from 'react-hot-toast';
import styles from './DashboardNav.module.css';
import Logo from '../Logo'; // Reuse our Logo component

const DashboardNav = () => {
  const navigate = useNavigate();

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
    <nav className={styles.navContainer}>
      <div className={styles.navTop}>
        <div className={styles.logoWrapper}>
          <Logo />
        </div>
        <ul className={styles.navList}>
          <li><Link to="/dashboard" className={`${styles.navLink} ${styles.active}`}>My Lists</Link></li>
          <li><Link to="#" className={styles.navLink}>Explore</Link></li>
          <li><Link to="#" className={styles.navLink}>Friends</Link></li>
        </ul>
      </div>
      <div className={styles.navBottom}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default DashboardNav;