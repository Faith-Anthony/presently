import React from 'react';
import styles from './WishlistItem.module.css';

// Check icon for reserved status
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// Helper function to format currency based on code
const formatPrice = (price, currency = 'USD') => {
  // Ensure price is a valid number
  if (price === null || price === undefined || isNaN(Number(price))) return null;
  // Use 'en' locale for broad compatibility, adjust if needed
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: currency }).format(Number(price));
  } catch (e) {
    // Fallback if currency code is invalid or missing from Intl support
    console.warn("Invalid or unsupported currency code:", currency, "- Falling back to USD.");
    return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(Number(price));
  }
};

// Renamed onPick to onReserve for clarity
const WishlistItem = ({ item, onReserve }) => {
  // Destructure all relevant fields from the item object
  const { id, name, description, price, currency, vendorLink, imageUrl, status, reservedBy } = item || {}; // Added default object
  // Format the price using the helper function
  const displayPrice = formatPrice(price, currency);
  // Determine if the item is reserved (treat 'picked' as reserved for UI)
  const isReserved = status === 'reserved' || status === 'picked';

  return (
    // Add a CSS class if the item is reserved for styling
    <div className={`${styles.card} ${isReserved ? styles.reservedCard : ''}`}>
      {/* Conditionally render image if URL exists */}
      {imageUrl && (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={name || 'Wishlist item'} className={styles.image} />
        </div>
      )}
      <div className={styles.content}>
        {/* Item Name */}
        <h4 className={styles.itemName}>{name || 'Unnamed Item'}</h4>
        {/* Item Description (optional) */}
        {description && <p className={styles.itemDescription}>{description}</p>}

        {/* Price and Vendor Link Section */}
        <div className={styles.details}>
          {displayPrice && <span className={styles.price}>{displayPrice}</span>}
          {vendorLink && <a href={vendorLink} target="_blank" rel="noopener noreferrer" className={styles.vendorLink}>View Store</a>}
        </div>

        {/* Conditional rendering: Show Reserve button OR Reserved status */}
        {isReserved ? (
          <div className={styles.reservedStatus}>
            <CheckIcon />
            {/* Optionally show who reserved it */}
            <span>Reserved {reservedBy?.name ? `by ${reservedBy.name}` : ''}</span>
          </div>
        ) : (
          // Pass the full item object to the onReserve handler
          <button onClick={() => onReserve(item)} className={styles.reserveButton}>
            Reserve this Gift
          </button>
        )}
      </div>
    </div>
  );
};

export default WishlistItem;