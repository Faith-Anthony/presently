import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase/config';

// --- Icons ---
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);

// Updated Logo to match Homepage (Wallet style)
const Wallet = ({ size = 24, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
);

const DashboardPage = () => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  
  // Custom Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchWishlists(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchWishlists = async (userId) => {
    try {
      const q = query(
        collection(db, 'wishlists'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const lists = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort newest first
      lists.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setWishlists(lists);
    } catch (error) {
      console.error("Error fetching wishlists:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Logic with Custom Modal ---
  const promptDelete = (id) => {
    setListToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!listToDelete) return;
    try {
      await deleteDoc(doc(db, 'wishlists', listToDelete));
      setWishlists(prev => prev.filter(list => list.id !== listToDelete));
      showToast("Wishlist deleted successfully");
    } catch (error) {
      console.error("Error deleting:", error);
      showToast("Error deleting wishlist");
    } finally {
      setShowDeleteModal(false);
      setListToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setListToDelete(null);
  };

  const handleShare = (id) => {
    const shareUrl = `${window.location.origin}/wishlist/${id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => showToast("Link copied to clipboard!"))
      .catch(() => showToast("Failed to copy link"));
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Get User Name (Fallback to email name if displayName is empty)
  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Friend';
  };

  // --- Styles Object (Replaces External CSS Module) ---
  const styles = {
    container: {
      maxWidth: '1400px',
      width: '95%',
      margin: '0 auto',
      padding: '1rem 0 3rem 0',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: '#1f2937',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80vh',
      color: '#6b7280',
    },
    navbar: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingBottom: '2rem',
      marginBottom: '1rem',
      borderBottom: '1px solid #f3f4f6',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    logoIcon: {
      backgroundColor: '#3b83f7',
      color: 'white',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(59, 131, 247, 0.3)',
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: '800',
      color: '#111827',
      letterSpacing: '-0.025em',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1.5rem',
    },
    welcomeText: {
      fontSize: '2rem',
      fontWeight: '800',
      color: '#111827',
      margin: '0 0 0.5rem 0',
      lineHeight: '1.2',
    },
    subText: {
      color: '#6b7280',
      margin: '0',
      fontSize: '1rem',
    },
    createBtn: {
      backgroundColor: '#3b83f7',
      color: 'white',
      padding: '0.875rem 1.5rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.95rem',
      boxShadow: '0 4px 6px -1px rgba(59, 131, 247, 0.2)',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
    },
    upgradeBanner: {
      background: 'linear-gradient(135deg, #3b83f7 0%, #2563eb 100%)',
      borderRadius: '1rem',
      padding: '1.5rem 2rem',
      marginBottom: '3rem',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(59, 131, 247, 0.2)',
    },
    upgradeContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1.5rem',
    },
    bannerText: {
      display: 'flex',
      flexDirection: 'column',
    },
    upgradeBtn: {
      backgroundColor: 'white',
      color: '#2563eb',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '9999px',
      fontWeight: '700',
      fontSize: '0.95rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '2rem',
    },
    card: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '1rem',
      padding: '1.75rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'all 0.2s ease',
    },
    cardHeader: {
      marginBottom: '1rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #f3f4f6',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      margin: '0 0 0.5rem 0',
      color: '#111827',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    date: {
      fontSize: '0.875rem',
      color: '#6b7280',
      display: 'block',
    },
    cardBody: {
      marginBottom: '2rem',
      flexGrow: '1',
    },
    cardStats: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '0.9rem',
      color: '#4b5563',
      backgroundColor: '#f9fafb',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      width: 'fit-content',
    },
    dot: {
      margin: '0 0.5rem',
      color: '#9ca3af',
    },
    cardActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 'auto',
    },
    iconGroup: {
      display: 'flex',
      gap: '0.5rem',
    },
    iconBtn: {
      background: 'none',
      border: '1px solid transparent',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewLink: {
      color: '#3b83f7',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.95rem',
    },
    emptyState: {
      textAlign: 'center',
      padding: '6rem 1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '1rem',
      border: '2px dashed #e5e7eb',
      marginTop: '2rem',
    },
    emptyTitle: {
      fontSize: '1.5rem',
      color: '#111827',
      marginBottom: '0.5rem',
    },
    createBtnSmall: {
      display: 'inline-block',
      backgroundColor: 'white',
      color: '#3b83f7',
      border: '1px solid #3b83f7',
      padding: '0.6rem 1.2rem',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      fontWeight: '600',
    },
    toast: {
      position: 'fixed',
      bottom: '2.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#111827',
      color: 'white',
      padding: '0.875rem 2rem',
      borderRadius: '9999px',
      fontSize: '0.95rem',
      fontWeight: '500',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: '2000',
    },
    modalOverlay: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '3000',
      backdropFilter: 'blur(2px)',
    },
    modalBox: {
      background: 'white',
      padding: '2rem',
      borderRadius: '1rem',
      width: '90%',
      maxWidth: '400px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    },
    modalActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
    },
    cancelBtn: {
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      color: '#374151',
      padding: '0.6rem 1.2rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    deleteConfirmBtn: {
      backgroundColor: '#ef4444',
      border: '1px solid #ef4444',
      color: 'white',
      padding: '0.6rem 1.2rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      cursor: 'pointer',
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={{...styles.spinner, animation: 'spin 1s linear infinite'}}></div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toastMsg && <div style={styles.toast}>{toastMsg}</div>}

      {/* Custom Delete Modal (Centered) */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={{marginTop: 0, fontSize: '1.25rem', color: '#111827'}}>Delete Wishlist?</h3>
            <p style={{color: '#6b7280', marginBottom: '2rem'}}>Are you sure you want to delete this wishlist? This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button onClick={cancelDelete} style={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmDelete} style={styles.deleteConfirmBtn}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar with Correct Logo */}
      <nav style={styles.navbar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
             <Wallet size={24} color="white" />
          </div>
          <span style={styles.logoText}>Presently</span>
        </div>
      </nav>

      {/* Header Section */}
      <div style={styles.header}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <h1 style={styles.welcomeText}>Welcome back, {getUserName()}!</h1>
          <p style={styles.subText}>Here are your active events.</p>
        </div>
        <Link to="/create-wishlist" style={styles.createBtn}>
          + Create New Wishlist
        </Link>
      </div>

      {/* Upgrade Banner */}
      <div style={styles.upgradeBanner}>
        <div style={styles.upgradeContent}>
          <div style={styles.bannerText}>
            <strong style={{fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.25rem'}}>Free Plan</strong>
            <span style={{fontSize: '1rem', opacity: '0.9'}}>Upgrade to unlock themes & unlimited items.</span>
          </div>
          <button style={styles.upgradeBtn}>Upgrade Now</button>
        </div>
      </div>

      {/* Wishlist Grid */}
      {wishlists.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>No wishlists found</h3>
          <p style={{color: '#6b7280', marginBottom: '2rem'}}>Create your first wishlist to get started!</p>
          <Link to="/create-wishlist" style={styles.createBtnSmall}>Create Wishlist</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {wishlists.map((list) => (
            <div key={list.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{list.name}</h3>
                {/* FIX FOR INVALID DATE: Check if eventDate exists before formatting */}
                <span style={styles.date}>
                  {list.eventDate ? new Date(list.eventDate).toLocaleDateString() : 'No Date Set'}
                </span>
              </div>
              
              <div style={styles.cardBody}>
                <div style={styles.cardStats}>
                  <span>{list.itemCount || 0} items</span>
                  <span style={styles.dot}>•</span>
                  <span>{list.category || 'General'}</span>
                </div>
              </div>

              <div style={styles.cardActions}>
                <div style={styles.iconGroup}>
                  <button onClick={() => handleShare(list.id)} style={styles.iconBtn} title="Share Link">
                    <ShareIcon />
                  </button>
                  
                  {/* EDIT/MANAGE LINK: Uses /manage-items/:id */}
                  <Link to={`/manage-items/${list.id}`} style={styles.iconBtn} title="Manage Items">
                    <EditIcon />
                  </Link>

                  <button onClick={() => promptDelete(list.id)} style={styles.iconBtn} title="Delete List">
                    <TrashIcon />
                  </button>
                </div>
                
                {/* VIEW LINK: Points to Public View */}
                <Link to={`/wishlist/${list.id}`} style={styles.viewLink}>
                  View List →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;