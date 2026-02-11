import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Pricing.module.css';

const Pricing = () => {
  return (
    <div className={styles.pricingSection}>
      <h2 className={styles.sectionTitle}>Choose Your Plan</h2>
      <div className={styles.pricingGrid}>
        
        {/* STARTER (Free) */}
        <div className={styles.priceCard}>
          <h3 className={styles.tierName}>Starter</h3>
          <div className={styles.priceAmount}>$0<span className={styles.period}>/mo</span></div>
          <p className={styles.tierDesc}>Perfect for trying things out.</p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>✅ 2 Active Wishlists</li>
            <li className={styles.featureItem}>✅ 5 Items per List</li>
            <li className={styles.featureItem}>✅ Basic Sharing</li>
          </ul>
          <Link to="/dashboard" className={styles.cardBtnOutline}>Start Free</Link>
        </div>

        {/* STANDARD */}
        <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <h3 className={styles.tierName}>Standard</h3>
          <div className={styles.priceAmount}>$5<span className={styles.period}>/mo</span></div>
          <p className={styles.tierDesc}>For the avid wish-lister.</p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>✅ Unlimited Wishlists</li>
            <li className={styles.featureItem}>✅ 50 Items per List</li>
            <li className={styles.featureItem}>✅ Password Protection</li>
          </ul>
          <button className={styles.cardBtnFill} onClick={() => alert("Standard plan coming soon!")}>
            Go Standard
          </button>
        </div>

        {/* PREMIUM */}
        <div className={styles.priceCard}>
          <h3 className={styles.tierName}>Premium</h3>
          <div className={styles.priceAmount}>$12<span className={styles.period}>/mo</span></div>
          <p className={styles.tierDesc}>The ultimate experience.</p>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>✅ Unlimited Everything</li>
            <li className={styles.featureItem}>✅ Custom Themes</li>
            <li className={styles.featureItem}>✅ Priority Support</li>
          </ul>
          <button className={styles.cardBtnOutline} onClick={() => alert("Premium plan coming soon!")}>
            Go Premium
          </button>
        </div>

      </div>
    </div>
  );
};

export default Pricing;