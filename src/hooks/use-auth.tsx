
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, sendPasswordResetEmail, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import type { User, UiConfig } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getUiConfig } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  uiConfig: UiConfig | null;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to create/update user profile in Firestore
const updateUserProfile = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    let mobile = '';

    if (!userDoc.exists()) {
        // New user, create profile
        await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: Date.now(),
            isAdmin: false, // Default to not admin
        });
    } else {
        mobile = userDoc.data()?.mobile || '';
    }
    const userData = (await getDoc(userRef)).data();
    return { ...firebaseUser, ...userData, mobile } as User;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uiConfig, setUiConfig] = useState<UiConfig | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await updateUserProfile(firebaseUser);
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

  const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // After creating the user, we create their profile in Firestore
        await updateUserProfile(userCredential.user);
    }
    return userCredential;
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
        // On Google sign-in, we also ensure a user profile exists
        await updateUserProfile(result.user);
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
