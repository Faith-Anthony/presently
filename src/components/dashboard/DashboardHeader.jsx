import React from 'react';
import styles from './DashboardHeader.module.css';

const DashboardHeader = ({ userName }) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.welcomeMessage}>Welcome back, {userName}!</h1>
      <button className={styles.createButton}>Create New Wishlist</button>
    </div>
  );
};

export default DashboardHeader;