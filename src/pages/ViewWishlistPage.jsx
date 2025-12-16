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
  const [itemToInteract, setItemToInteract] = useState(null); // Renamed from itemToReserve
  const [reserverName, setReserverName] = useState('');
  const [reserverPin, setReserverPin] = useState(''); // NEW: PIN for security
  
  // Unreserve Modal State
  const [showUnreserveModal, setShowUnreserveModal] = useState(false);
  const [unreservePin, setUnreservePin] = useState('');
  
  // Success State
  const [reservationSuccess, setReservationSuccess] = useState(false);
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

  const formatDate = (dateVal) => {
    if (!dateVal) return 'TBA';
    if (dateVal.toDate && typeof dateVal.toDate === 'function') return dateVal.toDate().toLocaleDateString();
    const date = new Date(dateVal);
    return isNaN(date.getTime()) ? 'TBA' : date.toLocaleDateString();
  };

  const getGoogleCalendarUrl = () => {
    if (!wishlist || !wishlist.eventDate || !itemToInteract) return null;
    let dateObj = wishlist.eventDate.toDate ? wishlist.eventDate.toDate() : new Date(wishlist.eventDate);
    if (isNaN(dateObj.getTime())) return null;
    const dateStr = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
    const title = encodeURIComponent(`Buy Gift: ${itemToInteract.name}`);
    const details = encodeURIComponent(`Reminder to buy the gift for ${wishlist.name}. Reserved on Presently.`);
    const location = encodeURIComponent("See Wishlist Link");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}&location=${location}`;
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- ACTIONS ---

  const handleReserveClick = (item) => {
    setItemToInteract(item);
    setReservationSuccess(false);
    setShowReserveModal(true);
    setReserverName('');
    setReserverPin('');
  };

  const handleUnreserveClick = (item) => {
    setItemToInteract(item);
    setShowUnreserveModal(true);
    setUnreservePin('');
  };

  const handleCloseModals = () => {
    setShowReserveModal(false);
    setShowUnreserveModal(false);
    setReservationSuccess(false);
    setItemToInteract(null);
  };

  const confirmReserve = async (e) => {
    e.preventDefault();
    if (!reserverName.trim() || !itemToInteract || reserverPin.length < 4) {
      showToast("Please enter a name and a 4-digit PIN.", 'error');
      return;
    }

    try {
      const updatedItems = wishlist.items.map(item => {
        if (item.id === itemToInteract.id) {
          // Store the PIN with the item (in a real app, you might hash this, but simple is okay for this use case)
          return { 
            ...item, 
            reserved: true, 
            reservedBy: reserverName,
            reservationPin: reserverPin 
          };
        }
        return item;
      });

      await updateDoc(doc(db, 'wishlists', id), { items: updatedItems });
      setWishlist(prev => ({ ...prev, items: updatedItems }));
      setReservationSuccess(true);
      
    } catch (error) {
      console.error("Error reserving:", error);
      showToast("Failed to reserve item.", 'error');
    }
  };

  const confirmUnreserve = async (e) => {
    e.preventDefault();
    if (!itemToInteract) return;

    // Verify PIN
    if (itemToInteract.reservationPin && itemToInteract.reservationPin !== unreservePin) {
      showToast("Incorrect PIN. Cannot unreserve.", 'error');
      return;
    }

    try {
      const updatedItems = wishlist.items.map(item => {
        if (item.id === itemToInteract.id) {
          // Clear reservation data
          const { reserved, reservedBy, reservationPin, ...rest } = item;
          return { ...rest, reserved: false };
        }
        return item;
      });

      await updateDoc(doc(db, 'wishlists', id), { items: updatedItems });
      setWishlist(prev => ({ ...prev, items: updatedItems }));
      setShowUnreserveModal(false);
      showToast("Item unreserved successfully.");
      
    } catch (error) {
      console.error("Error unreserving:", error);
      showToast("Failed to unreserve item.", 'error');
    }
  };

  if (loading) return <div className={styles.loading}>Loading Wishlist...</div>;
  if (!wishlist) return <div className={styles.error}>Wishlist not found!</div>;

  return (
    <div className={styles.container}>
      {toast && <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>{toast.message}</div>}

      {/* --- RESERVE MODAL --- */}
      {showReserveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            {!reservationSuccess ? (
              <>
                <h3>Reserve Item</h3>
                <p>Reserving: <strong>{itemToInteract?.name}</strong></p>
                
                <form onSubmit={confirmReserve}>
                  <input 
                    type="text" 
                    className={styles.modalInput}
                    placeholder="Your Name"
                    value={reserverName}
                    onChange={(e) => setReserverName(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    pattern="\d*" 
                    maxLength="4"
                    className={styles.modalInput}
                    placeholder="Create a 4-digit PIN (if you want to unreserve this item)"
                    value={reserverPin}
                    onChange={(e) => setReserverPin(e.target.value)}
                    required
                  />
                  <div className={styles.modalActions}>
                    <button type="button" onClick={handleCloseModals} className={styles.cancelBtn}>Cancel</button>
                    <button type="submit" className={styles.reserveConfirmBtn}>Confirm</button>
                  </div>
                </form>
              </>
            ) : (
              <div className={styles.successView}>
                <div className={styles.checkIcon}>✓</div>
                <h3>Reserved!</h3>
                <p>Thanks {reserverName}!</p>
                <p className={styles.pinReminder}>Remember your PIN: <strong>{reserverPin}</strong></p>
                {wishlist.eventDate && getGoogleCalendarUrl() && (
                  <a href={getGoogleCalendarUrl()} target="_blank" rel="noreferrer" className={styles.calendarBtn}>
                    📅 Add to Calendar
                  </a>
                )}
                <button onClick={handleCloseModals} className={styles.closeSuccessBtn}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- UNRESERVE MODAL --- */}
      {showUnreserveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Unreserve Item</h3>
            <p>To release <strong>{itemToInteract?.name}</strong>, enter the PIN you created.</p>
            
            <form onSubmit={confirmUnreserve}>
              <input 
                type="text" 
                pattern="\d*" 
                maxLength="4"
                className={styles.modalInput}
                placeholder="Enter 4-digit PIN"
                value={unreservePin}
                onChange={(e) => setUnreservePin(e.target.value)}
                required
              />
              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModals} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.reserveConfirmBtn}>Unreserve</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PAGE CONTENT --- */}
      <div className={styles.header}>
        <h1>{wishlist.name}</h1>
        <p>Event Date: {formatDate(wishlist.eventDate)}</p>
        {wishlist.category && <div className={styles.categoryBadge}>{wishlist.category}</div>}
        {wishlist.description && <p className={styles.description}>{wishlist.description}</p>}
      </div>

      <div className={styles.grid}>
        {wishlist.items.length === 0 ? (
          <div className={styles.emptyState}><p>No items yet.</p></div>
        ) : (
          wishlist.items.map((item, index) => (
            <div key={index} className={`${styles.card} ${item.reserved ? styles.cardReserved : ''}`}>
              <div className={styles.cardContent}>
                <h3>{item.name}</h3>
                {item.formattedPrice && <div className={styles.price}>{item.formattedPrice}</div>}
                {item.note && <p className={styles.note}>{item.note}</p>}
                
                <div className={styles.buttonStack}>
                  {item.url && item.url.trim() !== "" && (
                    <a href={item.url} target="_blank" rel="noreferrer" className={styles.viewBtn}>View Product</a>
                  )}

                  {item.reserved ? (
                    <button 
                      onClick={() => handleUnreserveClick(item)} // Allow clicking to open Unreserve modal
                      className={styles.reservedBtn}
                    >
                      Reserved by {item.reservedBy} (Undo?)
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