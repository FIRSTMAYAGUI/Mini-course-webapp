import { useState, type ReactNode } from 'react';
import client from '../api/client';
import { AuthContext, type AuthContextType } from './AuthContext';

// 1. User & Auth Payload Interfaces
export interface User {
  id: string;
  fullname?: string;
  name?: string;
  email: string;
  role: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// 3. AuthProvider Props Interface
export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Read any existing token on first load
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  function persistSession(newToken: string, newUser: User): void {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  async function login({ email, password }: LoginPayload): Promise<void> {
    const response = await client.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    const { token: newToken, user: newUser } = response.data;
    persistSession(newToken, newUser);
  }

  async function signup({ name, email, password }: SignupPayload): Promise<void> {
    // Adjust this path/shape to match your actual Express route.
    await client.post('/auth/signup', { name, email, password });
    // Signup alone doesn't log the user in — chain into login so the
    // behavior is explicit rather than assumed.
    await login({ email, password });
  }

  const value: AuthContextType = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}