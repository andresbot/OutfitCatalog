import React, { createContext, useContext, useMemo, useState } from 'react';
import { AuthUser, UserRole } from '../types';

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(email, password, role) {
        if (!email.trim() || !password.trim()) {
          return false;
        }

        setUser({
          id: String(Date.now()),
          name: email.split('@')[0] || 'Usuario',
          email,
          role,
        });
        return true;
      },
      async register(name, email, password, role) {
        if (!name.trim() || !email.trim() || password.length < 6) {
          return false;
        }

        setUser({
          id: String(Date.now()),
          name,
          email,
          role,
        });
        return true;
      },
      logout() {
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}