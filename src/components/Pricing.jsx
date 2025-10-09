import React from 'react';
import styles from './Pricing.module.css';
import CheckIcon from './UI/CheckIcon';

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      buttonText: "Get Started",
      features: ["Limited Wishlists", "Basic Item Tracking", "Standard Support"],
      isPopular: false,
    },
    {
      name: "Premium",
      price: "$1.50",
      period: "/month",
      buttonText: "Upgrade Now",
      features: ["All Basic Features", "Advanced Item Tracking", "Priority Support", "Customizable Themes"],
      isPopular: true,
    },
    {
      name: "Ultimate",
      price: "$3.00",
      period: "/month",
      buttonText: "Upgrade",
      features: ["All Premium Features", "VIP Support", "Exclusive Features", "Personalized Assistance"],
      isPopular: false,
    },
  ];

  return (
    <section id="pricing" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Choose Your Perfect Plan</h2>
          <p className={styles.subtitle}>
            Start for free and upgrade as your needs grow. Simple, transparent pricing for everyone.
          </p>
        </div>
        <div className={styles.grid}>
          {plans.map((plan) => (
            <div key={plan.name} className={`${styles.card} ${plan.isPopular ? styles.popularCard : ''}`}>
              {plan.isPopular && (
                <div className={styles.popularTag}>Popular</div>
              )}
              <h3 className={`${styles.planName} ${plan.isPopular ? styles.popularName : ''}`}>{plan.name}</h3>
              <p className={styles.priceContainer}>
                <span className={styles.price}>{plan.price}</span>
                {plan.period && <span className={styles.period}>{plan.period}</span>}
              </p>
              <button className={`${styles.button} ${plan.isPopular ? styles.popularButton : styles.standardButton}`}>
                {plan.buttonText}
              </button>
              <ul className={styles.featureList}>
                {plan.features.map((feature) => (
                  <li key={feature} className={styles.featureItem}>
                    <CheckIcon />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;