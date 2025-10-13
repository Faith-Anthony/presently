import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.css';

import DashboardNav from '../components/dashboard/DashboardNav';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import WishlistCard from '../components/dashboard/WishlistCard';
import UpgradePrompt from '../components/dashboard/UpgradePrompt';
import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';

const DashboardPage = () => {
  const { currentUser } = useAuth();

  // Placeholder data for the user's plan and wishlists
  const userPlan = 'Free'; // This could come from your user data in the future
  const wishlists = [
    { id: 1, title: "My 30th Birthday", date: "2025-11-20", itemCount: 12 },
    { id: 2, title: "Wedding Registry", date: "2026-06-15", itemCount: 78 },
    { id: 3, title: "Baby Shower Wishlist", date: "2025-12-05", itemCount: 45 },
  ];

  // A placeholder name. You would get this from the currentUser object.
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className={styles.dashboardContainer}>
      <DashboardNav />
      <main className={styles.mainContent}>
        <DashboardHeader userName={userName} />

        {userPlan === 'Free' && (
          <ScrollAnimationWrapper>
            <UpgradePrompt />
          </ScrollAnimationWrapper>
        )}

        <div className={styles.wishlistGrid}>
          {wishlists.map(wishlist => (
            <ScrollAnimationWrapper key={wishlist.id}>
              <WishlistCard wishlist={wishlist} />
            </ScrollAnimationWrapper>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;