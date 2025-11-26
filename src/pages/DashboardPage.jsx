import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, deleteDoc, runTransaction, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';
import styles from './DashboardPage.module.css';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const DashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Wishlists
  useEffect(() => {
    if (!currentUser) return;
    
    const wishlistsRef = collection(db, 'wishlists');
    const q = query(wishlistsRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWishlists(lists);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching wishlists:", error);
      toast.error("Could not load dashboard.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // *** HELPER: URL Slugify ***
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // *** UPDATED: Share Function ***
  const handleShare = (wishlistId) => {
    const ownerName = currentUser?.displayName || 'user';
    const nameSlug = slugify(ownerName);
    
    // Use 'presently' in the URL
    const shareUrl = `${window.location.origin}/presently/${nameSlug}/${wishlistId}`;
    
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  // Handle Delete Wishlist
  const handleDelete = async (wishlistId) => {
    if (!confirm("Are you sure you want to delete this wishlist? This cannot be undone.")) return;

    try {
      await runTransaction(db, async (transaction) => {
         // 1. Delete the wishlist doc
         const wishlistRef = doc(db, 'wishlists', wishlistId);
         transaction.delete(wishlistRef);
         
         // 2. Decrement user count
         const userRef = doc(db, 'users', currentUser.uid);
         transaction.update(userRef, { freeWishlistsCreated: increment(-1) });
      });
      toast.success("Wishlist deleted.");
    } catch (error) {
      console.error("Error deleting wishlist:", error);
      toast.error("Failed to delete wishlist.");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Welcome back, {currentUser?.displayName || 'User'}!</h1>
        <button onClick={() => navigate('/create-wishlist')} className={styles.createButton}>
          Create New Wishlist
        </button>
      </header>

      <div className={styles.planBanner}>
        <p>You're on the Free Plan. Upgrade to unlock more features!</p>
        <button className={styles.upgradeButton}>Upgrade Now</button>
      </div>

      {wishlists.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No wishlists yet!</h3>
          <p>Get started by creating your first one.</p>
          <button onClick={() => navigate('/create-wishlist')} className={styles.createButton}>
             Create a Wishlist
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {wishlists.map((list) => (
            <div key={list.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{list.name}</h3>
                <span className={styles.date}>
                    {list.eventDate?.toDate ? list.eventDate.toDate().toLocaleDateString() : new Date(list.eventDate).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.cardBody}>
                 <p>{list.itemCount || 0} items</p>
              </div>
              <div className={styles.cardActions}>
                 {/* View Button */}
                 <Link to={`/presently/${slugify(currentUser?.displayName || 'user')}/${list.id}`} className={styles.actionLink}>View</Link>
                 
                 {/* Share Button */}
                 <button onClick={() => handleShare(list.id)} className={styles.iconButton} title="Share">
                   Share
                 </button>

                 {/* Delete Button */}
                 <button onClick={() => handleDelete(list.id)} className={styles.deleteButton}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.logoutWrapper}>
          <button onClick={logout} className={styles.logoutButton}>Logout</button>
      </div>
    </div>
  );
};

export default DashboardPage;