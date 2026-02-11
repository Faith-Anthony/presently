import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getApp } from 'firebase/app'; // Get existing app instance
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc 
} from 'firebase/firestore';

// --- Icons ---
const Sparkles = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.2c-.7 2.4-.2 2.7.2 3.1.4.3.7.8.2 3-.5 2.5 1.7 3.6 1.7 3.6s1.6.4 1.6-1.5c0-.4-.3-1.4.3-1.6 1-.3 1.1-1.2.6-2.5-.5-1.4.1-3.6-1.4-3.6z"/><path d="M12.4 12.5c-.3 0-.6.3-.6.6 0 .3.3.6.6.6s.6-.3.6-.6c0-.3-.3-.6-.6-.6z"/><path d="M21.2 7c-1.3-1.6-2-2.9-2.2-3.8-.4-1.4.1-1.6.2-1.7s-.4 1.1-.4 2.1c0 .4-.2 1.2-1.2 1.7-1.3.6-1.4.6-2.6.4-1.2-.2-1.6 1.4-1.6 1.4s.3 1.8 1.4 2.4c1.2.7 1.4 1.7 1.4 1.7s.1.4 1.5.5c1.4.1 2.3-.9 3.2-1.8.8-1 1.6-1.8 2.2-2.7z"/><path d="M12.6 17.5c-.2 0-.3.1-.3.3 0 .2.1.3.3.3s.3-.1.3-.3c0-.2-.1-.3-.3-.3z"/></svg>;
const GiftIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 12 12 12 20"/><path d="M20 12c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4s1.8-4 4-4h8c2.2 0 4 1.8 4 4z"/><path d="M12 4V2"/><path d="M12 22V20"/></svg>;
const ExternalLink = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3 6 6m0-6-6 6"/></svg>;

const ViewWishlistPage = () => {
  const { id: wishlistId } = useParams();
  
  // State
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Connecting...");
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('reserve'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [pin, setPin] = useState('');

  // 1. Safe Firebase Initialization
  // We grab the existing app instance instead of importing config to avoid import errors
  const app = getApp(); 
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 2. Authentication (Anonymous Login)
  useEffect(() => {
    const performAuth = async () => {
      try {
        if (!auth.currentUser) {
          setLoadingMessage("Logging in anonymously...");
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Auth warning:", err);
      }
    };
    performAuth();

    return onAuthStateChanged(auth, (u) => setUser(u));
  }, [auth]);

  // 3. Data Fetching
  useEffect(() => {
    setLoadingMessage("Loading Items...");
    
    // IMPORTANT: Ensure this path matches exactly where your items are saved!
    // Using default 'default-app-id' if running locally without sandbox environment variables
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const itemsRef = collection(db, 'artifacts', appId, 'public', 'data', 'wishlist');

    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort items
      data.sort((a, b) => {
        const aStatus = a.purchased ? 2 : (a.reservedByUid ? 1 : 0);
        const bStatus = b.purchased ? 2 : (b.reservedByUid ? 1 : 0);
        if (aStatus !== bStatus) return aStatus - bStatus;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });

      setItems(data);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore Error:", err);
      setError("Unable to access wishlist data. Please check your internet connection.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, wishlistId]);

  // Actions
  const handleReserve = async () => {
    if (!formName.trim() || formPin.length < 4) {
      alert("Please enter Name & 4-digit PIN");
      return;
    }
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    
    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'wishlist', selectedItem.id);
      await updateDoc(itemRef, {
        reservedByUid: user?.uid || 'guest',
        reservedByName: formName,
        reservationPin: formPin,
        purchased: false
      });
      closeModal();
    } catch (err) {
      alert("Failed to reserve item.");
      console.error(err);
    }
  };

  const handleUnreserve = async () => {
    if (formPin !== selectedItem.reservationPin) {
      alert("Incorrect PIN");
      return;
    }
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    
    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'wishlist', selectedItem.id);
      await updateDoc(itemRef, { reservedByUid: null, reservedByName: null, reservationPin: null });
      closeModal();
    } catch (err) {
      alert("Error clearing reservation.");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setGuestName('');
    setPin('');
  };

  // Render Loading State
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#64748b' }}>{loadingMessage}</p>
      </div>
    );
  }

  // Render Main UI
  return (
    <div className="page">
      {/* Inline Styles for Consistency */}
      <style>{`
        .page { background-color: #f8fafc; min-height: 100vh; padding: 20px; font-family: system-ui, sans-serif; }
        .container { max-width: 900px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .title { font-size: 2.5rem; font-weight: 800; color: #1e293b; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .card { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; flex-direction: column; justify-content: space-between; height: 100%; transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); }
        .cardReserved { background: #f1f5f9; border: 1px solid #cbd5e1; opacity: 0.9; }
        .cardPurchased { background: #f0fdf4; border: 1px solid #bbf7d0; opacity: 0.7; }
        .btnReserve { width: 100%; padding: 12px; background: #10b981; color: white; border: none; borderRadius: 10px; fontWeight: bold; cursor: pointer; }
        .btnUnreserve { width: 100%; padding: 12px; background: #f59e0b; color: white; border: none; borderRadius: 10px; fontWeight: bold; cursor: pointer; }
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
        .modal { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; }
        .input { width: 100%; padding: 12px; margin-bottom: 15px; border-radius: 10px; border: 1px solid #cbd5e1; fontSize: 16px; box-sizing: border-box; }
        .modalBtns { display: flex; gap: 10px; }
        .btnPri { flex: 1; padding: 12px; background: #4f46e5; color: white; border: none; borderRadius: 10px; fontWeight: bold; cursor: pointer; }
        .btnSec { flex: 1; padding: 12px; background: #f1f5f9; color: #475569; border: none; borderRadius: 10px; fontWeight: bold; cursor: pointer; }
      `}</style>

      <div className="container">
        <header className="header">
          <h1 className="title"><Sparkles /> Shared Dreamlist</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '5px' }}>ID: {wishlistId}</p>
        </header>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
            {error} <br/> <button onClick={() => window.location.reload()} style={{marginTop: '10px', padding: '5px 10px'}}>Retry</button>
          </div>
        )}

        <div className="grid">
          {items.map(item => {
            const isReserved = !!item.reservedByUid;
            let cardClass = "card";
            if (item.purchased) cardClass += " cardPurchased";
            else if (isReserved) cardClass += " cardReserved";

            return (
              <div key={item.id} className={cardClass}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>{item.name}</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4f46e5', marginBottom: '12px' }}>{item.price || "No Price"}</div>
                  
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="link" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      View Item <ExternalLink />
                    </a>
                  )}

                  {isReserved && (
                    <div style={{ marginTop: '15px', fontSize: '13px', fontWeight: 'bold', color: '#475569', fontStyle: 'italic' }}>
                      {item.purchased ? "✅ Bought" : `🔒 Reserved by ${item.reservedByName}`}
                    </div>
                  )}
                </div>

                {!item.purchased && (
                  <div>
                    {!isReserved ? (
                      <button onClick={() => { setSelectedItem(item); setModalMode('reserve'); setModalOpen(true); }} className="btnReserve">Reserve Item</button>
                    ) : (
                      <button onClick={() => { setSelectedItem(item); setModalMode('unreserve'); setModalOpen(true); }} className="btnUnreserve">Unreserve</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {items.length === 0 && !error && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px' }}>
            <GiftIcon />
            <p>This wishlist is currently empty.</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="overlay">
          <div className="modal">
            <h2 style={{ margin: '0 0 10px 0' }}>{modalMode === 'reserve' ? 'Confirm Reservation' : 'Clear Reservation'}</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Item: <strong>{selectedItem?.name}</strong></p>
            {modalMode === 'reserve' && <input className="input" placeholder="Enter your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />}
            <input className="input" type="password" placeholder="Enter 4-digit PIN" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} />
            <div className="modalBtns">
              <button onClick={closeModal} className="btnSec">Cancel</button>
              <button onClick={modalMode === 'reserve' ? handleReserve : handleUnreserve} className="btnPri">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewWishlistPage;