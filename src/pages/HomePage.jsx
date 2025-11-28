import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

/* --- Inline Icons --- */
const Menu = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
);
const X = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
);
const Check = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>
);
const ChevronDown = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
);
const ChevronUp = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m18 15-6-6-6 6"/></svg>
);
const Wallet = ({ size = 24, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
);
const Star = ({ size = 24, fill = "none", color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const HomePage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Refs for scroll animation
  const revealRefs = useRef([]);

  // Add elements to the refs array
  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  // Intersection Observer for Lazy Loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.active);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    revealRefs.current.forEach((el) => observer.observe(el));

    return () => {
      revealRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Is Presently really free?",
      answer: "Yes! Our Starter plan is completely free and lets you create 1 active wishlist with up to 5 items. It's perfect for trying out the platform."
    },
    {
      question: "Can I share my list with anyone?",
      answer: "Absolutely. You get a unique public link for each wishlist that you can share via text, email, or social media. No account needed to view it."
    },
    {
      question: "How do I mark items as purchased?",
      answer: "When your friends visit your link, they can click 'Reserve' or 'Mark as Purchased' on an item so others don't buy it again."
    }
  ];

  return (
    <div className={styles.container}>
      {/* --- NAVBAR (Fixed Top) --- */}
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <Wallet size={22} color="white" />
          </div>
          <span className={styles.logoText}>Presently</span>
        </div>

        {/* Desktop Nav */}
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#faq">FAQs</a>
        </div>

        <div className={styles.authButtons}>
          <Link to="/login" className={styles.loginBtn}>Log In</Link>
          <Link to="/signup" className={styles.signupBtn}>Sign Up</Link>
        </div>

        {/* Mobile Menu Button */}
        <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
          <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <header className={`${styles.hero} ${styles.reveal}`} ref={addToRefs}>
        <div className={styles.heroContent}>
          <h1>Create & Share Your Perfect Wishlist</h1>
          <p>Plan your dream events with ease. From birthdays to weddings, Presently helps you curate and share your ideal gifts with friends and family.</p>
          <Link to="/signup" className={styles.ctaButton}>Get Started for Free</Link>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className={styles.features}>
        <div className={`${styles.sectionHeader} ${styles.reveal}`} ref={addToRefs}>
          <h2>Simple Steps to Your Dream Event</h2>
          <p className={styles.sectionSubtitle}>Presently makes it easy to create, share, and manage your wishlists for any event.</p>
        </div>
        
        <div className={styles.featureGrid}>
          {/* Feature 1 - Updated Image */}
          <div className={`${styles.featureCard} ${styles.reveal}`} ref={addToRefs}>
            <div className={styles.imageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=600&q=80" 
                alt="Create Wishlist" 
                className={styles.featureImage} 
              />
            </div>
            <div className={styles.featureText}>
              <h3>Create Your Wishlist</h3>
              <p>Start by adding items from any online store. Customize your list with photos, notes, and prices so guests know exactly what you want.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className={`${styles.featureCard} ${styles.reveal}`} ref={addToRefs}>
            <div className={styles.imageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" 
                alt="Share with friends" 
                className={styles.featureImage} 
              />
            </div>
            <div className={styles.featureText}>
              <h3>Share with Loved Ones</h3>
              <p>Get a unique, shareable link for your wishlist. Send it instantly via WhatsApp, email, or social media so everyone is on the same page.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className={`${styles.featureCard} ${styles.reveal}`} ref={addToRefs}>
            <div className={styles.imageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80" 
                alt="Enjoy gifts" 
                className={styles.featureImage} 
              />
            </div>
            <div className={styles.featureText}>
              <h3>Enjoy Your Special Day</h3>
              <p>Track what has been purchased in real-time. Guests can mark items as "bought" to avoid duplicates, letting you celebrate stress-free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className={styles.pricing}>
        <div className={`${styles.reveal}`} ref={addToRefs}>
          <h2>Choose the Plan That Fits You</h2>
        </div>
        <div className={styles.pricingGrid}>
          {/* Starter Plan */}
          <div className={`${styles.pricingCard} ${styles.reveal}`} ref={addToRefs}>
            <div className={styles.planHeader}>
              <h3>Starter</h3>
              <div className={styles.price}>Free</div>
              <p className={styles.planDesc}>Perfect for small events</p>
            </div>
            <ul className={styles.planFeatures}>
              <li><Check size={16} /> 1 Active Wishlist</li>
              <li><Check size={16} /> 5 Items per List</li>
              <li><Check size={16} /> Basic Sharing</li>
            </ul>
            <Link to="/signup" className={styles.planButtonOutline}>Sign Up Free</Link>
          </div>

          {/* Standard Plan */}
          <div className={`${styles.pricingCard} ${styles.popular} ${styles.reveal}`} ref={addToRefs}>
            <div className={styles.popularTag}>Most Popular</div>
            <div className={styles.planHeader}>
              <h3>Standard</h3>
              <div className={styles.price}>$4.99<span>/mo</span></div>
              <p className={styles.planDesc}>For avid planners</p>
            </div>
            <ul className={styles.planFeatures}>
              <li><Check size={16} /> 5 Active Wishlists</li>
              <li><Check size={16} /> Unlimited Items</li>
              <li><Check size={16} /> Priority Support</li>
              <li><Check size={16} /> Ad-Free Experience</li>
            </ul>
            <button className={styles.planButtonFilled}>Get Standard</button>
          </div>

          {/* Premium Plan */}
          <div className={`${styles.pricingCard} ${styles.reveal}`} ref={addToRefs}>
            <div className={styles.planHeader}>
              <h3>Premium</h3>
              <div className={styles.price}>$9.99<span>/mo</span></div>
              <p className={styles.planDesc}>The ultimate experience</p>
            </div>
            <ul className={styles.planFeatures}>
              <li><Check size={16} /> Unlimited Wishlists</li>
              <li><Check size={16} /> Custom Themes</li>
              <li><Check size={16} /> Event Planning Tools</li>
              <li><Check size={16} /> 24/7 Dedicated Support</li>
            </ul>
            <button className={styles.planButtonOutline}>Go Premium</button>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section id="testimonials" className={styles.testimonials}>
        <div className={`${styles.reveal}`} ref={addToRefs}>
          <h2>Loved by Thousands</h2>
        </div>
        <div className={styles.testimonialGrid}>
          <div className={`${styles.testimonialCard} ${styles.reveal}`} ref={addToRefs}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FBBF24" color="#FBBF24" />)}
            </div>
            <p>"Presently made my wedding registry so much easier. My guests loved how simple it was to use! Highly recommended."</p>
            <div className={styles.user}>
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" alt="Sarah" className={styles.avatar} />
              <div>
                <strong>Sarah Jenkins</strong>
                <span>Bride</span>
              </div>
            </div>
          </div>
          <div className={`${styles.testimonialCard} ${styles.reveal}`} ref={addToRefs}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FBBF24" color="#FBBF24" />)}
            </div>
            <p>"I used this for my 30th birthday and finally got the gifts I actually wanted. No more guessing games for my friends."</p>
            <div className={styles.user}>
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" alt="Mike" className={styles.avatar} />
              <div>
                <strong>Mike Thompson</strong>
                <span>Birthday Boy</span>
              </div>
            </div>
          </div>
          <div className={`${styles.testimonialCard} ${styles.reveal}`} ref={addToRefs}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FBBF24" color="#FBBF24" />)}
            </div>
            <p>"The best wishlist app I've tried. It's clean, simple, and my family actually knows how to use it without calling me."</p>
            <div className={styles.user}>
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80" alt="Emily" className={styles.avatar} />
              <div>
                <strong>Emily Rivera</strong>
                <span>Event Planner</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className={styles.faq}>
        <div className={`${styles.reveal}`} ref={addToRefs}>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} className={`${styles.faqItem} ${styles.reveal}`} ref={addToRefs}>
              <button 
                className={styles.faqQuestion} 
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                {openFaq === index ? <ChevronUp size={20} className={styles.iconBlue} /> : <ChevronDown size={20} className={styles.iconBlue} />}
              </button>
              <div className={`${styles.faqAnswer} ${openFaq === index ? styles.show : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.logoContainer}>
              <div className={styles.logoIcon}>
                <Wallet size={22} color="white" />
              </div>
              <span className={styles.footerLogoText}>Presently</span>
            </div>
            
            {/* TAGLINE: High Visibility */}
            <p className={styles.tagline}>Making gifting simple and meaningful for everyone.</p>

            {/* NEW GET STARTED BUTTON */}
            <Link to="/signup" className={styles.footerCtaButton}>
              Get Started
            </Link>
          </div>
          
          <div className={styles.footerLinks}>
            <h4>PRODUCT</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>

          <div className={styles.footerLinks}>
            <h4>SUPPORT</h4>
            <a href="#faq">FAQ</a>
            <Link to="/contact">Contact</Link>
          </div>

          <div className={styles.footerLinks}>
            <h4>LEGAL</h4>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} Presently. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;