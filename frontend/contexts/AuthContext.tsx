import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, type User } from '@/services/authAPI';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check authentication status on app startup
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have stored credentials
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        // Try to get fresh user data from server
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            // Server request failed, likely invalid token
            console.log('[AuthContext] Server auth failed, clearing credentials');
            await authService.logout();
            setUser(null);
          }
        } catch (authError) {
          // Network or auth error, clear credentials and start fresh
          console.log('[AuthContext] Auth error, clearing credentials:', authError);
          await authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On any error, clear everything and start fresh
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting sign in...');
      const response = await authService.login({ email, password });
      
      if (response.success && response.data) {
        console.log('[AuthContext] Sign in successful, setting user');
        setUser(response.data.user);
        return { success: true };
      } else {
        console.log('[AuthContext] Sign in failed:', response.error);
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('[AuthContext] Sign in error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting sign up...');
      const response = await authService.register({ name, email, password });
      
      if (response.success && response.data) {
        console.log('[AuthContext] Sign up successful, setting user');
        setUser(response.data.user);
        return { success: true };
      } else {
        console.log('[AuthContext] Sign up failed:', response.error);
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('[AuthContext] Sign up error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if logout fails, clear local state
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Also update cached user data
      authService.setUser(updatedUser);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}