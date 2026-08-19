import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { BUSINESS_INFO, SUPER_ADMIN_EMAIL, ADMIN_ACCESS_PASSWORD } from '../data/initialData';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isReseller: boolean;
  isLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: UserRole, phone?: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string, role?: UserRole, phone?: string) => Promise<void>;
  loginAsAdminDirectly: (email: string, pass: string) => boolean;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('local_admin_auth') === 'true';
  });
  const [isReseller, setIsReseller] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Direct simple local login check as requested
  const loginAsAdminDirectly = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() && pass === ADMIN_ACCESS_PASSWORD) {
      localStorage.setItem('local_admin_auth', 'true');
      setIsAdmin(true);
      const adminProfile: UserProfile = {
        id: 'admin-master',
        uid: 'admin-master',
        email: SUPER_ADMIN_EMAIL,
        displayName: 'Super Administrator',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setUserProfile(adminProfile);
      return true;
    }
    return false;
  };

  const syncUserProfile = async (user: FirebaseUser, defaultRole: UserRole = 'customer', displayName?: string, phone?: string) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      let userDoc;
      try {
        userDoc = await getDoc(userRef);
      } catch (err) {
        userDoc = { exists: () => false, data: () => null } as any;
      }

      const isSuperAdmin = (user.email?.toLowerCase() === BUSINESS_INFO.adminEmail.toLowerCase()) || localStorage.getItem('local_admin_auth') === 'true';
      const role: UserRole = isSuperAdmin ? 'admin' : (userDoc.exists() ? userDoc.data().role : defaultRole);

      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          id: user.uid,
          uid: user.uid,
          email: user.email || '',
          displayName: displayName || user.displayName || (isSuperAdmin ? 'Super Administrator' : 'User'),
          phone: phone || '',
          role: role,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
        } catch (err) {
          setUserProfile(newProfile);
        }

        if (role === 'reseller') {
          try {
            const resellerRef = doc(db, 'resellers', user.uid);
            await setDoc(resellerRef, {
              id: user.uid,
              userId: user.uid,
              businessName: displayName ? `${displayName}'s Store` : 'Reseller Hub',
              phone: phone || '',
              email: user.email || '',
              status: 'active',
              commissionRate: 15,
              totalEarnings: 0,
              pendingEarnings: 0,
              paidEarnings: 0,
              createdAt: new Date().toISOString(),
            });

            const walletRef = doc(db, 'wallets', user.uid);
            await setDoc(walletRef, {
              id: user.uid,
              userId: user.uid,
              balance: 0,
              pendingBalance: 0,
              totalWithdrawn: 0,
              updatedAt: new Date().toISOString(),
            });
          } catch (e) {
            console.error('Failed to initialize reseller wallet:', e);
          }
        }
      } else {
        const data = userDoc.data() as UserProfile;
        if (isSuperAdmin && data.role !== 'admin') {
          try {
            await updateDoc(userRef, { role: 'admin' });
            data.role = 'admin';
          } catch (e) {
            // Handled
          }
        }
        setUserProfile(data);
      }

      setIsAdmin(isSuperAdmin || role === 'admin');
      setIsReseller(role === 'reseller');
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  };

  useEffect(() => {
    // Check local admin persistence
    if (localStorage.getItem('local_admin_auth') === 'true') {
      setIsAdmin(true);
      if (!userProfile) {
        setUserProfile({
          id: 'admin-master',
          uid: 'admin-master',
          email: SUPER_ADMIN_EMAIL,
          displayName: 'Super Administrator',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        });
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setCurrentUser(user);
        await syncUserProfile(user);
      } else {
        setCurrentUser(null);
        if (localStorage.getItem('local_admin_auth') !== 'true') {
          setUserProfile(null);
          setIsAdmin(false);
        }
        setIsReseller(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      await syncUserProfile(currentUser);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    // If matching master admin credentials directly
    if (email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && pass === ADMIN_ACCESS_PASSWORD) {
      loginAsAdminDirectly(email, pass);
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      let message = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please verify and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Access temporarily restricted due to many failed attempts. Please reset your password or try again later.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string = '', role: UserRole = 'customer', phone?: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name) {
        try {
          await updateFirebaseProfile(cred.user, { displayName: name });
        } catch (e) {
          // Ignored
        }
      }
      await syncUserProfile(cred.user, role, name, phone);
    } catch (err: any) {
      let message = 'Failed to register account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      throw err;
    }
  };

  const register = async (email: string, pass: string, name: string = 'Super Administrator', role: UserRole = 'admin', phone?: string) => {
    return signUpWithEmail(email, pass, name, role, phone);
  };

  const signIn = async (email: string, pass: string) => {
    return signInWithEmail(email, pass);
  };

  const signInWithGoogle = async (role: UserRole = 'customer') => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await syncUserProfile(cred.user, role);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      const message = err.message || 'Google sign in failed.';
      setAuthError(message);
      throw err;
    }
  };

  const sendResetEmail = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      const message = err.code === 'auth/user-not-found'
        ? 'No account found with this email address.'
        : 'Failed to send password reset email. Please try again.';
      setAuthError(message);
      throw err;
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!currentUser) throw new Error('No user currently logged in');
    setAuthError(null);
    try {
      await updatePassword(currentUser, newPassword);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to update password');
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem('local_admin_auth');
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (e) {
      // Handled
    }
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsReseller(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isReseller,
        isLoading,
        authError,
        clearAuthError,
        signInWithEmail,
        signUpWithEmail,
        signIn,
        register,
        loginAsAdminDirectly,
        signInWithGoogle,
        sendResetEmail,
        changePassword,
        logout,
        logOut: logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
