import { db } from './config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

// Function to check if a user has any wishlists
export const checkIfUserHasWishlists = async (userId) => {
  if (!userId) return false;

  try {
    const wishlistsRef = collection(db, 'wishlists');
    // Create a query against the collection
    const q = query(
      wishlistsRef, 
      where("userId", "==", userId),
      limit(1) // We only need to find one to know they exist
    );
    
    const querySnapshot = await getDocs(q);
    
    // If the snapshot is not empty, it means the user has at least one wishlist
    return !querySnapshot.empty;

  } catch (error) {
    console.error("Error checking for wishlists: ", error);
    // Default to false if there's an error
    return false;
  }
};