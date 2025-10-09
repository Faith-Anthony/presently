import React from 'react';
import styles from './Footer.module.css';

const WishlistIcon = () => (
    <svg className={styles.icon} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path>
        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1-.9-2-2-2Z"></path>
    </svg>
);

const Footer = () => {
    const footerLinks = ["About", "Contact", "Privacy Policy", "Terms"];

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <a href="#" className={styles.logoLink}>
                        <div className={styles.logoIconWrapper}>
                           <WishlistIcon />
                        </div>
                        <h2 className={styles.logoText}>Presently</h2>
                    </a>
                    <nav className={styles.navigation}>
                        {footerLinks.map((link) => (
                           <a key={link} href="#" className={styles.navLink}>{link}</a>
                        ))}
                    </nav>
                </div>
                <p className={styles.copyright}>© 2025 Presently. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;