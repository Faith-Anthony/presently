import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, writeBatch, doc, getDoc, runTransaction, increment, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Select from 'react-select';
import styles from './CreateWishlistPage.module.css';
import Logo from '../components/Logo';
import Modal from '../components/UI/Modal';
import currencyList from '../data/currencyList';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Helper component for the success modal
const SuccessModal = ({ isOpen, onClose, onShare }) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className={styles.modalContent}>
          <span className={styles.celebrateEmoji}>👏</span>
          <h3>Wishlist Created!</h3>
          <p>Your wishlist and items have been saved. You can now share the link with friends and family.</p>
          <div className={styles.successButtons}>
            <button onClick={onShare} className={styles.modalButton}>Copy Share Link</button>
            <button onClick={onClose} className={styles.secondaryButton}>Go to Dashboard</button>
          </div>
        </div>
      </Modal>
);

// Format currency data for react-select
const currencyOptions = currencyList.map(c => ({
    value: c.code,
    label: `${c.code} (${c.symbol_native || c.symbol}) - ${c.name}`
}));

const defaultCurrencyOption = currencyOptions.find(option => option.value === 'NGN') || currencyOptions.find(option => option.value === 'USD');

const CreateWishlistPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [canCreate, setCanCreate] = useState(false);

  const [formStep, setFormStep] = useState('create');
  const [newWishlistId, setNewWishlistId] = useState(null);
  const [items, setItems] = useState(
    Array(5).fill({ name: '', description: '', quantity: 1, price: '', currency: 'NGN', vendorLink: '', imageUrl: '' })
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- CHECK LIMIT EFFECT ---
  useEffect(() => {
    const checkCreationLimit = async () => {
      if (!currentUser) { return; }
      setCheckingLimit(true);
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const createdCount = userData.freeWishlistsCreated || 0;
          setCanCreate(createdCount < 2);
        } else {
          setCanCreate(true); // Allow tentatively
        }
      } catch (error) {
        console.error("Error checking limit:", error);
        toast.error("Could not verify wishlist limit.");
        setCanCreate(false);
      } finally {
        setCheckingLimit(false);
      }
    };
    checkCreationLimit();
  }, [currentUser]);

  // --- HANDLERS ---

  const handleCreateWishlist = async (e) => {
    e.preventDefault();
    if (!canCreate && !checkingLimit) {
       toast.error("You have reached the 2-wishlist limit for the Free Plan.");
       return;
    }
    if (!name || !eventDate) return toast.error('Please fill out the wishlist name and event date.');
    
    setLoading(true);
    const userRef = doc(db, "users", currentUser.uid);
    const wishlistsRef = collection(db, 'wishlists');

    try {
      const newWishlistRef = doc(wishlistsRef);

      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        let currentCount = 0;

        if (!userDoc.exists()) {
           // Defensive: ensure profile exists
           transaction.set(userRef, {
             uid: currentUser.uid, email: currentUser.email,
             displayName: currentUser.displayName || currentUser.email.split('@')[0],
             createdAt: serverTimestamp(), freeWishlistsCreated: 0
           }, { merge: true });
        } else {
            currentCount = userDoc.data().freeWishlistsCreated || 0;
        }

        if (currentCount >= 2) throw "Wishlist limit reached!";

        transaction.set(newWishlistRef, {
          userId: currentUser.uid, name, description,
          eventDate: new Date(eventDate), itemCount: 0,
          createdAt: serverTimestamp(),
        });
        transaction.update(userRef, { freeWishlistsCreated: increment(1) });
      });

      setNewWishlistId(newWishlistRef.id);
      setIsModalOpen(true); 

    } catch (error) {
      console.error("Transaction failed:", error);
      if (error === "Wishlist limit reached!") {
           toast.error("You have reached the 2-wishlist limit for the Free Plan.");
           setCanCreate(false);
      } else {
           toast.error('Failed to create wishlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormStep('addItems');
  };

  const handleItemChange = (index, field, value) => {
     if (field === 'name' && typeof value === 'string' && value.includes(',')) {
      toast.error("Please enter only one item name per field.");
      return;
    }
    const newItems = [...items];
    const newValue = (field === 'currency' && value && typeof value === 'object') ? value.value : value;
    newItems[index] = { ...newItems[index], [field]: newValue };
    setItems(newItems);
  };

  const handleAddItemsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const itemsToAdd = items.filter(item => item.name.trim() !== '');

    if (itemsToAdd.length === 0) {
      toast.success("Wishlist created! You can add items later.");
      setIsSuccessModalOpen(true);
      setLoading(false);
      return;
    }

    try {
      const batch = writeBatch(db);
      const wishlistDocRef = doc(db, 'wishlists', newWishlistId);
      batch.update(wishlistDocRef, { itemCount: itemsToAdd.length });

      const itemsCollectionRef = collection(db, 'wishlists', newWishlistId, 'items');
      itemsToAdd.forEach(item => {
        const newItemDocRef = doc(itemsCollectionRef);
        batch.set(newItemDocRef, {
          wishlistId: newWishlistId,
          name: item.name,
          description: item.description || '',
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          currency: item.currency || 'NGN',
          vendorLink: item.vendorLink || '',
          imageUrl: item.imageUrl || '',
          status: 'unpicked',
          createdAt: new Date(),
        });
      });

      await batch.commit();
      setIsSuccessModalOpen(true);
    } catch (error) {
      toast.error('Failed to add items.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // *** UPDATED SHARE FUNCTION ***
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const handleShare = () => {
    const ownerName = currentUser?.displayName || 'user';
    const nameSlug = slugify(ownerName);
    
    // New URL Structure
    const shareUrl = `${window.location.origin}/presently/${nameSlug}/${newWishlistId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  if (checkingLimit) return <LoadingSpinner />;

  if (!canCreate && !checkingLimit) {
    return (
        <div className={styles.limitReachedContainer}>
          <Logo />
          <h2>Wishlist Limit Reached</h2>
          <p>You have already created the maximum number of wishlists (2) allowed on the Free Plan.</p>
          <button onClick={() => navigate('/dashboard')} className={styles.goBackButton}>Go to Dashboard</button>
        </div>
    );
  }

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
         <div className={styles.modalContent}>
          <h3>Plan Limit Information</h3>
          <p>You’re currently on the Free Plan. You can create up to 2 wishlists, each with a maximum of 5 items.</p>
          <button onClick={handleModalClose} className={styles.modalButton}>Got it</button>
        </div>
      </Modal>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => navigate('/dashboard')}
        onShare={handleShare}
      />

      <div className={styles.pageContainer}>
        <div className={styles.logoWrapper}> <Logo /> </div>
        <div className={styles.formCard}>
          {formStep === 'create' ? (
            <>
              <h2>Create a new wishlist</h2>
              <p>Let's get started with the details for your special event.</p>
              <form onSubmit={handleCreateWishlist} className={styles.form}>
                <div className={styles.formGroup}><label>Wishlist name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah's Birthday Bash" required /></div>
                <div className={styles.formGroup}><label>Description (optional)</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." rows="3" /></div>
                <div className={styles.formGroup}><label>Event date</label><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required /></div>
                <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Creating...' : 'Create Wishlist'}</button>
              </form>
            </>
          ) : (
            <>
              <h2>Add items to your wishlist</h2>
              <p>You can add up to 5 items on the free plan.</p>
              <form onSubmit={handleAddItemsSubmit} className={styles.form}>
                {items.map((item, index) => {
                  const currentItemCurrencyOption = currencyOptions.find(option => option.value === item.currency);
                  return (
                    <div key={index} className={styles.itemGroup}>
                      <p className={styles.itemLabel}>Item {index + 1}</p>
                      <input type="text" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="Item Name*" required={index === 0 && items.filter(i=>i.name.trim()).length === 0} />
                      <textarea value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Description (Optional)" rows="2" />
                      <div className={styles.itemRow}>
                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" min="1" />
                        <div className={styles.priceGroup}>
                          <Select className={styles.currencySelect} classNamePrefix="react-select" options={currencyOptions} value={currentItemCurrencyOption || null} onChange={(selectedOption) => handleItemChange(index, 'currency', selectedOption)} isSearchable={true} placeholder="CUR" />
                          <input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} placeholder="Price" min="0" step="0.01" />
                        </div>
                      </div>
                      <input type="url" value={item.vendorLink} onChange={(e) => handleItemChange(index, 'vendorLink', e.target.value)} placeholder="Vendor Link (Optional)" />
                      <input type="url" value={item.imageUrl} onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)} placeholder="Image URL (Optional)" />
                    </div>
                  );
                })}
                <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Saving Items...' : 'Add Items & Finish'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateWishlistPage;