import React from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardHeader.module.css';
import toast from 'react-hot-toast';

const DashboardHeader = ({ userName, canCreate }) => {

  const handleLimitClick = () => {
    toast.error("You've reached your 2-wishlist limit on the Free Plan.");
  };

  return (
    <div className={styles.header}>
      <h1 className={styles.welcomeMessage}>Welcome back, {userName}!</h1>
      
      {canCreate ? (
        <Link to="/create-wishlist" className={styles.createButton}>
          Create New Wishlist
        </Link>
      ) : (
        <button className={styles.createButtonDisabled} onClick={handleLimitClick}>
          Create New Wishlist
        </button>
      )}
    </div>
  );
};

export default DashboardHeader;