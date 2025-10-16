import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import styles from './CreateWishlistPage.module.css';
import Logo from '../components/Logo';
import Modal from '../components/UI/Modal';

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

const CreateWishlistPage = () => {
  // Step 1 State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 2 State
  const [formStep, setFormStep] = useState('create');
  const [newWishlistId, setNewWishlistId] = useState(null);
  const [items, setItems] = useState(
    Array(5).fill({ name: '', description: '', quantity: 1, price: '', currency: 'USD', vendorLink: '', imageUrl: '' })
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCreateWishlist = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'wishlists'), {
        userId: currentUser.uid, name, description,
        eventDate: new Date(eventDate), itemCount: 0,
        createdAt: serverTimestamp(),
      });
      setNewWishlistId(docRef.id);
      setIsModalOpen(true);
    } catch (error) { toast.error('Failed to create wishlist.'); }
    finally { setLoading(false); }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormStep('addItems');
  };

  const handleItemChange = (index, field, value) => {
    if (field === 'name' && value.includes(',')) {
      toast.error("Please enter only one item name per field.");
      return;
    }
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddItemsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const itemsToAdd = items.filter(item => item.name.trim() !== '');

    if (itemsToAdd.length === 0) {
      toast.success("Wishlist created! You can add items later.");
      navigate('/dashboard'); return;
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
          currency: item.currency || 'USD',
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
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/wishlist/${newWishlistId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <div className={styles.modalContent}>
          <h3>Plan Limit Information</h3>
          <p>You’re on the Free Plan. You can create up to 2 wishlists, each with a maximum of 5 items. To access more features, consider upgrading.</p>
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
                <div className={styles.formGroup}><label htmlFor="wishlist-name">Wishlist name</label><input id="wishlist-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah's Birthday Bash" required /></div>
                <div className={styles.formGroup}><label htmlFor="description">Description (optional)</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description of your event or wishlist" rows="3" /></div>
                <div className={styles.formGroup}><label htmlFor="event-date">Event date</label><input id="event-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required /></div>
                <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Creating...' : 'Create Wishlist'}</button>
              </form>
            </>
          ) : (
            <>
              <h2>Add items to your wishlist</h2>
              <p>You can add up to 5 items on the free plan.</p>
              <form onSubmit={handleAddItemsSubmit} className={styles.form}>
                {items.map((item, index) => (
                  <div key={index} className={styles.itemGroup}>
                    <p className={styles.itemLabel}>Item {index + 1}</p>
                    <input type="text" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="Item Name*" required={index === 0} />
                    <textarea value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Description (Optional)" rows="2" />
                    <div className={styles.itemRow}>
                      <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" min="1" />
                      <div className={styles.priceGroup}>
                        <select value={item.currency} onChange={(e) => handleItemChange(index, 'currency', e.target.value)}>
                          <option value="USD">$</option><option value="NGN">₦</option><option value="EUR">€</option><option value="GBP">£</option><option value="KES">KSh</option>
                        </select>
                        <input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} placeholder="Price" min="0" step="0.01" />
                      </div>
                    </div>
                    <input type="url" value={item.vendorLink} onChange={(e) => handleItemChange(index, 'vendorLink', e.target.value)} placeholder="Vendor Link (Optional)" />
                    <input type="url" value={item.imageUrl} onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)} placeholder="Image URL (Optional)" />
                  </div>
                ))}
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