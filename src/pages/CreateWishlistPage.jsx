import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, writeBatch, doc, getDoc, runTransaction, increment, setDoc } from 'firebase/firestore';
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
  // --- State Variables ---
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
  const [isModalOpen, setIsModalOpen] = useState(false); // Plan limit info modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Success modal
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Effect to check wishlist creation limit (remains the same)
  useEffect(() => {
    // ... (logic is the same) ...
  }, [currentUser]);

  // Function to create user profile if missing (remains the same)
  const createUserProfile = async (user) => {
    // ... (logic is the same) ...
  };

  // Handles submitting the initial wishlist details (Step 1)
  const handleCreateWishlist = async (e) => {
    // ... (logic is the same) ...
  };

  // *** THIS IS THE FUNCTION DEFINITION THAT WAS LIKELY MISSING ***
  // Handles closing the plan limit modal and moving to the next step
  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormStep('addItems'); // Change form state to show item inputs
  };

  // Handles changes in the item form fields (remains the same)
  const handleItemChange = (index, field, value) => {
    // ... (logic is the same) ...
  };

  // Handles submitting the added items (Step 2) (remains the same)
  const handleAddItemsSubmit = async (e) => {
    // ... (logic is the same) ...
  };

  // Handles copying the share link from the success modal (remains the same)
  const handleShare = () => {
    // ... (logic is the same) ...
  };

  // Render loading spinner while checking limit (remains the same)
  if (checkingLimit) { return <LoadingSpinner />; }

  // Render limit reached message if applicable (remains the same)
  if (!canCreate && !checkingLimit) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.formCard}>
          <h2>Plan Limit Reached</h2>
          <p>You have reached the maximum number of wishlists for your current plan.</p>
          <div className={styles.successButtons}>
            <button onClick={() => setIsModalOpen(true)} className={styles.modalButton}>View Plans</button>
            <button onClick={() => navigate('/dashboard')} className={styles.secondaryButton}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Render Logic ---
  return (
    <>
      {/* Plan Limit Info Modal - Ensure onClose uses the defined function */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
         <div className={styles.modalContent}>
          <h3>Plan Limit Information</h3>
          <p>You’re currently on the Free Plan. You can create up to 2 wishlists, each with a maximum of 5 items. To access more features, consider upgrading.</p>
          <button onClick={handleModalClose} className={styles.modalButton}>Got it</button>
        </div>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => navigate('/dashboard')}
        onShare={handleShare}
      />

      <div className={styles.pageContainer}>
         {/* ... Logo wrapper ... */}
        <div className={styles.formCard}>
          {formStep === 'create' ? (
             <>
              <h2>Create a new wishlist</h2>
              <p>Let's get started with the details for your special event.</p>
              <form onSubmit={handleCreateWishlist} className={styles.form}>
                 {/* ... Wishlist creation form inputs ... */}
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
                 {items.map((item, index) => {
                   const currentItemCurrencyOption = currencyOptions.find(option => option.value === item.currency);
                   return (
                     <div key={index} className={styles.itemGroup}>
                       {/* ... Item form inputs including Select ... */}
                       <p className={styles.itemLabel}>Item {index + 1}</p>
                       <input type="text" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="Item Name*" required={index === 0 && items.filter(i=>i.name.trim()).length === 0} />
                       <textarea value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Description (Optional)" rows="2" />
                       <div className={styles.itemRow}>
                         <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qty" min="1" />
                         <div className={styles.priceGroup}>
                           <Select
                             className={styles.currencySelect}
                             classNamePrefix="react-select"
                             options={currencyOptions}
                             value={currentItemCurrencyOption || null}
                             onChange={(selectedOption) => handleItemChange(index, 'currency', selectedOption)}
                             isSearchable={true}
                             placeholder="CUR"
                           />
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