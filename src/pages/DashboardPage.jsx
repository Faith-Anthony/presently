import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import styles from './DashboardPage.module.css';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardNav from '../components/dashboard/DashboardNav';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import WishlistCard from '../components/dashboard/WishlistCard';
import UpgradePrompt from '../components/dashboard/UpgradePrompt';
import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [wishlistToDelete, setWishlistToDelete] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false); return;
    }
    setLoading(true); setError(null);
    const wishlistsRef = collection(db, 'wishlists');
    const q = query(
      wishlistsRef,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userWishlists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishlists(userWishlists);
      setLoading(false);
    }, (err) => {
      console.error("Firestore query error:", err);
      setError("Could not fetch wishlists. Please try refreshing.");
      toast.error("Could not fetch your wishlists.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  const canCreateMore = wishlists.length < 2;

  // Function to open the delete confirmation modal
  const handleDeleteWishlist = (wishlist) => {
    setWishlistToDelete(wishlist);
    setShowDeleteConfirm(true);
  };

  // Function to perform the actual deletion
  const confirmDeleteWishlist = async () => {
    if (!wishlistToDelete) return;
    setShowDeleteConfirm(false);
    const loadingToastId = toast.loading("Deleting wishlist...");
    try {
      const itemsRef = collection(db, 'wishlists', wishlistToDelete.id, 'items');
      const itemsSnapshot = await getDocs(itemsRef);
      const batch = writeBatch(db);
      itemsSnapshot.forEach((doc) => { batch.delete(doc.ref); });
      await batch.commit();

      const wishlistRef = doc(db, 'wishlists', wishlistToDelete.id);
      await deleteDoc(wishlistRef);
      toast.success(`'${wishlistToDelete.name}' deleted successfully.`, { id: loadingToastId });
    } catch (error) {
      toast.error("Failed to delete wishlist.", { id: loadingToastId });
      console.error("Error deleting wishlist: ", error);
    } finally {
      setWishlistToDelete(null);
    }
  };

  // Show spinner only during the initial data load OR if currentUser is not yet available
  if (loading || !currentUser) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className={styles.errorState}>{error}</div>;
  }

  return (
    <>
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className={styles.confirmModalContent}>
          <h3>Delete Wishlist?</h3>
          <p>Are you sure you want to delete "<strong>{wishlistToDelete?.name}</strong>"? This cannot be undone, and shared links will stop working.</p>
          <div className={styles.confirmButtons}>
            <button onClick={() => setShowDeleteConfirm(false)} className={styles.cancelButton}>Cancel</button>
            <button onClick={confirmDeleteWishlist} className={styles.deleteButton}>Yes, Delete Permanently</button>
          </div>
        </div>
      </Modal>

      <div className={styles.dashboardContainer}>
        <DashboardNav />
        <main className={styles.mainContent}>
          <DashboardHeader userName={userName} canCreate={canCreateMore} />
          <ScrollAnimationWrapper><UpgradePrompt /></ScrollAnimationWrapper>

          {wishlists.length === 0 ? (
            <div className={styles.noWishlists}>
              <h3>No wishlists yet!</h3>
              <p>Get started by creating your first one.</p>
              <Link to="/create-wishlist" className={styles.createButtonLink}>Create a Wishlist</Link>
            </div>
          ) : (
            <div className={styles.wishlistGrid}>
              {wishlists.map(wishlist => (
                <ScrollAnimationWrapper key={wishlist.id}>
                  {/* Pass the correct function reference */}
                  <WishlistCard wishlist={wishlist} onDelete={handleDeleteWishlist} />
                </ScrollAnimationWrapper>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default DashboardPage;