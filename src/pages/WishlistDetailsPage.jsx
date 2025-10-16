import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, collection, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import styles from './WishlistDetailsPage.module.css';
import WishlistItem from '../components/wishlist/WishlistItem';
import PickGiftModal from '../components/wishlist/PickGiftModal';
import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';

const WishlistDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // ... (fetching logic remains the same) ...
  }, [id, navigate]);

  const handlePickItem = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  const handleConfirmPick = async ({ gifterName, note }) => {
    setIsModalOpen(false);
    if (!selectedItem) return;

    try {
      const itemRef = doc(db, "wishlists", id, "items", selectedItem.id);
      await updateDoc(itemRef, {
        status: 'picked',
        pickedBy: gifterName,
        note: note || '',
      });
      toast.success("You've picked an item! Thank you! 🎁");
    } catch (error) {
      toast.error("Could not pick item. Please try again.");
    }
    setSelectedItem(null);
  };
  
  // ... (filtering logic and JSX remain mostly the same) ...

  return (
    <>
      <PickGiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPick}
        itemName={selectedItem?.name}
      />
      <div className={styles.pageContainer}>
        {/* ... (rest of the page JSX) ... */}
      </div>
    </>
  );
};

export default WishlistDetailsPage;