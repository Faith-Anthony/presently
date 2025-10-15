import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, collection, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import styles from './WishlistDetailsPage.module.css';
import WishlistItem from '../components/wishlist/WishlistItem';
import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';

const WishlistDetailsPage = () => {
  const { id } = useParams(); // Get the wishlist ID from the URL
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Effect to fetch wishlist details and its items
  useEffect(() => {
    const docRef = doc(db, "wishlists", id);

    // Fetch the main wishlist document
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        setWishlist({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error("Wishlist not found!");
        navigate('/dashboard');
      }
    });

    // Set up a real-time listener for the items subcollection
    const itemsRef = collection(db, "wishlists", id, "items");
    const q = query(itemsRef, orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedItems = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() });
      });
      setItems(fetchedItems);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [id, navigate]);

  const handlePickItem = async (itemId) => {
    try {
      const itemRef = doc(db, "wishlists", id, "items", itemId);
      await updateDoc(itemRef, {
        status: 'picked'
      });
      toast.success("You've picked an item!");
    } catch (error) {
      toast.error("Could not pick item. Please try again.");
      console.error(error);
    }
  };
  
  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'picked') return item.status === 'picked';
    return false;
  });

  if (loading) {
    return <div className={styles.loading}>Loading Wishlist...</div>;
  }

  if (!wishlist) {
    return <div className={styles.loading}>Wishlist not found.</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          &larr; Back
        </button>
      </div>
      <main className={styles.content}>
        <div className={styles.wishlistInfo}>
          <h1>{wishlist.name}</h1>
          <p>{wishlist.description}</p>
        </div>
        
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`} onClick={() => setActiveTab('all')}>All Items</button>
          <button className={`${styles.tab} ${activeTab === 'picked' ? styles.active : ''}`} onClick={() => setActiveTab('picked')}>Picked Items</button>
        </div>

        <div className={styles.itemList}>
          {filteredItems.map(item => (
            <ScrollAnimationWrapper key={item.id}>
              <WishlistItem item={item} onPick={handlePickItem} />
            </ScrollAnimationWrapper>
          ))}
          {filteredItems.length === 0 && <p className={styles.noItems}>No items in this category yet.</p>}
        </div>
      </main>
    </div>
  );
};

export default WishlistDetailsPage;