import React from 'react';
// Import existing components from the parent folder
import Header from '../Header'; 
import Footer from '../Footer'; 
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <Header />
      <main className={styles.mainContent}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;