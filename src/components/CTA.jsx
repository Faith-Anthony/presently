import React from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import styles from './CTA.module.css';

const CTA = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Ready to Create Your Dream Wishlist?
        </h2>
        <p className={styles.subtitle}>
          Sign up today and start planning your perfect event with Wishlistr. It's free to get started!
        </p>
        {/* 2. Replace <button> with <Link> */}
        <Link to="/signup" className={styles.button}>
          Get Started Now
        </Link>
      </div>
    </section>
  );
};

export default CTA;