import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import styles from './DashboardPage.module.css';
import { Link } from 'react-router-dom';

import DashboardNav from '../components/dashboard/DashboardNav';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import WishlistCard from '../components/dashboard/WishlistCard';
import UpgradePrompt from '../components/dashboard/UpgradePrompt';
import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const wishlistsRef = collection(db, 'wishlists');
    const q = query(
      wishlistsRef,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userWishlists = [];
      querySnapshot.forEach((doc) => {
        userWishlists.push({ id: doc.id, ...doc.data() });
      });
      setWishlists(userWishlists);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  // Check if the user can create more wishlists (limit is 2 for free plan)
  const canCreateMore = wishlists.length < 2;

  return (
    <div className={styles.dashboardContainer}>
      <DashboardNav />
      <main className={styles.mainContent}>
        {/* Pass the result of our check to the header component */}
        <DashboardHeader userName={userName} canCreate={canCreateMore} />

        <ScrollAnimationWrapper>
          <UpgradePrompt />
        </ScrollAnimationWrapper>
        
        {loading ? (
          <p>Loading your wishlists...</p>
        ) : wishlists.length === 0 ? (
          <div className={styles.noWishlists}>
            <h3>No wishlists yet!</h3>
            <p>Get started by creating your first one.</p>
            <Link to="/create-wishlist" className={styles.createButtonLink}>Create a Wishlist</Link>
          </div>
        ) : (
          <div className={styles.wishlistGrid}>
            {wishlists.map(wishlist => (
              <ScrollAnimationWrapper key={wishlist.id}>
                <WishlistCard wishlist={wishlist} />
              </ScrollAnimationWrapper>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;