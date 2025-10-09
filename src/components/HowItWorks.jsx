import React from 'react';
import styles from './HowItWorks.module.css';

// SVG Icons as components for cleaner JSX
const ListIcon = () => (
    <svg fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M21 10H3"></path><path d="M21 6H3"></path><path d="M21 14H3"></path><path d="M21 18H3"></path></svg>
);
const ShareIcon = () => (
    <svg fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
);
const GiftIcon = () => (
    <svg fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a5 5 0 0 0-5 5v2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5z"></path><path d="M12 22v-4"></path><path d="M12 7v4"></path></svg>
);

const HowItWorks = () => {
  const steps = [
    {
      icon: <ListIcon />,
      title: "Create Your Wishlist",
      description: "Easily add items from any online store or create custom wishes. Organize your list by event or category.",
    },
    {
      icon: <ShareIcon />,
      title: "Share with Loved Ones",
      description: "Share your wishlist link with friends and family. They can mark items as purchased to avoid duplicates.",
    },
    {
      icon: <GiftIcon />,
      title: "Enjoy Your Special Day",
      description: "Receive the gifts you truly desire and celebrate your special occasion with joy.",
    },
  ];

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Simple Steps to Your Dream Event
          </h2>
          <p className={styles.subtitle}>
            Presently makes it easy to create, share, and manage your wishlists for any event. Follow these simple steps to get started.
          </p>
        </div>
        <div className={styles.grid}>
          {steps.map((step, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrapper}>
                {step.icon}
              </div>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;