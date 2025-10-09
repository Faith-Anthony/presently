import React from 'react';
import styles from './LandingPage.module.css';

import ScrollAnimationWrapper from '../components/ScrollAnimationWrapper';
import Header from '../components/Header';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main>
        <Hero />
        
        <ScrollAnimationWrapper>
          <HowItWorks />
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper>
          <Features />
        </ScrollAnimationWrapper>
        
        <ScrollAnimationWrapper>
          <Pricing />
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper>
          <Testimonials />
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper>
          <FAQ />
        </ScrollAnimationWrapper>
        
        <ScrollAnimationWrapper>
          <CTA />
        </ScrollAnimationWrapper>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;