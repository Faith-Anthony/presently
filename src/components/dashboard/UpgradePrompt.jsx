import React from 'react';
import styles from './UpgradePrompt.module.css';

const UpgradePrompt = () => {
  return (
    <div className={styles.prompt}>
      <div className={styles.content}>
        <p className={styles.text}>You're on the Free Plan. Upgrade to unlock more features!</p>
        <button className={styles.button}>Upgrade Now</button>
      </div>
    </div>
  );
};

export default UpgradePrompt;