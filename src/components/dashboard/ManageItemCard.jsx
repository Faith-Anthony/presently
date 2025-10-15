import React from 'react';
import styles from './ManageItemCard.module.css';

const ManageItemCard = ({ item, onDelete }) => {
  return (
    <div className={styles.card}>
      <span className={styles.itemName}>{item.name}</span>
      <div className={styles.actions}>
        {/* We can add an Edit button here in the future */}
        <button className={styles.deleteButton} onClick={() => onDelete(item.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ManageItemCard;