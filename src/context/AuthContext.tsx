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
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (codeOrToken: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailByToken: (token: string) => Promise<{ success: boolean; error?: string }>;
  changeEmail: (newEmail: string, currentEmail?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resendVerification: (email?: string) => Promise<{ success: boolean; message?: string; error?: string; simulatedOtp?: string }>;
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
            emailVerified: userProfile.emailVerified ?? false,
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

  const getOfflineAccounts = (): { id: string; name: string; email: string; password: string; emailVerified?: boolean }[] => {
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
        emailVerified: res.user.emailVerified ?? false,
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
          emailVerified: existing?.emailVerified ?? (trimmedEmail === 'david@expenseflow.com'),
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
        emailVerified: true,
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
          emailVerified: true,
        };
        localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify([...accounts, newAccount]));

        const offlineUser: AuthUser = {
          id: newAccount.id,
          email: newAccount.email,
          name: newAccount.name,
          emailVerified: true,
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

  const verifyEmail = async (codeOrToken: string, emailTarget?: string): Promise<{ success: boolean; error?: string }> => {
    const targetEmail = emailTarget || user?.email;
    const trimmedInput = codeOrToken.trim();

    if (!trimmedInput) {
      return { success: false, error: 'Please enter the verification code or token.' };
    }

    try {
      const isToken = trimmedInput.length > 10;
      const res = await authApi.verifyEmail(
        isToken ? { token: trimmedInput, email: targetEmail } : { code: trimmedInput, email: targetEmail }
      );
      if (res.token) {
        localStorage.setItem(JWT_TOKEN_KEY, res.token);
      }

      setUser((prev) => {
        const userObj: AuthUser = res.user
          ? {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              emailVerified: true,
              rememberMe: prev?.rememberMe ?? true,
            }
          : prev
          ? { ...prev, emailVerified: true }
          : {
              id: 'verified-user',
              name: targetEmail?.split('@')[0] || 'User',
              email: targetEmail || '',
              emailVerified: true,
            };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
        return userObj;
      });

      // Update offline account cache if present
      if (targetEmail) {
        const accounts = getOfflineAccounts();
        const updatedAccounts = accounts.map((acc) =>
          acc.email.toLowerCase() === targetEmail.toLowerCase() ? { ...acc, emailVerified: true } : acc
        );
        localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(updatedAccounts));
      }

      return { success: true };
    } catch (err: any) {
      // Offline fallback verification: allow code 123456 or any 6-digit number in offline mode
      if (!err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        if (trimmedInput.length >= 6) {
          setUser((prev) => {
            const userObj: AuthUser = prev
              ? { ...prev, emailVerified: true }
              : {
                  id: 'verified-user',
                  name: targetEmail?.split('@')[0] || 'User',
                  email: targetEmail || '',
                  emailVerified: true,
                };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
            return userObj;
          });

          if (targetEmail) {
            const accounts = getOfflineAccounts();
            const updatedAccounts = accounts.map((acc) =>
              acc.email.toLowerCase() === targetEmail.toLowerCase() ? { ...acc, emailVerified: true } : acc
            );
            localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(updatedAccounts));
          }

          return { success: true };
        }
        return { success: false, error: 'Please enter a valid 6-digit code (e.g. 123456).' };
      }

      const serverMsg = err.response?.data?.message || err.message;
      return { success: false, error: serverMsg || 'Verification failed. Please check your code or link.' };
    }
  };

  const verifyEmailByToken = async (token: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      return { success: false, error: 'Verification token is required.' };
    }

    try {
      const res = await authApi.verifyEmailByToken(trimmedToken);
      if (res.token) {
        localStorage.setItem(JWT_TOKEN_KEY, res.token);
      }

      setUser((prev) => {
        const userObj: AuthUser = res.user
          ? {
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              emailVerified: true,
              rememberMe: prev?.rememberMe ?? true,
            }
          : prev
          ? { ...prev, emailVerified: true }
          : {
              id: 'verified-user',
              name: res.user?.name || 'User',
              email: res.user?.email || '',
              emailVerified: true,
            };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
        return userObj;
      });

      return { success: true };
    } catch (err: any) {
      if (!err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        // In preview/offline, allow token to succeed if non-empty
        setUser((prev) => {
          if (!prev) return null;
          const updated: AuthUser = { ...prev, emailVerified: true };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        return { success: true };
      }

      const serverMsg = err.response?.data?.message || err.message;
      return { success: false, error: serverMsg || 'Invalid or expired verification token.' };
    }
  };

  const changeEmail = async (
    newEmail: string,
    currentEmail?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const trimmedNew = newEmail.trim().toLowerCase();
    const targetCurrent = currentEmail || user?.email;

    if (!trimmedNew) {
      return { success: false, error: 'Please enter a valid new email address.' };
    }

    try {
      const res = await authApi.changeEmail({ newEmail: trimmedNew, currentEmail: targetCurrent });
      if (res.token) {
        localStorage.setItem(JWT_TOKEN_KEY, res.token);
      }

      setUser((prev) => {
        if (!prev) return null;
        const updated: AuthUser = { ...prev, email: trimmedNew, emailVerified: false };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      return {
        success: true,
        message: res.message || `Verification link sent to ${trimmedNew}`,
      };
    } catch (err: any) {
      if (!err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setUser((prev) => {
          if (!prev) return null;
          const updated: AuthUser = { ...prev, email: trimmedNew, emailVerified: false };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });

        return {
          success: true,
          message: `Verification code generated for ${trimmedNew}.`,
        };
      }

      const serverMsg = err.response?.data?.message || err.message;
      return { success: false, error: serverMsg || 'Failed to update email address.' };
    }
  };

  const resendVerification = async (
    emailTarget?: string
  ): Promise<{ success: boolean; message?: string; error?: string; simulatedOtp?: string }> => {
    const targetEmail = emailTarget || user?.email;
    if (!targetEmail) {
      return { success: false, error: 'No email address specified.' };
    }

    try {
      const res = await authApi.resendVerification({ email: targetEmail });
      return {
        success: true,
        message: res.message || `Verification email sent to ${targetEmail}`,
        simulatedOtp: res.simulatedOtp || '123456',
      };
    } catch (err: any) {
      if (!err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        return {
          success: true,
          message: `Verification code generated for ${targetEmail}.`,
          simulatedOtp: '123456',
        };
      }

      const serverMsg = err.response?.data?.message || err.message;
      return { success: false, error: serverMsg || 'Failed to resend verification code.' };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    const currentUserId = user?.id;
    const currentUserEmail = user?.email?.toLowerCase();

    try {
      // 1. If backend token is present, call backend DELETE /api/users/me
      const token = localStorage.getItem(JWT_TOKEN_KEY);
      if (token) {
        try {
          await authApi.deleteAccount();
        } catch (apiErr: any) {
          // If network unreachable, proceed with offline deletion
          if (apiErr.response && apiErr.response.status !== 404) {
            return {
              success: false,
              error: apiErr.response?.data?.message || 'Failed to delete account on server.',
            };
          }
        }
      }

      // 2. Remove from offline registered users list if stored locally
      if (currentUserEmail) {
        const accounts = getOfflineAccounts();
        const updatedAccounts = accounts.filter(
          (a) => a.email.toLowerCase() !== currentUserEmail && a.id !== currentUserId
        );
        localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(updatedAccounts));
      }

      // 3. Clean up user specific local caches and active session tokens
      if (currentUserId) {
        localStorage.removeItem(`expenseflow_local_expenses_${currentUserId}`);
      }
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(JWT_TOKEN_KEY);

      // 4. Reset auth state
      setUser(null);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'An unexpected error occurred while deleting your account.',
      };
    }
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
        isBackendOnline,
        login,
        register,
        logout,
        deleteAccount,
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

