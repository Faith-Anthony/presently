import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, collection, onSnapshot, query, orderBy, addDoc, deleteDoc, updateDoc, runTransaction } from 'firebase/firestore';
import toast from 'react-hot-toast';
import styles from './ManageItemsPage.module.css';

import ItemForm from '../components/dashboard/ItemForm';
import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';

const ManageItemsPage = () => {
  const { id: wishlistId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewItemForm, setShowNewItemForm] = useState(false);

  useEffect(() => {
    // Fetch and verify wishlist ownership
    const wishlistRef = doc(db, 'wishlists', wishlistId);
    getDoc(wishlistRef).then(docSnap => {
      if (docSnap.exists() && docSnap.data().userId === currentUser.uid) {
        setWishlist(docSnap.data());
      } else {
        navigate('/dashboard');
      }
    });

    // Listen for item changes
    const itemsRef = collection(db, 'wishlists', wishlistId, 'items');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [wishlistId, currentUser, navigate]);

  const updateItemCount = async (increment) => {
    const wishlistRef = doc(db, 'wishlists', wishlistId);
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(wishlistRef);
      if (!sfDoc.exists()) { throw "Document does not exist!"; }
      const newCount = (sfDoc.data().itemCount || 0) + increment;
      transaction.update(wishlistRef, { itemCount: Math.max(0, newCount) });
    });
  };

  const handleSaveItem = async (itemId, itemData) => {
    const itemRef = doc(db, 'wishlists', wishlistId, 'items', itemId);
    await updateDoc(itemRef, itemData);
    toast.success("Item saved!");
  };

  const handleDeleteItem = async (itemId) => {
    const itemRef = doc(db, 'wishlists', wishlistId, 'items', itemId);
    await deleteDoc(itemRef);
    await updateItemCount(-1);
    toast.success("Item deleted.");
  };

  const handleAddNewItem = async (itemData) => {
    if (items.length >= 5) {
      toast.error("Free Plan Limit: You can only have 5 items per wishlist.");
      return;
    }
    const itemsRef = collection(db, 'wishlists', wishlistId, 'items');
    await addDoc(itemsRef, { ...itemData, status: 'unpicked', createdAt: new Date() });
    await updateItemCount(1);
    setShowNewItemForm(false);
    toast.success("New item added!");
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button onClick={() => navigate('/dashboard')} className={styles.backButton}>&larr; Back to Dashboard</button>
        <h2>Manage Items for "{wishlist?.name}"</h2>
      </header>

      <div className={styles.itemsList}>
        <h3>Existing Items</h3>
        {items.map(item => (
          <ScrollAnimationWrapper key={item.id}>
            <ItemForm
              item={item}
              onSave={(itemData) => handleSaveItem(item.id, itemData)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          </ScrollAnimationWrapper>
        ))}
        {items.length === 0 && !showNewItemForm && <p className={styles.noItemsText}>No items yet. Click below to add one!</p>}
      </div>

      {!showNewItemForm ? (
        <button onClick={() => setShowNewItemForm(true)} className={styles.addNewButton}>+ Add New Item</button>
      ) : (
        <div className={styles.newItemSection}>
          <h3>New Item</h3>
          <ItemForm
            isNew={true}
            onSave={handleAddNewItem}
            onCancel={() => setShowNewItemForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ManageItemsPage;