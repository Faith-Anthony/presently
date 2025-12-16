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
  
  // Success State for Modal
  const [reservationSuccess, setReservationSuccess] = useState(false);

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

  // --- Helper: Safely Format Date ---
  const formatDate = (dateVal) => {
    if (!dateVal) return 'TBA';
    // Handle Firestore Timestamp
    if (dateVal.toDate && typeof dateVal.toDate === 'function') {
      return dateVal.toDate().toLocaleDateString();
    }
    // Handle String or standard Date Object
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return 'TBA';
    return date.toLocaleDateString();
  };

  // --- Helper: Generate Google Calendar Link ---
  const getGoogleCalendarUrl = () => {
    if (!wishlist || !wishlist.eventDate || !itemToReserve) return null;

    // Format date to YYYYMMDD for Google (All day event)
    const dateObj = new Date(wishlist.eventDate);
    if (isNaN(dateObj.getTime())) return null;

    const dateStr = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
    
    const title = encodeURIComponent(`Buy Gift: ${itemToReserve.name}`);
    const details = encodeURIComponent(`Reminder to buy the gift for ${wishlist.name}. Reserved on Presently.`);
    const location = encodeURIComponent("See Wishlist Link");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}&location=${location}`;
  };

  // --- Helper: Toast Notification ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Disappear after 3 seconds
  };

  const handleReserveClick = (item) => {
    setItemToReserve(item);
    setReservationSuccess(false); // Reset success state
    setShowReserveModal(true);
  };

  // Close everything and reset
  const handleCloseModal = () => {
    setShowReserveModal(false);
    setReservationSuccess(false);
    setReserverName('');
    setItemToReserve(null);
  };

  const confirmReserve = async (e) => {
    e.preventDefault();
    if (!reserverName.trim() || !itemToReserve) return;

    try {
      // Optimistic UI Update logic
      const updatedItems = wishlist.items.map(item => {
        if (item.id === itemToReserve.id) {
          return { ...item, reserved: true, reservedBy: reserverName };
        }
        return item;
      });

      await updateDoc(doc(db, 'wishlists', id), { items: updatedItems });
      setWishlist(prev => ({ ...prev, items: updatedItems }));
      
      // Instead of closing, switch to Success View
      setReservationSuccess(true);
      
    } catch (error) {
      console.error("Error reserving:", error);
      showToast("Failed to reserve item. Please try again.", 'error');
    }
  };

  if (loading) return <div className={styles.loading}>Loading Wishlist...</div>;
  if (!wishlist) return <div className={styles.error}>Wishlist not found!</div>;

  return (
    <div className={styles.container}>
      {/* --- Toast Notification --- */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          {toast.message}
        </div>
      )}

      {/* --- Reserve Modal --- */}
      {showReserveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            
            {!reservationSuccess ? (
              // 1. FORM VIEW
              <>
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
                    <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>Cancel</button>
                    <button type="submit" className={styles.reserveConfirmBtn}>Confirm Reservation</button>
                  </div>
                </form>
              </>
            ) : (
              // 2. SUCCESS VIEW (With Calendar Button)
              <div className={styles.successView}>
                <div className={styles.checkIcon}>✓</div>
                <h3>Reserved Successfully!</h3>
                <p>Thanks {reserverName}! You have reserved <strong>{itemToReserve?.name}</strong>.</p>
                
                {wishlist.eventDate && getGoogleCalendarUrl() && (
                  <a 
                    href={getGoogleCalendarUrl()} 
                    target="_blank" 
                    rel="noreferrer"
                    className={styles.calendarBtn}
                  >
                    📅 Add Reminder to Google Calendar
                  </a>
                )}

                <button onClick={handleCloseModal} className={styles.closeSuccessBtn}>
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- Header --- */}
      <div className={styles.header}>
        <h1>{wishlist.name}</h1>
        <p>Event Date: {formatDate(wishlist.eventDate)}</p>
        {wishlist.category && <div className={styles.categoryBadge}>{wishlist.category}</div>}
        {wishlist.description && <p className={styles.description}>{wishlist.description}</p>}
      </div>

      {/* --- Items Grid --- */}
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