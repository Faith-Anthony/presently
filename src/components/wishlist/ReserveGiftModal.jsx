import React, { useState } from 'react';
import styles from './ReserveGiftModal.module.css'; // We'll create this CSS file next
import Modal from '../UI/Modal'; // Reuse the existing Modal component

const ReserveGiftModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  const [gifterName, setGifterName] = useState('');
  const [phone, setPhone] = useState(''); // Added phone number
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    // Basic Validation
    if (!gifterName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      // Basic phone validation (can be enhanced)
      alert("Please enter your phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({ gifterName, phone, message });
      // Clear form on success (optional, handled by parent closing modal)
      // setGifterName(''); setPhone(''); setMessage('');
    } catch (error) {
      // Error is usually handled by the parent component's toast
      console.error("Reservation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear form when modal opens or closes
  React.useEffect(() => {
      if (!isOpen) {
          setGifterName('');
          setPhone('');
          setMessage('');
      }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
            aria-label="Your Name"
          />
          <input
            type="tel" // Use type="tel" for phone numbers
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your Phone Number*"
            required
            aria-label="Your Phone Number"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message for the recipient (optional)"
            rows="3"
            aria-label="Optional Message"
          />
          <button type="button" onClick={handleConfirm} className={styles.confirmButton} disabled={isSubmitting}>
            {isSubmitting ? 'Reserving...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default ReserveGiftModal;