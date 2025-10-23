import React from 'react';
import styles from './WishlistItem.module.css';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// This function uses the currency code passed from the item data
const formatPrice = (price, currency = 'USD') => {
  if (!price || isNaN(price)) return null;
  // Use 'en' locale for broad compatibility, adjust if needed
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: currency }).format(price);
  } catch (e) {
    // Fallback if currency code is invalid
    console.warn("Invalid currency code:", currency);
    return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(price);
  }
};

const WishlistItem = ({ item, onPick }) => {
  const { id, name, description, price, currency, vendorLink, imageUrl, status } = item;
  // Pass the item's currency code to the formatter
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