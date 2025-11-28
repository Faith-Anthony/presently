import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import styles from './ViewWishlistPage.module.css';

const ViewWishlistPage = () => {
  const { id } = useParams();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const docRef = doc(db, 'wishlists', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setWishlist(docSnap.data());
        } else {
          setError('Wishlist not found.');
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError('Could not load wishlist.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [id]);

  if (loading) return <div className={styles.loadingContainer}>Loading Wishlist...</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <span className={styles.logoText}>Presently</span>
        </div>
        {/* Link back to the main site for visitors */}
        <Link to="/" className={styles.backLink}>Create Your Own Wishlist</Link>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.listHeader}>
          <h1>{wishlist.name}</h1>
          {wishlist.description && <p className={styles.description}>{wishlist.description}</p>}
          {wishlist.eventDate && (
            <div className={styles.eventDate}>
              Event Date: {new Date(wishlist.eventDate).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className={styles.itemsGrid}>
          {wishlist.items && wishlist.items.length > 0 ? (
            wishlist.items.map((item, index) => (
              <div key={index} className={styles.itemCard}>
                <div className={styles.itemIcon}>🎁</div>
                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  {item.price && <span className={styles.price}>{item.price}</span>}
                  
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.itemLink}>
                      View Online
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No items have been added to this wishlist yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewWishlistPage;