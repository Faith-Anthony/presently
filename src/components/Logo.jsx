import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

const WishlistIcon = () => (
  <svg className={styles.icon} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path>
    <path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path>
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1-.9-2-2-2Z"></path>
  </svg>
);

const Logo = () => {
  return (
    <Link to="/" className={styles.logoLink}>
      <div className={styles.logoIconWrapper}>
        <WishlistIcon />
      </div>
      <h2 className={styles.logoText}>Presently</h2>
    </Link>
  );
};

export default Logo;