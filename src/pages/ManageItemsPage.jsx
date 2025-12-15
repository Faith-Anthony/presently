import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import styles from './ManageItemsPage.module.css';

// --- Icons ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);

const ManageItemsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit & Delete States
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form State
  const [newItem, setNewItem] = useState({ 
    name: '', 
    price: '', 
    currency: 'USD',
    note: '', 
    url: '' 
  });

  const currencies = [
    { code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' }, { code: 'GBP', symbol: '£' },
    { code: 'CAD', symbol: 'C$' }, { code: 'AUD', symbol: 'A$' }, { code: 'JPY', symbol: '¥' },
    { code: 'NGN', symbol: '₦' }, { code: 'INR', symbol: '₹' }, { code: 'ZAR', symbol: 'R' }
  ];

  // Fetch Data
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth.currentUser) return navigate('/login');
      try {
        const docRef = doc(db, 'wishlists', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWishlist({ id: docSnap.id, ...docSnap.data() });
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [id, navigate]);

  // --- Add / Update Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.name) return;

    const selectedCurrency = currencies.find(c => c.code === newItem.currency) || currencies[0];
    const formattedPrice = newItem.price ? `${selectedCurrency.symbol}${newItem.price} ${newItem.currency}` : '';

    try {
      const docRef = doc(db, 'wishlists', id);
      let updatedItems;

      if (editMode) {
        // UPDATE EXISTING ITEM
        updatedItems = wishlist.items.map(item => {
          if (item.id === editingId) {
            return { ...item, ...newItem, formattedPrice };
          }
          return item;
        });
      } else {
        // ADD NEW ITEM
        const itemToAdd = {
          id: Date.now().toString(),
          ...newItem,
          formattedPrice,
          reserved: false, // Default is NOT reserved
          purchased: false
        };
        updatedItems = [...(wishlist.items || []), itemToAdd];
      }

      await updateDoc(docRef, { items: updatedItems, itemCount: updatedItems.length });
      
      setWishlist(prev => ({ ...prev, items: updatedItems, itemCount: updatedItems.length }));
      resetForm();

    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    }
  };

  // --- Edit Logic ---
  const startEdit = (item) => {
    setNewItem({
      name: item.name,
      price: item.price || '',
      currency: item.currency || 'USD',
      note: item.note || '',
      url: item.url || ''
    });
    setEditingId(item.id);
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewItem({ name: '', price: '', currency: 'USD', note: '', url: '' });
    setEditMode(false);
    setEditingId(null);
  };

  // --- Delete Logic ---
  const promptDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const updatedItems = wishlist.items.filter(item => item.id !== itemToDelete.id);
      await updateDoc(doc(db, 'wishlists', id), { 
        items: updatedItems,
        itemCount: updatedItems.length 
      });
      setWishlist(prev => ({ ...prev, items: updatedItems, itemCount: updatedItems.length }));
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Remove Item?</h3>
            <p>Are you sure you want to remove <strong>{itemToDelete?.name}</strong>?</p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowDeleteModal(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmDelete} className={styles.deleteConfirmBtn}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
        <h1>Manage: {wishlist?.name}</h1>
      </div>

      <div className={styles.contentGrid}>
        {/* FORM */}
        <div className={styles.formCard}>
          <h3>{editMode ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Item Name</label>
              <input 
                type="text" 
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="e.g. Coffee Maker"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Price</label>
              <div className={styles.priceInputGroup}>
                <select
                  className={styles.currencySelect}
                  value={newItem.currency}
                  onChange={(e) => setNewItem({...newItem, currency: e.target.value})}
                >
                  {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
                <input 
                  type="number" 
                  step="0.01"
                  className={styles.priceInput}
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Link (Optional)</label>
              <input 
                type="url" 
                value={newItem.url}
                onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Note (Optional)</label>
              <textarea 
                value={newItem.note}
                onChange={(e) => setNewItem({...newItem, note: e.target.value})}
                placeholder="Size, Color, etc."
              />
            </div>

            <button type="submit" className={editMode ? styles.updateBtn : styles.addBtn}>
              {editMode ? 'Update Item' : 'Add Item'}
            </button>
            
            {editMode && (
              <button type="button" onClick={resetForm} className={styles.cancelEditBtn}>
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* ITEMS LIST */}
        <div className={styles.itemsList}>
          <h3>Your Items ({wishlist?.items?.length || 0})</h3>
          
          {(!wishlist?.items || wishlist.items.length === 0) ? (
            <div className={styles.emptyState}>No items yet. Add one!</div>
          ) : (
            <div className={styles.list}>
              {wishlist.items.map(item => (
                <div key={item.id} className={`
                  ${styles.itemCard} 
                  ${editingId === item.id ? styles.highlight : ''} 
                  ${item.reserved ? styles.reservedCard : ''}
                `}>
                  <div className={styles.itemInfo}>
                    <div className={styles.titleRow}>
                      <h4>{item.name}</h4>
                      {/* Badge shows up if reserved */}
                      {item.reserved && (
                        <span className={styles.reservedBadge}>
                          Reserved by {item.reservedBy}
                        </span>
                      )}
                    </div>
                    {(item.formattedPrice) && <span className={styles.price}>{item.formattedPrice}</span>}
                    {item.note && <p className={styles.note}>{item.note}</p>}
                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" className={styles.link}>View Link</a>}
                  </div>
                  
                  <div className={styles.actionButtons}>
                    <button onClick={() => startEdit(item)} className={styles.editBtn} title="Edit">
                      <EditIcon />
                    </button>
                    <button onClick={() => promptDelete(item)} className={styles.deleteBtn} title="Delete">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageItemsPage;