import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- Icons ---
const Sparkles = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.2c-.7 2.4-.2 2.7.2 3.1.4.3.7.8.2 3-.5 2.5 1.7 3.6 1.7 3.6s1.6.4 1.6-1.5c0-.4-.3-1.4.3-1.6 1-.3 1.1-1.2.6-2.5-.5-1.4.1-3.6-1.4-3.6z"/><path d="M12.4 12.5c-.3 0-.6.3-.6.6 0 .3.3.6.6.6s.6-.3.6-.6c0-.3-.3-.6-.6-.6z"/><path d="M21.2 7c-1.3-1.6-2-2.9-2.2-3.8-.4-1.4.1-1.6.2-1.7s-.4 1.1-.4 2.1c0 .4-.2 1.2-1.2 1.7-1.3.6-1.4.6-2.6.4-1.2-.2-1.6 1.4-1.6 1.4s.3 1.8 1.4 2.4c1.2.7 1.4 1.7 1.4 1.7s.1.4 1.5.5c1.4.1 2.3-.9 3.2-1.8.8-1 1.6-1.8 2.2-2.7z"/><path d="M12.6 17.5c-.2 0-.3.1-.3.3 0 .2.1.3.3.3s.3-.1.3-.3c0-.2-.1-.3-.3-.3z"/></svg>;
const GiftIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 12 12 12 20"/><path d="M20 12c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4s1.8-4 4-4h8c2.2 0 4 1.8 4 4z"/><path d="M12 4V2"/><path d="M12 22V20"/></svg>;
const ExternalLink = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3 6 6m0-6-6 6"/></svg>;

const ViewWishlistPage = () => {
  const { id: wishlistId } = useParams();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('reserve'); // 'reserve' | 'unreserve'
  const [selectedItem, setSelectedItem] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [pin, setPin] = useState('');

  // Authentication Initialization
  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    handleAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user) return;

    // Listen to the artifacts path used in the primary app
    const itemsRef = collection(db, 'artifacts', appId, 'public', 'data', 'wishlist');
    
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sorting: Unreserved -> Reserved -> Purchased
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
      console.error("Firestore error:", err);
      setError("Unable to load the list. Please check your permissions.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Actions
  const openReserve = (item) => {
    setSelectedItem(item);
    setModalMode('reserve');
    setModalOpen(true);
  };

  const openUnreserve = (item) => {
    setSelectedItem(item);
    setModalMode('unreserve');
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!pin || pin.length < 4) {
      alert("Please enter a 4-digit PIN.");
      return;
    }

    const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'wishlist', selectedItem.id);

    try {
      if (modalMode === 'reserve') {
        if (!guestName.trim()) {
          alert("Please enter your name.");
          return;
        }
        await updateDoc(itemRef, {
          reservedByUid: user.uid,
          reservedByName: guestName,
          reservationPin: pin
        });
      } else {
        if (pin !== selectedItem.reservationPin) {
          alert("Incorrect PIN. You cannot clear this reservation.");
          return;
        }
        await updateDoc(itemRef, {
          reservedByUid: null,
          reservedByName: null,
          reservationPin: null
        });
      }
      closeModal();
    } catch (err) {
      alert("Failed to update item.");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setGuestName('');
    setPin('');
  };

  const isOwner = user && wishlistId === user.uid;

  if (loading) {
    return (
      <div className="center">
        <div className="spinner"></div>
        <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#64748b' }}>Opening Dreamlist...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{`
        .page { background-color: #f8fafc; min-height: 100vh; padding: 20px; font-family: system-ui, sans-serif; }
        .container { max-width: 900px; margin: 0 auto; }
        .center { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .title { font-size: 2.5rem; font-weight: 800; color: #1e293b; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .card { background-color: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; flex-direction: column; justify-content: space-between; height: 100%; }
        .cardReserved { background-color: #f1f5f9; border: 1px solid #cbd5e1; opacity: 0.9; }
        .cardPurchased { background-color: #f0fdf4; border: 1px solid #bbf7d0; opacity: 0.7; }
        .itemName { margin: 0 0 8px 0; fontSize: 1.25rem; color: #0f172a; font-weight: 700; }
        .price { fontSize: 1.5rem; fontWeight: 800; color: #4f46e5; margin-bottom: 12px; }
        .link { color: #6366f1; text-decoration: none; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 5px; }
        .status { margin-top: 15px; font-size: 13px; font-weight: bold; color: #475569; font-style: italic; }
        .btnReserve { width: 100%; padding: 12px; background: #10b981; color: white; border: none; borderRadius: 10px; fontWeight: bold; cursor: pointer; }
        .btnUnreserve { width: 100%; padding: 12px; background: #f59e0b; color: white; border: none; borderRadius: 10px; fontWeight: bold; cursor: pointer; }
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
        .modal { background: white; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; text-align: center; }
        .input { width: 100%; padding: 12px; marginBottom: 15px; borderRadius: 10px; border: 1px solid #cbd5e1; fontSize: 16px; box-sizing: border-box; margin-bottom: 15px; }
        .modalBtns { display: flex; gap: 10px; }
        .btnPri { flex: 1; padding: 12px; background: #4f46e5; color: white; border: none; borderRadius: 10px; fontWeight: bold; cursor: pointer; }
        .btnSec { flex: 1; padding: 12px; background: #f1f5f9; color: #475569; border: none; borderRadius: 10px; fontWeight: bold; cursor: pointer; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div className="container">
        <header className="header">
          <h1 className="title"><Sparkles /> {isOwner ? 'My Dreamlist' : 'Shared Dreamlist'}</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '5px' }}>ID: {wishlistId}</p>
        </header>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <div className="grid">
          {items.map(item => {
            const isReserved = !!item.reservedByUid;
            let cardClass = "card";
            if (item.purchased) cardClass += " cardPurchased";
            else if (isReserved) cardClass += " cardReserved";

            return (
              <div key={item.id} className={cardClass}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 className="itemName">{item.name}</h3>
                  <div className="price">{item.price || "No price set"}</div>
                  
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="link">
                      View Item <ExternalLink />
                    </a>
                  )}

                  {isReserved && (
                    <div className="status">
                      {item.purchased ? "✅ Bought" : `🔒 Reserved by ${item.reservedByName}`}
                    </div>
                  )}
                </div>

                {!item.purchased && (
                  <div>
                    {!isReserved ? (
                      <button onClick={() => openReserve(item)} className="btnReserve">Reserve Item</button>
                    ) : (
                      <button onClick={() => openUnreserve(item)} className="btnUnreserve">Unreserve</button>
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
            <h2 style={{ margin: '0 0 10px 0' }}>{modalMode === 'reserve' ? 'Reserve Item' : 'Unreserve Item'}</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Item: <strong>{selectedItem?.name}</strong></p>
            
            {modalMode === 'reserve' && (
              <input 
                className="input" 
                placeholder="Enter your name " 
                value={guestName} 
                onChange={(e) => setGuestName(e.target.value)} 
              />
            )}
            
            <input 
              className="input" 
              type="password" 
              placeholder="Enter 4-digit PIN" 
              maxLength={4}
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
            />

            <div className="modalBtns">
              <button onClick={closeModal} className="btnSec">Cancel</button>
              <button onClick={confirmAction} className="btnPri">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewWishlistPage;