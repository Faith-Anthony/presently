import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage = () => {
  // State to handle the FAQ dropdowns
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Scroll Reveal Animation Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.active);
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the item is visible
    );

    // Select all elements with the 'reveal' class
    const hiddenElements = document.querySelectorAll(`.${styles.reveal}`);
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // FAQ Data
  const faqs = [
    {
      question: "Is Presently really free?",
      answer: "Yes! Our Basic plan is completely free and allows you to create up to 2 wishlists with 5 items each. It's perfect for getting started."
    },
    {
      question: "Can guests reserve items without an account?",
      answer: "Absolutely. We designed the guest experience to be frictionless. They can view and reserve gifts just by entering their name—no signup required."
    },
    {
      question: "How do I share my wishlist?",
      answer: "Once you create a list, you'll get a unique \"Presently\" link (e.g., presently/your-name/list-id). You can copy and paste this link anywhere—social media, WhatsApp, or email."
    },
    {
      question: "Can I add items from any store?",
      answer: "Yes. You can manually add items from Amazon, Etsy, local boutiques, or anywhere else. Just paste the link and fill in the details."
    }
  ];

  return (
    <div className={styles.container}>
      <main>
        {/* --- Hero Section --- */}
        <section className={`${styles.heroSection} ${styles.reveal}`}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Create & Share Your Perfect Wishlist
            </h1>
            <p className={styles.heroSubtitle}>
              Plan your dream events with ease. From birthdays to weddings,
              Presently helps you curate and share your ideal gifts with friends
              and family.
            </p>
            <Link to="/signup">
              <button className={styles.ctaButton}>
                Get Started for Free
              </button>
            </Link>
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section className={`${styles.section} ${styles.reveal}`} id="how-it-works">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Simple Steps to Your Dream Event
            </h2>
            <p className={styles.sectionText}>
              Presently makes it easy to create, share, and manage your
              wishlists for any event. Follow these simple steps to get started.
            </p>
          </div>
          <div className={styles.grid}>
            {/* Step 1 */}
            <div className={styles.card}>
              <div className={styles.iconWrapper}>
                <svg fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10H3"></path>
                  <path d="M21 6H3"></path>
                  <path d="M21 14H3"></path>
                  <path d="M21 18H3"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Create Your Wishlist</h3>
              <p className={styles.cardText}>
                Easily add items from any online store or create custom wishes.
                Organize your list by event or category.
              </p>
            </div>
            {/* Step 2 */}
            <div className={styles.card}>
              <div className={styles.iconWrapper}>
                <svg fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
                  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Share with Loved Ones</h3>
              <p className={styles.cardText}>
                Share your wishlist link with friends and family. They can mark
                items as purchased to avoid duplicates.
              </p>
            </div>
            {/* Step 3 */}
            <div className={styles.card}>
              <div className={styles.iconWrapper}>
                <svg fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a5 5 0 0 0-5 5v2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2V7a5 5 0 0 0-5-5z"></path>
                  <path d="M12 22v-4"></path>
                  <path d="M12 7v4"></path>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Enjoy Your Special Day</h3>
              <p className={styles.cardText}>
                Receive the gifts you truly desire and celebrate your special
                occasion with joy.
              </p>
            </div>
          </div>
        </section>

        {/* --- Features Section --- */}
        <section className={`${styles.section} ${styles.reveal}`} id="features">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Powerful Features for Seamless Planning
            </h2>
            <p className={styles.sectionText}>
              Presently offers a range of features designed to make your event
              planning stress-free and enjoyable.
            </p>
          </div>
          <div className={styles.grid}>
            {/* Feature 1 */}
            <div className={styles.featureItem}>
              <div className={styles.featureImage} style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2940&auto=format&fit=crop")' }}></div>
              <div>
                <h3 className={styles.cardTitle}>Universal Wishlist</h3>
                <p className={styles.cardText}>
                  Add items manually from any online store. Keep everything in one place.
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className={styles.featureItem}>
              <div className={styles.featureImage} style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2938&auto=format&fit=crop")' }}></div>
              <div>
                <h3 className={styles.cardTitle}>Event-Based Organization</h3>
                <p className={styles.cardText}>
                  Create separate wishlists for different events like
                  birthdays, weddings, or baby showers.
                </p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className={styles.featureItem}>
              <div className={styles.featureImage} style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2940&auto=format&fit=crop")' }}></div>
              <div>
                <h3 className={styles.cardTitle}>Easy Gift Tracking</h3>
                <p className={styles.cardText}>
                  Track which items have been reserved by guests to avoid duplicate gifts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Pricing Section --- */}
        <section className={`${styles.section} ${styles.reveal}`} id="pricing">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Choose Your Perfect Plan
            </h2>
            <p className={styles.sectionText}>
              Start for free and upgrade as your needs grow. Simple,
              transparent pricing for everyone.
            </p>
          </div>
          <div className={styles.grid}>
            {/* Free Plan */}
            <div className={styles.pricingCard}>
              <h3 className={styles.cardTitle}>Basic</h3>
              <div className={styles.price}>
                <span className={styles.amount}>Free</span>
              </div>
              <Link to="/signup">
                <button className={`${styles.planButton} ${styles.btnSecondary}`}>
                  Get Started
                </button>
              </Link>
              <ul className={styles.featuresList}>
                <li>
                  <CheckIcon />
                  <span>2 Active Wishlists</span>
                </li>
                <li>
                  <CheckIcon />
                  <span>5 Items Per List</span>
                </li>
              </ul>
            </div>
            
            {/* Premium Plan */}
            <div className={`${styles.pricingCard} ${styles.popularCard}`}>
              <div className={styles.popularBadge}>Popular</div>
              <h3 className={styles.cardTitle} style={{color: '#3b83f7'}}>Premium</h3>
              <div className={styles.price}>
                <span className={styles.amount}>$9.99</span>
                <span className={styles.period}>/month</span>
              </div>
              <button className={`${styles.planButton} ${styles.btnPrimary}`}>
                Upgrade Now
              </button>
              <ul className={styles.featuresList}>
                <li><CheckIcon /><span>Unlimited Wishlists</span></li>
                <li><CheckIcon /><span>Unlimited Items</span></li>
                <li><CheckIcon /><span>Priority Support</span></li>
              </ul>
            </div>

            {/* Ultimate Plan */}
            <div className={styles.pricingCard}>
              <h3 className={styles.cardTitle}>Ultimate</h3>
              <div className={styles.price}>
                <span className={styles.amount}>$19.99</span>
                <span className={styles.period}>/month</span>
              </div>
              <button className={`${styles.planButton} ${styles.btnSecondary}`}>
                Upgrade
              </button>
              <ul className={styles.featuresList}>
                <li><CheckIcon /><span>All Premium Features</span></li>
                <li><CheckIcon /><span>VIP Support</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- Testimonials Section --- */}
        <section className={`${styles.section} ${styles.reveal}`} id="testimonials">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Loved by Thousands</h2>
            <p className={styles.sectionText}>
              See what our happy users are saying about using Presently for their special moments.
            </p>
          </div>
          <div className={styles.testimonialGrid}>
            {/* Testimonial 1 */}
            <div className={styles.testimonialCard}>
              <p className={styles.quote}>
                "Presently made my wedding planning so much easier! Guests loved being able to see exactly what we wanted and marking it off. Highly recommend!"
              </p>
              <div className={styles.author}>
                <img loading="lazy" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Sarah M." className={styles.avatar} />
                <div className={styles.authorInfo}>
                  <h4>Sarah M.</h4>
                  <span>Happy Bride</span>
                </div>
              </div>
            </div>
             {/* Testimonial 2 */}
             <div className={styles.testimonialCard}>
              <p className={styles.quote}>
                "I used this for my 30th birthday bash. It was super simple to set up, and my friends found the interface very intuitive. The reservation feature is a lifesaver!"
              </p>
              <div className={styles.author}>
                <img loading="lazy" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="James L." className={styles.avatar} />
                <div className={styles.authorInfo}>
                  <h4>James L.</h4>
                  <span>Event Planner</span>
                </div>
              </div>
            </div>
             {/* Testimonial 3 */}
             <div className={styles.testimonialCard}>
              <p className={styles.quote}>
                "Finally, a wishlist app that actually looks good and works well on mobile. My family isn't tech-savvy, but they had no issues using Presently."
              </p>
              <div className={styles.author}>
                <img loading="lazy" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" alt="Emily R." className={styles.avatar} />
                <div className={styles.authorInfo}>
                  <h4>Emily R.</h4>
                  <span>Mom of Two</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FAQs Section --- */}
        <section className={`${styles.section} ${styles.reveal}`} id="faqs">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionText}>
              Have questions? We have answers.
            </p>
          </div>
          <div className={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`${styles.faqItem} ${openFaqIndex === index ? styles.active : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className={styles.faqHeader}>
                  <h3 className={styles.faqQuestion}>{faq.question}</h3>
                  <span className={styles.faqIcon}>
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className={openFaqIndex === index ? styles.rotateIcon : ''}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </div>
                {openFaqIndex === index && (
                  <div className={styles.faqContent}>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className={`${styles.section} ${styles.reveal}`}>
            <div className={styles.ctaSection}>
                <h2>Ready to Create Your Dream Wishlist?</h2>
                <p>Sign up today and start planning your perfect event with Presently. It's free to get started!</p>
                <Link to="/signup">
                <button className={styles.ctaButtonWhite}>
                    Get Started Now
                </button>
                </Link>
            </div>
        </section>
      </main>
    </div>
  );
};

// Check Icon Component
const CheckIcon = () => (
  <svg className={styles.checkIcon} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
  </svg>
);

export default HomePage;