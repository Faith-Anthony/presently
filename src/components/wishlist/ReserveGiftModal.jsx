import React, { useState, useEffect } from 'react';
import styles from './ReserveGiftModal.module.css';
import Modal from '../UI/Modal';

const ReserveGiftModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  const [gifterName, setGifterName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!gifterName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({ gifterName, phone, message });
    } catch (error) {
      console.error("Reservation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear form when modal opens/closes
  useEffect(() => {
      if (!isOpen) {
          setGifterName('');
          setPhone('');
          setMessage('');
      }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Wrapper for positioning the X button */}
      <div className={styles.modalWrapper}>
        
        {/* The Close "X" Button */}
        <button 
          onClick={onClose} 
          className={styles.closeButton} 
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className={styles.content}>
          <h3>You're reserving: {itemName}</h3>
          <p>Please provide your details so the item can be marked as reserved.</p>
          <form className={styles.form}>
            <input
              type="text"
              value={gifterName}
              onChange={(e) => setGifterName(e.target.value)}
              placeholder="Your Name*"
              required
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your Phone Number*"
              required
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message for the recipient (optional)"
              rows="3"
            />
            <button type="button" onClick={handleConfirm} className={styles.confirmButton} disabled={isSubmitting}>
              {isSubmitting ? 'Reserving...' : 'Confirm Reservation'}
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default ReserveGiftModal;