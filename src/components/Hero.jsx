import React from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Create & Share Your Perfect Wishlist
        </h1>
        <p className={styles.subtitle}>
          Plan your dream events with ease. From birthdays to weddings, Presently helps you curate and share your ideal gifts with friends and family.
        </p>
        {/* 2. Replace <button> with <Link> */}
        <Link to="/signup" className={styles.ctaButton}>
          Get Started for Free
        </Link>
      </div>
    </section>
  );
};

export default Hero;