import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase/config'; // Import db
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import toast from 'react-hot-toast';
import styles from './Auth.module.css';
import Logo from '../components/Logo';
import { checkIfUserHasWishlists } from '../firebase/services';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// Helper components for the icons
const EyeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>);
const EyeOffIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L21.73 23 23 21.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>);


const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Function to create/update user profile in Firestore
  const createUserProfile = async (user) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        createdAt: serverTimestamp(),
        freeWishlistsCreated: 0 // Initialize the counter
      }, { merge: true }); // Use merge to safely create or update
      console.log("User profile created/updated for:", user.uid);
    } catch (error) {
      console.error("Error creating user profile: ", error);
      toast.error("Could not save user profile information.");
    }
  };

  // Handles navigation after successful signup & profile creation
  const handleSuccessfulSignup = async (user) => {
    if (!user) return;
    await createUserProfile(user); // Ensure profile is created
    // Navigate directly to create first wishlist for new user
    navigate('/create-wishlist');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
      await handleSuccessfulSignup(userCredential.user); // Call the signup-specific handler
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success('Signed in with Google successfully!');
      // Check if user is new or existing based on metadata (optional but good)
      // const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
      await handleSuccessfulSignup(result.user); // Treat Google sign-in like signup flow initially
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className={styles.authContainer}>
        <Logo />
        <div className={styles.authCard}>
          <h2>Create an Account</h2>
          <form onSubmit={handleSignup} className={styles.authForm}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
            <div className={styles.passwordWrapper}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.eyeButton}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div className={styles.passwordWrapper}>
              <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.eyeButton}>
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <div className={styles.divider}>OR</div>
          <button type="button" onClick={handleGoogleSignIn} className={styles.googleButton} disabled={isLoading}>
            Sign Up with Google
          </button>
          <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </>
  );
};

export default SignupPage;