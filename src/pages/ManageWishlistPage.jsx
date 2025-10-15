import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, collection, onSnapshot, query, orderBy, addDoc, deleteDoc, runTransaction } from 'firebase/firestore';
import toast from 'react-hot-toast';
import styles from './ManageWishlistPage.module.css';

import ManageItemCard from '../components/dashboard/ManageItemCard';
import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';

const ManageWishlistPage = () => {
  const { id } = useParams(); // Wishlist ID from URL
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the "Add New Item" form
  const [newItemName, setNewItemName] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  // Effect to fetch wishlist and its items
  useEffect(() => {
    if (!currentUser) return;
    
    const wishlistRef = doc(db, 'wishlists', id);
    getDoc(wishlistRef).then(docSnap => {
      if (docSnap.exists() && docSnap.data().userId === currentUser.uid) {
        setWishlist(docSnap.data());
      } else {
        toast.error("Wishlist not found or access denied.");
        navigate('/dashboard');
      }
    });

    const itemsRef = collection(db, 'wishlists', id, 'items');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, currentUser, navigate]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (items.length >= 5) {
      toast.error("Free Plan Limit: You can only have 5 items per wishlist.");
      return;
    }
    setAddingItem(true);
    try {
      const itemsRef = collection(db, 'wishlists', id, 'items');
      await addDoc(itemsRef, {
        name: newItemName,
        status: 'unpicked',
        createdAt: new Date(),
        wishlistId: id,
      });
      // Use a transaction to safely update the item count
      const wishlistRef = doc(db, 'wishlists', id);
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(wishlistRef);
        if (!sfDoc.exists()) {
          throw "Document does not exist!";
        }
        const newCount = (sfDoc.data().itemCount || 0) + 1;
        transaction.update(wishlistRef, { itemCount: newCount });
      });

      setNewItemName('');
      toast.success("Item added!");
    } catch (error) {
      toast.error("Failed to add item.");
      console.error(error);
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const itemRef = doc(db, 'wishlists', id, 'items', itemId);
      await deleteDoc(itemRef);

      const wishlistRef = doc(db, 'wishlists', id);
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(wishlistRef);
        if (!sfDoc.exists()) {
          throw "Document does not exist!";
        }
        const newCount = Math.max(0, (sfDoc.data().itemCount || 1) - 1);
        transaction.update(wishlistRef, { itemCount: newCount });
      });
      
      toast.success("Item deleted.");
    } catch (error) {
      toast.error("Failed to delete item.");
      console.error(error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
          &larr; Back to Dashboard
        </button>
        <h2>Manage Items for "{wishlist?.name}"</h2>
      </header>

      <div className={styles.content}>
        <div className={styles.addItemSection}>
          <h3>Add a New Item</h3>
          <form onSubmit={handleAddItem} className={styles.addItemForm}>
            <input 
              type="text" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)} 
              placeholder="Enter item name"
              required 
            />
            <button type="submit" disabled={addingItem}>
              {addingItem ? 'Adding...' : 'Add Item'}
            </button>
          </form>
        </div>

        <hr className={styles.divider} />

        <div className={styles.existingItemsSection}>
          <h3>Existing Items ({items.length})</h3>
          {items.length > 0 ? (
            <div className={styles.itemsGrid}>
              {items.map(item => (
                <ScrollAnimationWrapper key={item.id}>
                  <ManageItemCard item={item} onDelete={handleDeleteItem} />
                </ScrollAnimationWrapper>
              ))}
            </div>
          ) : (
            <p className={styles.noItemsText}>You haven't added any items to this wishlist yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageWishlistPage;