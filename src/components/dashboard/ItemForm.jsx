import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from './ItemForm.module.css';
import currencyList from '../../data/currencyList';
import toast from 'react-hot-toast';

// Format currency data for react-select
const currencyOptions = currencyList.map(c => ({
  value: c.code,
  label: `${c.code} (${c.symbol_native || c.symbol})`
}));

// Find default currency option object (NGN or USD fallback)
const defaultCurrencyOption = currencyOptions.find(option => option.value === 'NGN') || currencyOptions.find(option => option.value === 'USD');

const ItemForm = ({ item, onSave, onDelete, onCancel, isNew = false }) => {
  // Use separate state for currency for clarity, defaulting to the NGN *object*
  const [currency, setCurrency] = useState(defaultCurrencyOption);
  // State for other fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [vendorLink, setVendorLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill form when editing an existing item
  useEffect(() => {
    if (item) {
      const selectedCurrency = currencyOptions.find(opt => opt.value === item.currency) || defaultCurrencyOption;
      setName(item.name || '');
      setDescription(item.description || '');
      setQuantity(item.quantity || 1);
      setPrice(item.price || '');
      setCurrency(selectedCurrency); // Set the currency object
      setVendorLink(item.vendorLink || '');
      setImageUrl(item.imageUrl || '');
    } else {
      // Reset to default for new item form
       setName(''); setDescription(''); setQuantity(1); setPrice('');
       setCurrency(defaultCurrencyOption); setVendorLink(''); setImageUrl('');
    }
  }, [item]); // Rerun effect if the item prop changes

  const handleNameChange = (e) => {
      const value = e.target.value;
      if (value.includes(',')) {
        toast.error("Item name cannot contain commas.");
        return;
      }
      setName(value);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const dataToSave = {
        name: name,
        description: description,
        quantity: Number(quantity) || 1,
        price: Number(price) || 0,
        currency: currency?.value || 'USD', // Extract the code from the currency object state
        vendorLink: vendorLink,
        imageUrl: imageUrl,
    };
    try {
        await onSave(dataToSave);
    } catch (error) {
        console.error("Save failed:", error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className={styles.itemForm}>
      <input type="text" value={name} onChange={handleNameChange} placeholder="Item Name*" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (Optional)" rows="2" />
      <div className={styles.itemRow}>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" min="1" />
        <div className={styles.priceGroup}>
          <Select
            className={styles.currencySelect}
            classNamePrefix="react-select"
            options={currencyOptions}
            
            value={currency}
            onChange={setCurrency} // Directly update the currency state object
            isSearchable={true}
            placeholder="CUR"
          />
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" min="0" step="0.01" />
        </div>
      </div>
      <input type="url" value={vendorLink} onChange={(e) => setVendorLink(e.target.value)} placeholder="Vendor Link (Optional)" />
      <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (Optional)" />

      <div className={styles.buttonGroup}>
        {!isNew && <button type="button" onClick={onDelete} className={styles.deleteButton} disabled={isSaving}>Delete</button>}
        {isNew && <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={isSaving}>Cancel</button>}
        <button type="submit" className={styles.saveButton} disabled={isSaving}>
            {isSaving ? 'Saving...' : (isNew ? 'Add This Item' : 'Save Changes')}
        </button>
      </div>
    </form>
  );
};

export default ItemForm;