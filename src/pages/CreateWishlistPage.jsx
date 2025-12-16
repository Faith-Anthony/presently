import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import styles from './CreateWishlistPage.module.css';

const CreateWishlistPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    eventDate: '',
    category: 'General',
    description: ''
  });

  const categories = ['General', 'Birthday', 'Wedding', 'Baby Shower', 'Christmas', 'Graduation', 'Housewarming'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      // Create the wishlist document in Firestore
      const docRef = await addDoc(collection(db, 'wishlists'), {
        userId: auth.currentUser.uid,
        name: formData.name,
        eventDate: formData.eventDate, // Store as string (YYYY-MM-DD)
        category: formData.category,
        description: formData.description,
        createdAt: serverTimestamp(),
        items: [],
        itemCount: 0
      });

      // Redirect to the "Manage Items" page for this new list
      navigate(`/manage-items/${docRef.id}`);
    } catch (error) {
      console.error("Error creating wishlist:", error);
      alert("Failed to create wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
        <h1>Create New Wishlist</h1>
        <p>Give your event a name and date to get started.</p>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {/* Wishlist Name */}
          <div className={styles.formGroup}>
            <label htmlFor="name">Wishlist Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Sarah's 30th Birthday"
              required
            />
          </div>

          {/* Date & Category Row */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="eventDate">Event Date</label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Occasion</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell your guests what this event is about..."
              rows="3"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating...' : 'Create & Add Items →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWishlistPage;