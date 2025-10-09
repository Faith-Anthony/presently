import React from 'react';
import styles from './Testimonials.module.css';

const TestimonialCard = ({ quote, name, title, imageUrl }) => (
  <div className={styles.card}>
    <p className={styles.quote}>"{quote}"</p>
    <div className={styles.authorInfo}>
      <img alt={name} className={styles.avatar} src={imageUrl} />
      <div>
        <p className={styles.name}>{name}</p>
        <p className={styles.title}>{title}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const testimonialsData = [
    {
      quote: "Presently made planning my wedding so much easier! I loved being able to add items from any store and share my list with guests.",
      name: "Sarah L.",
      title: "Bride-to-be",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
    },
    {
      quote: "I used Presently for my 30th birthday and it was a hit! My friends loved the easy-to-use interface and I got exactly what I wanted.",
      name: "David M.",
      title: "Birthday Boy",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
    },
    {
      quote: "Organizing my baby shower was a breeze with Presently. The gift tracking feature helped me keep everything in order.",
      name: "Emily C.",
      title: "Mom-to-be",
      imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop",
    },
  ];

  return (
    <section id="testimonials" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>Loved by Users Worldwide</h2>
          <p className={styles.subtitle}>Don't just take our word for it. Here's what our users are saying about their experience.</p>
        </div>
        <div className={styles.grid}>
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;