import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import styles from './ViewWishlistPage.module.css';

const ViewWishlistPage = () => {
  const { id } = useParams();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Reserve Modal State
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [itemToReserve, setItemToReserve] = useState(null);
  const [reserverName, setReserverName] = useState('');

  // Toast Notification State
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const docRef = doc(db, 'wishlists', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (!data.items) data.items = [];
          setWishlist(data);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [id]);

  // Helper to show temporary notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Disappear after 3 seconds
  };

  const handleReserveClick = (item) => {
    setItemToReserve(item);
    setShowReserveModal(true);
  };

  const confirmReserve = async (e) => {
    e.preventDefault();
    if (!reserverName.trim() || !itemToReserve) return;

    try {
      // Create a new items array with the specific item updated
      const updatedItems = wishlist.items.map(item => {
        if (item.id === itemToReserve.id) {
          // Preserve any existing properties like 'purchased' or other metadata
          return { ...item, reserved: true, reservedBy: reserverName };
        }
        return item;
      });

      // Update Firestore
      await updateDoc(doc(db, 'wishlists', id), { items: updatedItems });
      
      // Update Local State
      setWishlist(prev => ({ ...prev, items: updatedItems }));
      
      // Close Modal & Reset
      setShowReserveModal(false);
      setReserverName('');
      setItemToReserve(null);
      
      // Show Success Toast
      showToast(`Success! You reserved the ${itemToReserve.name}`);

    } catch (error) {
      console.error("Error reserving:", error);
      showToast("Failed to reserve item. Please try again.", 'error');
    }
  };

  if (loading) return <div className={styles.loading}>Loading Wishlist...</div>;
  if (!wishlist) return <div className={styles.error}>Wishlist not found!</div>;

  return (
    <div className={styles.container}>
      {/* --- Toast Notification Component --- */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          {toast.message}
        </div>
      )}

      {/* --- Reserve Modal --- */}
      {showReserveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Reserve Item</h3>
            <p>Enter your name to reserve <strong>{itemToReserve?.name}</strong>.</p>
            <p className={styles.modalSubtext}>This lets others know it's been taken.</p>
            
            <form onSubmit={confirmReserve}>
              <input 
                type="text" 
                className={styles.modalInput}
                placeholder="Your Name (e.g. Aunt May)"
                value={reserverName}
                onChange={(e) => setReserverName(e.target.value)}
                required
              />
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowReserveModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.reserveConfirmBtn}>Confirm Reservation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1>{wishlist.name}</h1>
        <p>Event Date: {wishlist.eventDate ? new Date(wishlist.eventDate).toLocaleDateString() : 'TBA'}</p>
        {wishlist.category && <div className={styles.categoryBadge}>{wishlist.category}</div>}
        {wishlist.description && <p className={styles.description}>{wishlist.description}</p>}
      </div>

      <div className={styles.grid}>
        {wishlist.items.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No items have been added to this wishlist yet.</p>
          </div>
        ) : (
          wishlist.items.map((item, index) => (
            <div key={index} className={`${styles.card} ${item.reserved ? styles.cardReserved : ''}`}>
              <div className={styles.cardContent}>
                <h3>{item.name}</h3>
                {item.formattedPrice && <div className={styles.price}>{item.formattedPrice}</div>}
                {item.note && <p className={styles.note}>{item.note}</p>}
                
                <div className={styles.buttonStack}>
                  {/* View Link Button - ONLY renders if item.url exists and is not empty */}
                  {item.url && item.url.trim() !== "" && (
                    <a href={item.url} target="_blank" rel="noreferrer" className={styles.viewBtn}>
                      View Product
                    </a>
                  )}

                  {/* Reserve Button Logic */}
                  {item.reserved ? (
                    <button className={styles.reservedBtn} disabled>
                      Reserved by {item.reservedBy}
                    </button>
                  ) : (
                    <button onClick={() => handleReserveClick(item)} className={styles.reserveBtn}>
                      Reserve This Gift
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewWishlistPage;