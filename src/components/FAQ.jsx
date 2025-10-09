import React from 'react';
import styles from './FAQ.module.css';

const FaqItem = ({ question, answer }) => (
  <details className={styles.faqItem}>
    <summary className={styles.question}>
      {question}
      <svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd"></path>
      </svg>
    </summary>
    <p className={styles.answer}>{answer}</p>
  </details>
);

const FAQ = () => {
  const faqsData = [
    {
      question: "How do I create a wishlist?",
      answer: "Creating a wishlist is easy! Simply sign up for a free account, click 'Create Wishlist,' and start adding items. You can use our browser extension or manually enter item details.",
    },
    {
      question: "Can I add items from any website?",
      answer: "Absolutely! Our browser extension allows you to add items from any online store with a single click. You can also manually add items if you prefer.",
    },
    {
      question: "Is there a mobile app available?",
      answer: "While we don't have a dedicated mobile app yet, our website is fully responsive and works beautifully on all devices, including smartphones and tablets.",
    },
  ];

  return (
    <section id="faqs" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Frequently Asked Questions</h2>
          <p className={styles.subtitle}>Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.</p>
        </div>
        <div className={styles.faqList}>
          {faqsData.map((faq, index) => (
            <FaqItem key={index} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;