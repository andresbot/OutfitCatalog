import React, { createContext, useContext, useMemo, useState } from 'react';
import { AuthUser, UserRole } from '../types';
import {
  registerWithFirebase,
  signInWithFirebase,
  signOutFirebase,
  toReadableFirebaseError,
} from './firebaseAuth';

type AuthContextValue = {
  user: AuthUser | null;
  lastError: string | null;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<AuthUser | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      lastError,
      async login(email, password) {
        if (!email.trim() || !password.trim()) {
          setLastError('Completa correo y contrasena.');
          return null;
        }

        try {
          const nextUser = await signInWithFirebase(email.trim().toLowerCase(), password);
          if (!nextUser) {
            setLastError('No se pudo iniciar sesion con Firebase.');
            return null;
          }

          setLastError(null);
          setUser(nextUser);
          return nextUser;
        } catch (error) {
          setLastError(toReadableFirebaseError(error));
          return null;
        }
      },
      async register(name, email, password, role) {
        if (!name.trim() || !email.trim() || password.length < 6) {
          setLastError('Verifica nombre, correo y contrasena (minimo 6).');
          return null;
        }

        try {
          const nextUser = await registerWithFirebase(
            name.trim(),
            email.trim().toLowerCase(),
            password,
            role,
          );
          if (!nextUser) {
            setLastError('No se pudo crear la cuenta en Firebase.');
            return null;
          }

          setLastError(null);
          setUser(nextUser);
          return nextUser;
        } catch (error) {
          setLastError(toReadableFirebaseError(error));
          return null;
        }
      },
      logout() {
        setLastError(null);
        setUser(null);
        void signOutFirebase();
      },
    }),
    [lastError, user],
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