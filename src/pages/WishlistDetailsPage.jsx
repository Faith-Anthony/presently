import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc,
  onSnapshot, 
  deleteDoc, 
  updateDoc, 
  doc, 
  Timestamp
} from 'firebase/firestore';
import { 
  Gift, 
  Trash2, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  Circle,
  Loader2,
  Sparkles,
  AlertTriangle,
  Lock,
  Bookmark
} from 'lucide-react';
// The import for './ViewWishlistPage.module.css' is intentionally omitted here to resolve compilation errors. 
// All styling is handled via Tailwind classes directly in the JSX.

// --- Firebase Init (Self-Contained) ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

if (!firebaseConfig.apiKey) console.warn("Firebase config missing.");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ViewWishlistPage Component ---
function ViewWishlistPage() {
  const { id: wishlistId } = useParams(); 
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Determine Owner
  const ownerId = wishlistId; 
  const isOwner = user && ownerId && user.uid === ownerId;

  // Form State (Owner only actions)
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemPriority, setNewItemPriority] = useState('medium');
  const [isAdding, setIsAdding] = useState(false);
  const [userName, setUserName] = useState(''); // Stores the temporary user display name for reservations

  // --- Auth ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        let currentUser = null;
        
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          const result = await signInWithCustomToken(auth, __initial_auth_token);
          currentUser = result.user;
        } else {
          await signInAnonymously(auth);
          currentUser = result.user;
        }

        // Create a clear display name for reservations (e.g., "User-ab12cd34")
        const uidSlice = currentUser?.uid ? currentUser.uid.substring(0, 6) : null;
        const displayName = uidSlice ? `User-${uidSlice}` : 'Guest';
        setUserName(displayName);
        
      } catch (err) {
        console.error("Auth error:", err);
        setError("Authentication failed.");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    if (!user || !ownerId) return;

    // Fetch from Public Collection
    const itemsRef = collection(db, 'artifacts', appId, 'public', 'data', `wishlist_${ownerId}`);
    
    const unsubscribe = onSnapshot(itemsRef, 
      (snapshot) => {
        const fetchedItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          reservedByUid: doc.data().reservedByUid || null,
          reservedByName: doc.data().reservedByName || null,
        }));
        
        // Sort: Unreserved -> Reserved -> Purchased
        fetchedItems.sort((a, b) => {
          const aStatus = a.purchased ? 2 : (a.reservedByUid ? 1 : 0);
          const bStatus = b.purchased ? 2 : (b.reservedByUid ? 1 : 0);
          return aStatus - bStatus || (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });

        setItems(fetchedItems);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load wishlist.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, ownerId]);

  // --- Handlers ---

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !isOwner) {
      setError("Only the wishlist owner can add items.");
      return;
    }

    try {
      const itemsCollectionPath = `artifacts/${appId}/public/data/wishlist_${ownerId}`;
      await addDoc(collection(db, itemsCollectionPath), {
        name: newItemName,
        price: newItemPrice,
        url: newItemUrl.trim(),
        priority: newItemPriority,
        reservedByUid: null,
        reservedByName: null,
        purchased: false,
        createdAt: Timestamp.now()
      });

      // Reset form
      setNewItemName('');
      setNewItemPrice('');
      setNewItemUrl('');
      setNewItemPriority('medium');
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Could not add item. Please try again.");
    }
  };

  const deleteItem = async (id, name) => {
    if (!isOwner) {
      setError("Only the wishlist owner can delete items.");
      return;
    }

    if (window.confirm(`Are you sure you want to remove "${name}" from this wishlist?`)) {
        try {
            const itemsCollectionPath = `artifacts/${appId}/public/data/wishlist_${ownerId}`;
            const docRef = doc(db, itemsCollectionPath, id);
            await deleteDoc(docRef);
        } catch (err) {
            console.error("Error deleting item:", err);
            setError("Could not delete item.");
        }
    }
  };
  
  const togglePurchased = async (id, currentStatus) => {
    if (!isOwner) {
        setError("Only the wishlist owner can mark items as purchased directly.");
        return;
    }
    try {
      const itemsCollectionPath = `artifacts/${appId}/public/data/wishlist_${ownerId}`;
      const docRef = doc(db, itemsCollectionPath, id);
      await updateDoc(docRef, { 
        purchased: !currentStatus,
        reservedByUid: null, 
        reservedByName: null, 
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const toggleReservation = async (item) => {
    if (!user) return;
    
    const isReservedByMe = item.reservedByUid === user.uid;
    const isReserved = !!item.reservedByUid;
    const userNameDisplay = user.uid ? `User-${user.uid.substring(0, 6)}` : 'Guest'; 

    const newReservationState = (isReserved && isReservedByMe) 
        ? { reservedByUid: null, reservedByName: null } 
        : (isReserved && !isReservedByMe) 
        ? null 
        : { reservedByUid: user.uid, reservedByName: userNameDisplay };

    if (newReservationState === null) {
        alert("This item is already reserved by someone else.");
        return;
    }

    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', `wishlist_${ownerId}`, item.id);
      await updateDoc(docRef, newReservationState);
    } catch (err) {
      console.error("Error:", err);
    }
  };


  // --- Helper Components ---
  const PriorityBadge = ({ priority }) => {
    const colors = {
      low: 'bg-gray-200 text-gray-700',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-red-100 text-red-600'
    };
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const ItemCard = ({ item }) => {
    const isReserved = !!item.reservedByUid;
    const isReservedByMe = user && item.reservedByUid === user.uid;
    
    // --- Reservation Display Logic (Core Feature Implementation) ---
    let cardClass = 'bg-white border border-gray-200 shadow-lg';
    let statusText = null;

    if (item.purchased) {
        cardClass = 'bg-green-50 border-2 border-green-300 opacity-70 shadow-lg';
        statusText = 'PURCHASED';
    } else if (isReserved) {
        if (isOwner) {
            // OWNER view: See the exact name of the person who reserved it
            cardClass = 'bg-indigo-100 border-2 border-indigo-300 shadow-xl';
            statusText = `Reserved by: ${item.reservedByName}`;
        } else if (isReservedByMe) {
            // GUEST view (reserved by them): They see their own reservation
            cardClass = 'bg-amber-100 border-2 border-amber-300 shadow-xl';
            statusText = 'Reserved by YOU';
        } else {
            // GUEST view (reserved by another guest): Mask the name for surprise
            cardClass = 'bg-gray-100 border-2 border-gray-300 opacity-80 shadow-md';
            statusText = 'Item is reserved';
        }
    }

    const renderActionButton = () => {
        if (item.purchased) {
            return null;
        }

        if (isReserved) {
            if (isReservedByMe || isOwner) { // Both can cancel/clear
                return (
                    <button
                        onClick={() => toggleReservation(item)}
                        title={isOwner ? "Clear Reservation" : "Cancel Reservation"}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-md"
                    >
                        <Bookmark size={16} className="mr-2" />
                        {isOwner ? 'Clear' : 'Cancel'}
                    </button>
                );
            } else {
                // Reserved by another guest - no action
                return (
                    <button
                        disabled
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-500 bg-gray-200 cursor-not-allowed shadow-inner"
                        title="Item is reserved"
                    >
                        <Lock size={16} className="mr-2" /> Reserved
                    </button>
                );
            }
        } else {
            // Item is unreserved
            return (
                <button
                    onClick={() => toggleReservation(item)}
                    title="Reserve Item"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors shadow-md"
                >
                    <Bookmark size={16} className="mr-2" />
                    Reserve
                </button>
            );
        }
    };

    return (
      <div className={`${cardClass} p-5 rounded-xl transition-all duration-300 transform hover:scale-[1.02]`}>
        <div className="flex flex-col h-full">
            <div className="flex-grow pb-4">
                <h3 className={`text-xl font-bold ${item.purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.name}
                </h3>
                
                {statusText && (
                    <p className={`font-semibold text-sm mt-1 ${item.purchased ? 'text-green-700' : 'text-gray-600'}`}>
                        {statusText}
                    </p>
                )}

                <div className="flex items-center space-x-3 mt-3">
                    <PriorityBadge priority={item.priority} />
                    {item.price && (
                        <span className="text-lg font-extrabold text-indigo-600">
                        {item.price}
                        </span>
                    )}
                </div>
                {item.url && (
                    <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="mt-3 inline-flex items-center text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                        View Link 
                        <ExternalLink size={16} className="ml-1" />
                    </a>
                )}
            </div>

            {/* Action Buttons */}
            {user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    {renderActionButton()}
                    
                    {/* Owner Delete Button */}
                    {isOwner && (
                      <button
                            onClick={() => deleteItem(item.id, item.name)}
                            title="Delete Item"
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-600 bg-red-100 hover:bg-red-200 transition-colors shadow-md"
                      >
                            <Trash2 size={16} className="mr-2" /> Delete Item
                      </button>
                    )}
                </div>
            )}
        </div>
      </div>
    );
  };


  // --- Render ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-400">
        <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
        <p className="text-lg font-semibold">Loading {isOwner ? 'your' : 'the'} Dreamlist...</p>
      </div>
    );
  }

  // --- Main Render Content ---
  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b pb-4 mb-6">
          <div className="flex-grow">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <Sparkles size={32} className="text-indigo-600 fill-indigo-100" />
              {isOwner ? 'My Dreamlist' : 'Shared Dreamlist'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
                Wishlist ID: <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded-full">{ownerId || 'N/A'}</span>
            </p>
          </div>
          
          {/* Owner's Action Button */}
          {isOwner && (
              <button
                onClick={() => {
                  alert("Redirecting to item management page (Feature placeholder).");
                }}
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Manage My Items
              </button>
          )}
        </div>

        {/* --- Guest CTA Banner --- */}
        {!isOwner && (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-emerald-50 border-2 border-emerald-300 p-4 rounded-xl mb-8 shadow-inner">
                <p className="text-md font-semibold text-emerald-800 mb-3 sm:mb-0">Want to start your own list for others to reserve gifts for you?</p>
                <Link to="/create-wishlist" className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-colors">
                    <Gift size={16} className="mr-2" />
                    Create Your Dreamlist!
                </Link>
            </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg text-red-800 flex items-center shadow-md">
            <AlertTriangle size={20} className="mr-3" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Wishlist Items List (Grid Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center p-12 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-200">
              <Gift size={48} className="mx-auto text-indigo-400 opacity-50" />
              <h3 className="mt-4 text-xl font-medium text-gray-700">The list is empty!</h3>
              <p className="mt-1 text-gray-500">
                {isOwner ? 'Time to add some dreams!' : 'Looks like the owner hasn\'t added anything yet.'}
              </p>
            </div>
          ) : (
            items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Explicit export added here for clarity and compatibility
export default ViewWishlistPage;