import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, collection, onSnapshot, query, orderBy, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore'; // Import runTransaction, serverTimestamp
import toast from 'react-hot-toast';
import styles from './WishlistDetailsPage.module.css';
import WishlistItem from '../components/wishlist/WishlistItem';
import ReserveGiftModal from '../components/wishlist/ReserveGiftModal'; // Import the new modal
import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';
import LoadingSpinner from '../components/UI/LoadingSpinner'; // Import Spinner

const WishlistDetailsPage = () => {
  const { id: wishlistId } = useParams(); // Rename id to wishlistId for clarity
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // State for the reservation modal
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [itemToReserve, setItemToReserve] = useState(null); // Stores the full item object

  useEffect(() => {
    setLoading(true); // Ensure loading starts on ID change
    const docRef = doc(db, "wishlists", wishlistId);

    // Fetch the main wishlist document
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        setWishlist({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error("Wishlist not found!");
        navigate('/'); // Redirect home if wishlist doesn't exist
      }
    }).catch(error => {
        console.error("Error fetching wishlist details:", error);
        toast.error("Could not load wishlist details.");
        navigate('/');
    });

    // Set up a real-time listener for the items subcollection
    const itemsRef = collection(db, "wishlists", wishlistId, "items");
    const q = query(itemsRef, orderBy("createdAt", "asc")); // Order items by creation time

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false); // Stop loading once items are fetched
    }, (error) => {
        // Handle errors fetching items
        console.error("Error fetching items:", error);
        toast.error("Could not load items for this wishlist.");
        setLoading(false); // Stop loading on error
    });

    // Cleanup listener on component unmount or if wishlistId changes
    return () => unsubscribe();
  }, [wishlistId, navigate]); // Dependencies for useEffect

  // Function to open the reservation modal, passing the selected item
  const handleReserveItem = (item) => {
    setItemToReserve(item);
    setIsReservationModalOpen(true);
  };

  // Function to confirm reservation using a Firestore transaction
  const handleConfirmReservation = async ({ gifterName, phone, message }) => {
    if (!itemToReserve) return;

    setIsReservationModalOpen(false); // Close modal optimistically
    const loadingToast = toast.loading("Reserving item..."); // Show loading indicator

    const itemRef = doc(db, "wishlists", wishlistId, "items", itemToReserve.id);

    try {
      // Use a transaction to prevent race conditions (multiple people reserving at once)
      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) {
          throw "Item no longer exists."; // Handle deleted items
        }
        // Check if item is already reserved *within* the transaction
        if (itemDoc.data().status !== 'unpicked') {
          throw "This item has already been reserved by someone else.";
        }
        // If still unpicked, update the item document in the transaction
        transaction.update(itemRef, {
          status: 'reserved',
          reservedBy: { // Store gifter details
            name: gifterName,
            phone: phone,
            message: message || '',
          },
          reservedAt: serverTimestamp(), // Record when it was reserved
        });
      });

      // Show a more generic success message
      toast.success("Thanks for reserving! The recipient will appreciate it. 🎁", { id: loadingToast });

    } catch (error) {
      console.error("Reservation transaction failed: ", error);
      // Show specific error if it was already reserved, generic otherwise
      if (typeof error === 'string' && error.includes("already been reserved")) {
        toast.error(error, { id: loadingToast });
      } else {
        toast.error("Could not reserve item. Please try again.", { id: loadingToast });
      }
    } finally {
        setItemToReserve(null); // Clear the selected item state
    }
  };

  // Filter items based on the active tab
  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    // Show items marked as 'reserved' or 'picked' (legacy status) in the 'Picked Items' tab
    if (activeTab === 'picked') return item.status === 'reserved' || item.status === 'picked';
    return false; // Should not happen with current tabs
  });

  // Display loading spinner while data is fetching
  if (loading) return <LoadingSpinner />;
  // Display message if wishlist data couldn't be loaded
  if (!wishlist) return <div className={styles.loading}>Wishlist not found or could not be loaded.</div>;

  return (
    <>
      {/* Reservation Modal */}
      <ReserveGiftModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        onConfirm={handleConfirmReservation}
        itemName={itemToReserve?.name} // Pass item name to modal title
      />

      {/* Main Page Content */}
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          {/* Back button */}
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            &larr; Back
          </button>
        </div>
        <main className={styles.content}>
          {/* Wishlist Title and Description */}
          <div className={styles.wishlistInfo}>
            <h1>{wishlist.name}</h1>
            {wishlist.description && <p>{wishlist.description}</p>}
          </div>

          {/* Tabs for Filtering */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Items ({items.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'picked' ? styles.active : ''}`}
              onClick={() => setActiveTab('picked')}
            >
              Reserved Items ({items.filter(i => i.status === 'reserved' || i.status === 'picked').length})
            </button>
          </div>

          {/* Grid of Wishlist Items */}
          <div className={styles.itemList}>
            {filteredItems.map(item => (
              <ScrollAnimationWrapper key={item.id}>
                {/* Pass handleReserveItem function to each item card */}
                <WishlistItem item={item} onReserve={handleReserveItem} />
              </ScrollAnimationWrapper>
            ))}
            {/* Message if no items match the current filter */}
            {filteredItems.length === 0 && <p className={styles.noItems}>No items {activeTab === 'picked' ? 'reserved' : 'added'} yet.</p>}
          </div>
        </main>
      </div>
    </>
  );
};

export default WishlistDetailsPage;