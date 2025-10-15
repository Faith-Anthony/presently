import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import styles from './CreateWishlistPage.module.css';
import Logo from '../components/Logo';
import Modal from '../components/UI/Modal';

const CreateWishlistPage = () => {
  // State for Step 1: Create Wishlist
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);

  // State for Step 2: Add Items
  const [formStep, setFormStep] = useState('create'); // 'create' or 'addItems'
  const [newWishlistId, setNewWishlistId] = useState(null);
  const [items, setItems] = useState(
    Array(5).fill({ name: '', description: '', quantity: 1, price: '', vendorLink: '', imageUrl: '' })
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCreateWishlist = async (e) => {
    e.preventDefault();
    if (!name || !eventDate) {
      return toast.error('Please fill out the wishlist name and event date.');
    }
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'wishlists'), {
        userId: currentUser.uid,
        name,
        description,
        eventDate: new Date(eventDate),
        itemCount: 0,
        createdAt: serverTimestamp(),
      });
      setNewWishlistId(docRef.id);
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Failed to create wishlist.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormStep('addItems'); // Move to the "Add Items" form
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
      toast.success("Wishlist created! You can add items later from your dashboard.");
      navigate('/dashboard');
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
          vendorLink: item.vendorLink || '',
          imageUrl: item.imageUrl || '',
          status: 'unpicked',
          createdAt: new Date(),
        });
      });

      await batch.commit();
      toast.success('Items added successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to add items.');
      console.error(error);
    } finally {
      setLoading(false);
    }
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

      <div className={styles.pageContainer}>
        <div className={styles.logoWrapper}> <Logo /> </div>
        <div className={styles.formCard}>
          {formStep === 'create' ? (
            <>
              <h2>Create a new wishlist</h2>
              <p>Let's get started with the details for your special event.</p>
              <form onSubmit={handleCreateWishlist} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="wishlist-name">Wishlist name</label>
                  <input id="wishlist-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah's Birthday Bash" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="description">Description (optional)</label>
                  <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description of your event or wishlist" rows="3" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="event-date">Event date</label>
                  <input id="event-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Wishlist'}
                </button>
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
                      <input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} placeholder="Price ($)" min="0" step="0.01" />
                    </div>
                    <input type="url" value={item.vendorLink} onChange={(e) => handleItemChange(index, 'vendorLink', e.target.value)} placeholder="Vendor Link (Optional)" />
                    <input type="url" value={item.imageUrl} onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)} placeholder="Image URL (Optional)" />
                  </div>
                ))}
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Saving Items...' : 'Add Items & Finish'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateWishlistPage;