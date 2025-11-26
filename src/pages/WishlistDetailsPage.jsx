import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, collection, onSnapshot, query, orderBy, runTransaction, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import styles from './WishlistDetailsPage.module.css';
import WishlistItem from '../components/wishlist/WishlistItem';
import ReserveGiftModal from '../components/wishlist/ReserveGiftModal';
import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const WishlistDetailsPage = () => {
  const { id: wishlistId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isOwner, setIsOwner] = useState(false);

  // Track items reserved by THIS specific user (browser)
  const [userReservedItemIds, setUserReservedItemIds] = useState([]);

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [itemToReserve, setItemToReserve] = useState(null);

  // Load locally saved reservations on mount
  useEffect(() => {
    const storedIds = JSON.parse(localStorage.getItem('my_reserved_items') || '[]');
    setUserReservedItemIds(storedIds);
  }, []);

  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, "wishlists", wishlistId);

    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        const wishlistData = { id: docSnap.id, ...docSnap.data() };
        setWishlist(wishlistData);
        if (currentUser && currentUser.uid === wishlistData.userId) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } else {
        toast.error("Wishlist not found!");
        navigate('/');
      }
    }).catch(error => {
        console.error("Error fetching wishlist details:", error);
        toast.error("Could not load wishlist details.");
        navigate('/');
    });

    const itemsRef = collection(db, "wishlists", wishlistId, "items");
    const q = query(itemsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching items:", error);
        toast.error("Could not load items.");
        setLoading(false);
    });

    return () => unsubscribe();
  }, [wishlistId, navigate, currentUser]);

  const handleReserveItem = (item) => {
    if (isOwner) {
      toast.error("You cannot reserve items from your own wishlist.");
      return;
    }
    setItemToReserve(item);
    setIsReservationModalOpen(true);
  };

  // **NEW FUNCTION: Unreserve Item**
  const handleUnreserveItem = async (item) => {
    if (!confirm(`Are you sure you want to unreserve "${item.name}"? This will make it available for others to buy.`)) {
      return;
    }

    const loadingToast = toast.loading("Unreserving item...");
    const itemRef = doc(db, "wishlists", wishlistId, "items", item.id);

    try {
      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) throw "Item does not exist.";
        
        // Ensure we are only unreserving items that are actually reserved
        if (itemDoc.data().status !== 'reserved') {
            throw "Item is not currently reserved.";
        }

        transaction.update(itemRef, {
          status: 'unpicked',
          reservedBy: null, // Wipe details
          reservedAt: null
        });
      });

      // Update Local Storage
      const newIds = userReservedItemIds.filter(id => id !== item.id);
      setUserReservedItemIds(newIds);
      localStorage.setItem('my_reserved_items', JSON.stringify(newIds));

      toast.success("Reservation cancelled.", { id: loadingToast });

    } catch (error) {
      console.error("Unreserve failed:", error);
      toast.error("Failed to cancel reservation.", { id: loadingToast });
    }
  };

  const handleConfirmReservation = async ({ gifterName, phone, message }) => {
    if (!itemToReserve) return;

    setIsReservationModalOpen(false);
    const loadingToast = toast.loading("Reserving item...");

    const itemRef = doc(db, "wishlists", wishlistId, "items", itemToReserve.id);

    try {
      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) throw "Item no longer exists.";
        if (itemDoc.data().status !== 'unpicked') throw "This item has already been reserved by someone else.";
        
        transaction.update(itemRef, {
          status: 'reserved',
          reservedBy: {
            name: gifterName,
            phone: phone,
            message: message || '',
          },
          reservedAt: serverTimestamp(),
        });
      });

      // **UPDATE LOCAL STORAGE** on success
      const newIds = [...userReservedItemIds, itemToReserve.id];
      setUserReservedItemIds(newIds);
      localStorage.setItem('my_reserved_items', JSON.stringify(newIds));

      toast.success("Thanks for reserving! The recipient will appreciate it. 🎁", { id: loadingToast });

    } catch (error) {
      console.error("Reservation failed: ", error);
      if (typeof error === 'string' && error.includes("already been reserved")) {
        toast.error(error, { id: loadingToast });
      } else {
        toast.error("Could not reserve item. Please try again.", { id: loadingToast });
      }
    } finally {
        setItemToReserve(null);
    }
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'picked') return item.status === 'reserved' || item.status === 'picked';
    return false;
  });

  if (loading) return <LoadingSpinner />;
  if (!wishlist) return <div className={styles.loading}>Wishlist not found.</div>;

  return (
    <>
      <ReserveGiftModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        onConfirm={handleConfirmReservation}
        itemName={itemToReserve?.name}
      />
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            &larr; Back
          </button>
        </div>
        <main className={styles.content}>
          <div className={styles.wishlistInfo}>
            <h1>{wishlist.name}</h1>
            {wishlist.description && <p>{wishlist.description}</p>}
          </div>

          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>
              All Items ({items.length})
            </button>
            <button className={`${styles.tab} ${activeTab === 'picked' ? styles.active : ''}`} onClick={() => setActiveTab('picked')}>
              Reserved Items ({items.filter(i => i.status === 'reserved' || i.status === 'picked').length})
            </button>
          </div>

          <div className={styles.itemList}>
            {filteredItems.map(item => (
              <ScrollAnimationWrapper key={item.id}>
                <WishlistItem 
                  item={item} 
                  onReserve={handleReserveItem}
                  onUnreserve={handleUnreserveItem} // Pass the new function
                  isOwner={isOwner}
                  // Determine if THIS user reserved it
                  isReservedByMe={userReservedItemIds.includes(item.id)}
                />
              </ScrollAnimationWrapper>
            ))}
            {filteredItems.length === 0 && <p className={styles.noItems}>No items {activeTab === 'picked' ? 'reserved' : 'added'} yet.</p>}
          </div>
        </main>
      </div>
    </>
  );
};

export default WishlistDetailsPage;