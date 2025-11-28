import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for Custom Popups
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wishlistToDelete, setWishlistToDelete] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);

  // 1. Fetch Wishlists Real-time
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'wishlists'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWishlists(lists);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // 2. Logic for Share Button
  const handleShare = (id) => {
    const url = `${window.location.origin}/wishlist/${id}`;
    navigator.clipboard.writeText(url);
    
    // Show Toast
    setShowShareToast(true);
    // Hide after 3 seconds
    setTimeout(() => {
      setShowShareToast(false);
    }, 3000);
  };

  // 3. Logic for Delete Button (Opens Modal)
  const promptDelete = (id) => {
    setWishlistToDelete(id);
    setShowDeleteModal(true);
  };

  // 4. Confirm Delete (Actually deletes from Firebase)
  const confirmDelete = async () => {
    if (wishlistToDelete) {
      try {
        await deleteDoc(doc(db, "wishlists", wishlistToDelete));
        setShowDeleteModal(false);
        setWishlistToDelete(null);
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete.");
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setWishlistToDelete(null);
  };

  return (
    <div className={styles.container}>
      {/* --- Sidebar --- */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 15h0M2 12h20M7 8h0M17 8h0M17 15h0" /></svg>
          </div>
          <span className={styles.logoText}>Presently</span>
        </div>

        <nav className={styles.navLinks}>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>
            My Lists
          </a>
          <a href="#" className={styles.navItem}>Explore</a>
          <a href="#" className={styles.navItem}>Friends</a>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Welcome back, {currentUser?.email?.split('@')[0] || 'User'}!</h1>
          <Link to="/create-wishlist" className={styles.createButton}>
            Create New Wishlist
          </Link>
        </header>

        {/* Upgrade Banner */}
        <div className={styles.banner}>
          <div className={styles.bannerText}>
            You're on the Free Plan. Upgrade to unlock more features!
          </div>
          <button className={styles.upgradeButton}>Upgrade Now</button>
        </div>

        {/* Wishlists Grid */}
        <div className={styles.contentArea}>
          {loading ? (
             <div className={styles.loading}>Loading your lists...</div>
          ) : wishlists.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No wishlists yet!</h3>
              <p>Get started by creating your first one.</p>
              <Link to="/create-wishlist" className={styles.createButtonSmall}>
                Create a Wishlist
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {wishlists.map((list) => (
                <div key={list.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{list.name || 'Untitled Wishlist'}</h3>
                    <p className={styles.cardDate}>
                      {list.eventDate ? new Date(list.eventDate).toLocaleDateString() : 'No Date'}
                    </p>
                  </div>
                  
                  <div className={styles.cardStats}>
                    <span>{list.itemCount || 0} items</span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className={styles.cardActions}>
                    {/* Share Button */}
                    <button 
                      onClick={() => handleShare(list.id)} 
                      className={styles.iconBtn} 
                      title="Share Link"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    </button>
                    
                    {/* Manage Button */}
                    <Link 
                      to={`/manage/${list.id}`} 
                      className={styles.iconBtn} 
                      title="Manage Items"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </Link>

                    {/* Delete Button */}
                    <button 
                      onClick={() => promptDelete(list.id)} 
                      className={`${styles.iconBtn} ${styles.deleteBtn}`} 
                      title="Delete Wishlist"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>

                    {/* View Button */}
                    <Link to={`/wishlist/${list.id}`} className={styles.viewBtn}>
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- CUSTOM POPUPS --- */}

      {/* 1. Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Are you sure you want to delete this wishlist?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button onClick={cancelDelete} className={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmDelete} className={styles.confirmDeleteBtn}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Share Success Toast */}
      {showShareToast && (
        <div className={styles.toast}>
          Link has been copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default DashboardPage;