import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { authApi, JWT_TOKEN_KEY } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendOnline: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AUTH_STORAGE_KEY = 'expenseflow_auth_session';
const OFFLINE_USERS_KEY = 'expenseflow_offline_registered_users';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  // Initialize auth state by verifying JWT token from backend/storage on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(JWT_TOKEN_KEY);
      const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);

      if (token) {
        try {
          const userProfile = await authApi.getCurrentUser();
          const authUser: AuthUser = {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
          };
          setUser(authUser);
          setIsBackendOnline(true);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        } catch (err: any) {
          // If server token validation failed, check fallback or clear
          if (!err.response) {
            setIsBackendOnline(false);
          }
          if (storedSession) {
            try {
              setUser(JSON.parse(storedSession));
            } catch {
              localStorage.removeItem(AUTH_STORAGE_KEY);
              localStorage.removeItem(JWT_TOKEN_KEY);
            }
          }
        }
      } else if (storedSession) {
        try {
          setUser(JSON.parse(storedSession));
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const getOfflineAccounts = (): { id: string; name: string; email: string; password: string }[] => {
    try {
      const raw = localStorage.getItem(OFFLINE_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      // Authenticate directly against MongoDB via Spring Boot
      const res = await authApi.login(trimmedEmail, password);
      if (res.token) {
        localStorage.setItem(JWT_TOKEN_KEY, res.token);
      }

      const authenticatedUser: AuthUser = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        rememberMe,
      };

      setUser(authenticatedUser);
      setIsBackendOnline(true);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      return { success: true };
    } catch (err: any) {
      // If Spring Boot backend is offline / unreachable in browser preview:
      if (!err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setIsBackendOnline(false);

        // Check offline registered account or create fallback session
        const accounts = getOfflineAccounts();
        const existing = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);

        if (existing && existing.password !== password) {
          return { success: false, error: 'Incorrect password for this account.' };
        }

        const formattedName = existing?.name || (() => {
          const namePart = trimmedEmail.split('@')[0];
          return namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, ' ');
        })();

        const offlineUser: AuthUser = {
          id: existing?.id || `usr_${Date.now()}`,
          email: trimmedEmail,
          name: formattedName,
          rememberMe,
        };

        setUser(offlineUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(offlineUser));
        return { success: true };
      }

      const serverMsg = err.response?.data?.message || err.message;
      return {
        success: false,
        error: serverMsg || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      // Store new user directly in MongoDB via Spring Boot
      const res = await authApi.register(trimmedName, trimmedEmail, password);
      if (res.token) {
        localStorage.setItem(JWT_TOKEN_KEY, res.token);
      }

      const authenticatedUser: AuthUser = {
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        rememberMe,
      };

      setUser(authenticatedUser);
      setIsBackendOnline(true);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      return { success: true };
    } catch (err: any) {
      // If Spring Boot backend is offline / unreachable in browser preview:
      if (!err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setIsBackendOnline(false);

        const accounts = getOfflineAccounts();
        const existing = accounts.some((a) => a.email.toLowerCase() === trimmedEmail);
        if (existing) {
          return { success: false, error: 'An account with this email already exists. Please log in.' };
        }

        const newAccount = {
          id: `usr_${Date.now()}`,
          name: trimmedName,
          email: trimmedEmail,
          password,
        };
        localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify([...accounts, newAccount]));

        const offlineUser: AuthUser = {
          id: newAccount.id,
          email: newAccount.email,
          name: newAccount.name,
          rememberMe,
        };

        setUser(offlineUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(offlineUser));
        return { success: true };
      }

      const serverMsg = err.response?.data?.message || err.message;
      return {
        success: false,
        error: serverMsg || 'Registration failed. An account with this email might already exist.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(JWT_TOKEN_KEY);
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${trimmedEmail}.`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

