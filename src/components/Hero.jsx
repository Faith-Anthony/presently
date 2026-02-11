import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <div className={styles.heroSection}>
      {/* Animated Background Layer */}
      <div className={styles.animatedBg}>
        <div className={`${styles.floatingObj} ${styles.obj1}`}>🎁</div>
        <div className={`${styles.floatingObj} ${styles.obj2}`}>✨</div>
        <div className={`${styles.floatingObj} ${styles.obj3}`}>🎈</div>
        <div className={`${styles.floatingObj} ${styles.obj4}`}>🎁</div>
        <div className={`${styles.floatingObj} ${styles.obj5}`}>✨</div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <h1 className={styles.heroTitle}>Make Wishes Come True.</h1>
        <p className={styles.heroSubtitle}>
          Create, share, and manage your dream wishlists with ease. No more guessing games.
        </p>
        <Link to="/dashboard" className={styles.heroBtn}>
          Get Started for Free
        </Link>
      </div>
    </div>
  );
};

export default Hero;