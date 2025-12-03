'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js'; // We'll replace this with our own User type

// Let's define our own User type to avoid Supabase dependency
interface CustomUser {
  id: string;
  email: string;
  // Add any other user properties you need from your backend
  fullName?: string;
  avatarUrl?: string;
}

type AuthContextType = {
  user: CustomUser | null;
  setUser: (user: CustomUser | null) => void;
  loading: boolean;
  // We will add login, logout, signup functions here later
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In the future, we'll check for a token in localStorage here 
    // to automatically log the user in.
    // For now, we just stop loading.
    setLoading(false);
  }, []);

  const value = {
    user,
    setUser, // Exposing setUser for now for flexibility
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
