import React, { useState, useEffect } from 'react';
import styles from './ItemForm.module.css';

const ItemForm = ({ item, onSave, onDelete, onCancel, isNew = false }) => {
  const [formData, setFormData] = useState({
    name: '', description: '', quantity: 1, price: '', vendorLink: '', imageUrl: ''
  });

  // Pre-fill the form if we are editing an existing item
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity || 1,
        price: item.price || '',
        vendorLink: item.vendorLink || '',
        imageUrl: item.imageUrl || '',
      });
    }
  }, [item]);

  const handleChange = (field, value) => {
    if (field === 'name' && value.includes(',')) {
      // Input validation
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSave} className={styles.itemForm}>
      <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Item Name*" required />
      <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Description (Optional)" rows="2" />
      <div className={styles.itemRow}>
        <input type="number" value={formData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} placeholder="Qty" min="1" />
        <input type="number" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="Price ($)" min="0" step="0.01" />
      </div>
      <input type="url" value={formData.vendorLink} onChange={(e) => handleChange('vendorLink', e.target.value)} placeholder="Vendor Link (Optional)" />
      <input type="url" value={formData.imageUrl} onChange={(e) => handleChange('imageUrl', e.target.value)} placeholder="Image URL (Optional)" />
      
      <div className={styles.buttonGroup}>
        {!isNew && <button type="button" onClick={onDelete} className={styles.deleteButton}>Delete</button>}
        {isNew && <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancel</button>}
        <button type="submit" className={styles.saveButton}>{isNew ? 'Add This Item' : 'Save Changes'}</button>
      </div>
    </form>
  );
};

export default ItemForm;