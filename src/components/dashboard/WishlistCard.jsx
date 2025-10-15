import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WishlistCard.module.css';
import toast from 'react-hot-toast';

const WishlistCard = ({ wishlist }) => {
  const { id, name, eventDate, itemCount } = wishlist || {};

  const formattedDate = eventDate && typeof eventDate.toDate === 'function' 
    ? eventDate.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No date set';

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/wishlist/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{name || 'Untitled Wishlist'}</h3>
      <p className={styles.date}>{formattedDate}</p>
      <div className={styles.footer}>
        <span className={styles.itemCount}>{itemCount || 0} items</span>
        <div className={styles.buttonGroup}>
          <button onClick={handleShare} className={styles.actionButton}>Share</button>
          <Link to={`/wishlist/${id}/manage`} className={styles.actionButton}>Manage</Link>
          <Link to={`/wishlist/${id}`} className={styles.viewLink}>View</Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;