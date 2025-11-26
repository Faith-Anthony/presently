import React from 'react';
import styles from './WishlistItem.module.css';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const formatPrice = (price, currency = 'USD') => {
  if (price === null || price === undefined || isNaN(Number(price))) return null;
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: currency }).format(Number(price));
  } catch (e) {
    return new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(Number(price));
  }
};

const WishlistItem = ({ item, onReserve, onUnreserve, isOwner, isReservedByMe }) => {
  const { name, description, price, currency, vendorLink, imageUrl, status, reservedBy } = item || {};
  const displayPrice = formatPrice(price, currency);
  const isReserved = status === 'reserved' || status === 'picked';

  return (
    <div className={`${styles.card} ${isReserved ? styles.reservedCard : ''}`}>
      {imageUrl && (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={name || 'Wishlist item'} className={styles.image} />
        </div>
      )}
      <div className={styles.content}>
        <h4 className={styles.itemName}>{name || 'Unnamed Item'}</h4>
        {description && <p className={styles.itemDescription}>{description}</p>}
        
        <div className={styles.details}>
          {displayPrice && <span className={styles.price}>{displayPrice}</span>}
          {vendorLink && <a href={vendorLink} target="_blank" rel="noopener noreferrer" className={styles.vendorLink}>View Store</a>}
        </div>

        {/* --- Button / Status Logic --- */}
        
        {isReserved ? (
          // CASE 1: Item IS reserved
          <>
            {isReservedByMe ? (
              // Sub-case A: Reserved by the current user -> Show Undo button
              <button 
                onClick={() => onUnreserve(item)} 
                className={styles.undoButton}
              >
                Undo Reservation (Reserved by You)
              </button>
            ) : (
              // Sub-case B: Reserved by someone else -> Show Status tag
              <div className={styles.reservedStatus}>
                <CheckIcon />
                <span>Reserved {reservedBy?.name ? `by ${reservedBy.name}` : ''}</span>
              </div>
            )}
          </>
        ) : isOwner ? (
          // CASE 2: Item NOT reserved, but Viewer IS Owner -> Show Status
          <div className={styles.unreservedStatus}>
            <span>Unreserved</span>
          </div>
        ) : (
          // CASE 3: Item NOT reserved, Viewer is Guest -> Show Reserve Button
          <button onClick={() => onReserve(item)} className={styles.reserveButton}>
            Reserve this Gift
          </button>
        )}

      </div>
    </div>
  );
};

export default WishlistItem;