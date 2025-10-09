import React from 'react';
import styles from './Features.module.css';

const FeatureCard = ({ imageUrl, title, description }) => (
  <div className={styles.card}>
    <div 
      className={styles.image} 
      style={{ backgroundImage: `url(${imageUrl})` }}
    ></div>
    <div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </div>
  </div>
);

const Features = () => {
  const features = [
    {
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
      title: "Universal Wishlist",
      description: "Add items from any online store with our browser extension or manually enter your wishes.",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
      title: "Event-Based Organization",
      description: "Create separate wishlists for different events like birthdays, weddings, or baby showers.",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2070&auto=format&fit=crop",
      title: "Easy Gift Tracking",
      description: "Track which items have been purchased and by whom to avoid duplicate gifts.",
    },
  ];

  return (
    <section id="features" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Powerful Features for Seamless Planning
          </h2>
          <p className={styles.subtitle}>
            Presently offers a range of features designed to make your event planning stress-free and enjoyable.
          </p>
        </div>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;