import React from 'react';
import styles from './WishlistCard.module.css';

const WishlistCard = ({ wishlist }) => {
  const { title, date, itemCount } = wishlist;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.date}>{formattedDate}</p>
      <div className={styles.footer}>
        <span className={styles.itemCount}>{itemCount} items</span>
        <a href="#" className={styles.viewLink}>View</a>
      </div>
    </div>
  );
};

export default WishlistCard;