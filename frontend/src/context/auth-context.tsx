'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: Tokens | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Tokens {
  access: string;
  refresh: string;
}

// A helper function to decode JWT and get user ID
const getUserIdFromToken = (token: string): string | null => {
  try {
    // The user_id from the backend is a number, but our mock data uses strings.
    // So we'll decode it and decide which mock user to show.
    const decoded: { user_id: number } = jwtDecode(token);
    return String(decoded.user_id);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
            const parsedTokens: Tokens = JSON.parse(storedTokens);
            await fetch(`${BASE_URL}/api/accounts/logout/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: parsedTokens.refresh }),
            });
        }
    } catch (error) {
        console.error("Logout API call failed, proceeding with client-side logout.", error);
    } finally {
        setUser(null);
        setTokens(null);
        localStorage.removeItem('authTokens');
        setIsLoading(false);
        router.push('/login');
    }
  }, [router]);


  const fetchUser = useCallback(async (userId: string, accessToken: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/accounts/user-profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await res.json();
      
      const fetchedUser: User = {
        id: userId,
        username: profileData.username,
        name: profileData.username, // Using username as name
        email: profileData.email,
        avatarUrl: profileData.profile_picture ? `${BASE_URL}${profileData.profile_picture}` : `https://ui-avatars.com/api/?name=${profileData.username}&background=random`,
        phoneNumber: profileData.phone_number,
        dateOfBirth: profileData.date_of_birth,
        university: profileData.university,
        isEmailVerified: profileData.is_email_verified,
        dateJoined: profileData.date_joined,
        isActive: profileData.is_active,
      };

      setUser(fetchedUser);

    } catch (error) {
        console.error(error);
        await logout();
    }
  }, [logout]);


  const refreshToken = useCallback(async (refreshToken: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/accounts/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!res.ok) throw new Error('Failed to refresh token');
      
      const newTokens: { access: string, refresh?: string } = await res.json();
      
      const updatedTokens = { 
        access: newTokens.access,
        refresh: newTokens.refresh || refreshToken
      };
      localStorage.setItem('authTokens', JSON.stringify(updatedTokens));
      setTokens(updatedTokens);

      const newUserId = getUserIdFromToken(newTokens.access);
      if (newUserId) {
        await fetchUser(newUserId, newTokens.access);
      } else {
        throw new Error("Could not verify new token.");
      }
      return updatedTokens;

    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return null;
    }
  }, [fetchUser, logout]);

  const refetchUser = useCallback(async () => {
    const storedTokens = localStorage.getItem('authTokens');
    if (storedTokens) {
      const parsedTokens: Tokens = JSON.parse(storedTokens);
      const userId = getUserIdFromToken(parsedTokens.access);
      if(userId) {
        await fetchUser(userId, parsedTokens.access);
      }
    }
  }, [fetchUser]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      let currentTokens: Tokens | null = null;
      try {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
          currentTokens = JSON.parse(storedTokens);
          setTokens(currentTokens);
          
          const decoded: { exp: number } = jwtDecode(currentTokens.access);
          const isExpired = Date.now() >= decoded.exp * 1000;
          
          if (isExpired) {
             currentTokens = await refreshToken(currentTokens.refresh);
             if(!currentTokens) return;
          }
          const userId = getUserIdFromToken(currentTokens.access);
          if (userId) {
              await fetchUser(userId, currentTokens.access);
          } else {
              await logout();
          }
        }
      } catch (error) {
        console.error("Auth initialization failed", error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [fetchUser, logout, refreshToken]);


  // Set an interval to refresh the token before it expires.
  useEffect(() => {
    if (tokens?.refresh) {
      // Refresh token periodically. Let's set it to 23 hours.
      const interval = setInterval(async () => {
        if(tokens?.refresh){
          await refreshToken(tokens.refresh);
        }
      }, 1000 * 60 * 60 * 23); 
      return () => clearInterval(interval);
    }
  }, [tokens, refreshToken]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const receivedTokens: Tokens = await res.json();
      const userId = getUserIdFromToken(receivedTokens.access);

      if (userId) {
        localStorage.setItem('authTokens', JSON.stringify(receivedTokens));
        setTokens(receivedTokens);
        await fetchUser(userId, receivedTokens.access);
        router.push('/profile');
      } else {
        throw new Error('Failed to verify user from token.');
      }
    } finally {
        setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    tokens,
    refetchUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
