import React from 'react';
import styles from './WishlistItem.module.css';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const WishlistItem = ({ item, onPick }) => {
  const { id, name, imageUrl, status } = item;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={name} className={styles.image} />
      </div>
      <div className={styles.content}>
        <h4 className={styles.itemName}>{name}</h4>
        {status === 'unpicked' ? (
          <button onClick={() => onPick(id)} className={styles.pickButton}>
            Pick this item
          </button>
        ) : (
          <div className={styles.pickedStatus}>
            <CheckIcon />
            <span>Picked!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistItem;