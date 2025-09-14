

'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, sendPasswordResetEmail, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import type { User, UiConfig } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getUiConfig, getUser } from '@/lib/firestore';
import { toggleWishlistProduct } from '@/lib/firestore.admin';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  uiConfig: UiConfig | null;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  isProductInWishlist: (productId: string) => boolean;
  handleToggleWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to create/update user profile in Firestore
const updateUserProfileInFirestore = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        // New user, create profile
        await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: Date.now(),
            isAdmin: false, // Default to not admin
            wishlist: [],
        }, { merge: true });
    }
    const userData = (await getDoc(userRef)).data();
    return { ...firebaseUser, ...userData } as User;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uiConfig, setUiConfig] = useState<UiConfig | null>(null);

  const fetchUser = useCallback(async (uid: string) => {
    const userProfile = await getUser(uid);
    if (userProfile) {
      setUser(userProfile as User);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await updateUserProfileInFirestore(firebaseUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    async function fetchConfig() {
        const config = await getUiConfig();
        setUiConfig(config);
    }
    fetchConfig();

    return () => unsubscribe();
  }, []);

  const isProductInWishlist = (productId: string): boolean => {
    return user?.wishlist?.includes(productId) ?? false;
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      // Or redirect to login
      console.error("User not logged in");
      return;
    }
    const currentStatus = isProductInWishlist(productId);
    // Optimistic update
    setUser(prevUser => {
        if (!prevUser) return null;
        const newWishlist = currentStatus 
            ? prevUser.wishlist?.filter(id => id !== productId)
            : [...(prevUser.wishlist || []), productId];
        return { ...prevUser, wishlist: newWishlist };
    });

    try {
      await toggleWishlistProduct(user.uid, productId, currentStatus);
    } catch (error) {
      // Revert optimistic update on error
      setUser(prevUser => {
        if (!prevUser) return null;
        const revertedWishlist = currentStatus
            ? [...(prevUser.wishlist || []), productId]
            : prevUser.wishlist?.filter(id => id !== productId);
        return { ...prevUser, wishlist: revertedWishlist };
      });
    }
  };

  const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // After creating the user, we create their profile in Firestore
        await updateUserProfileInFirestore(userCredential.user);
    }
    return userCredential;
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
        // On Google sign-in, we also ensure a user profile exists
        await updateUserProfileInFirestore(result.user);
    }
    return result;
  }

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const sendPasswordReset = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    uiConfig,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    isProductInWishlist,
    handleToggleWishlist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
