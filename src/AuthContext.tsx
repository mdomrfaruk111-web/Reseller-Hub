import React, { createContext, useContext, useState } from 'react';
import { User } from './types';
import { auth, db } from './firebase';
import { DEFAULT_STORE_SETTINGS, SUPER_ADMIN_EMAIL } from './initialData';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isReseller: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;
  const isReseller = currentUser?.role === 'reseller';

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isReseller, login, logout }}>
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
