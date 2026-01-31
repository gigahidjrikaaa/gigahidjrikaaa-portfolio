"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, UserResponse } from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  user: UserResponse | null;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.verifyToken();
      setIsAuthenticated(!!result.valid);
      setUser(result.user || null);
      setIsAdmin(result.user?.is_admin || false);
    } catch (error) {
      console.error("Token verification failed", error);
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout().catch(() => undefined);
    setIsAuthenticated(false);
    setUser(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isLoading, user, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};