import React, { useState } from 'react';
import styles from './PickGiftModal.module.css';
import Modal from '../UI/Modal';

const PickGiftModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  const [gifterName, setGifterName] = useState('');
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (!gifterName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    onConfirm({ gifterName, note });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content}>
        <h3>You're picking: {itemName}</h3>
        <p>Please enter your name so others know this item is taken. You can also leave a short note for the recipient!</p>
        <form className={styles.form}>
          <input
            type="text"
            value={gifterName}
            onChange={(e) => setGifterName(e.target.value)}
            placeholder="Your Name*"
            required
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Leave a note (optional)"
            rows="3"
          />
          <button type="button" onClick={handleConfirm} className={styles.confirmButton}>
            Confirm Pick
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default PickGiftModal;