import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';
import Logo from '../components/Logo';
import { checkIfUserHasWishlists } from '../firebase/services'; // Import the helper function

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
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
        <h2>Welcome Back!</h2>
        <form onSubmit={handleLogin} className={styles.authForm}>
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
          <button type="submit">Log In</button>
        </form>
        <div className={styles.divider}>OR</div>
        <button onClick={handleGoogleSignIn} className={styles.googleButton}>
          Sign In with Google
        </button>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;