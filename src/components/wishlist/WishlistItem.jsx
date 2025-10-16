import React from 'react';
import styles from './WishlistItem.module.css';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const formatPrice = (price, currency = 'USD') => {
  if (!price || isNaN(price)) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
};

const WishlistItem = ({ item, onPick }) => {
  const { id, name, description, price, currency, vendorLink, imageUrl, status } = item;
  const displayPrice = formatPrice(price, currency);

  return (
    <div className={styles.card}>
      {imageUrl && (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={name} className={styles.image} />
        </div>
      )}
      <div className={styles.content}>
        <h4 className={styles.itemName}>{name}</h4>
        {description && <p className={styles.itemDescription}>{description}</p>}
        
        <div className={styles.details}>
          {displayPrice && <span className={styles.price}>{displayPrice}</span>}
          {vendorLink && <a href={vendorLink} target="_blank" rel="noopener noreferrer" className={styles.vendorLink}>View Store</a>}
        </div>

        {status === 'unpicked' ? (
          <button onClick={() => onPick(item)} className={styles.pickButton}>
            Pick this gift
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