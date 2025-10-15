import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';
import Logo from '../components/Logo';
import { checkIfUserHasWishlists } from '../firebase/services'; // Import the helper function

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSuccessfulLogin = async (user) => {
    if (!user) return;
    const hasWishlists = await checkIfUserHasWishlists(user.uid);
    if (hasWishlists) {
      navigate('/dashboard');
    } else {
      navigate('/create-wishlist');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
      await handleSuccessfulLogin(userCredential.user);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      toast.success('Signed in with Google successfully!');
      await handleSuccessfulLogin(result.user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <Logo />
      <div className={styles.authCard}>
        <h2>Create an Account</h2>
        <form onSubmit={handleSignup} className={styles.authForm}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <div className={styles.divider}>OR</div>
        <button onClick={handleGoogleSignIn} className={styles.googleButton}>
          Sign Up with Google
        </button>
        <p>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;