import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import { AuthUser, GoogleSignInResult, UserRole } from '../types';
import {
  completeGoogleSignup as completeGoogleSignupFn,
  registerWithFirebase,
  signInWithFirebase,
  signInWithGoogleFirebase,
  signInWithGoogleNative,
  signInWithGoogleWeb,
  signOutFirebase,
  toReadableFirebaseError,
  warmUpFirebaseAuth,
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
    phone?: string,
  ) => Promise<AuthUser | null>;
  loginWithGoogle: (idToken: string | null, accessToken: string | null) => Promise<GoogleSignInResult | null>;
  loginWithGoogleNative: () => Promise<GoogleSignInResult | null>;
  loginWithGoogleWeb: () => Promise<GoogleSignInResult | null>;
  completeGoogleSignup: (
    uid: string,
    name: string,
    email: string,
    role: UserRole,
    phone: string,
  ) => Promise<AuthUser | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timeoutId = setTimeout(() => {
        void warmUpFirebaseAuth();
      }, 1200);
    });

    return () => {
      task.cancel();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

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
      async register(name, email, password, role, phone) {
        if (!name.trim() || !email.trim() || password.length < 6 || !phone?.trim()) {
          setLastError('Verifica nombre, correo, contrasena y telefono.');
          return null;
        }

        try {
          const nextUser = await registerWithFirebase(
            name.trim(),
            email.trim().toLowerCase(),
            password,
            role,
            phone.trim(),
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
      async loginWithGoogleWeb() {
        try {
          const result = await signInWithGoogleWeb();
          if (!result) {
            setLastError('No se pudo iniciar sesion con Google.');
            return null;
          }
          if (!result.isNew) {
            setLastError(null);
            setUser(result.user);
          }
          return result;
        } catch (error) {
          setLastError(toReadableFirebaseError(error));
          return null;
        }
      },
      async loginWithGoogle(idToken, accessToken) {
        try {
          const result = await signInWithGoogleFirebase(idToken, accessToken);
          if (!result) {
            setLastError('No se pudo iniciar sesion con Google.');
            return null;
          }
          if (!result.isNew) {
            setLastError(null);
            setUser(result.user);
          }
          return result;
        } catch (error) {
          setLastError(toReadableFirebaseError(error));
          return null;
        }
      },
      async loginWithGoogleNative() {
        try {
          const result = await signInWithGoogleNative();
          if (!result) {
            setLastError('No se pudo iniciar sesion con Google.');
            return null;
          }
          if (!result.isNew) {
            setLastError(null);
            setUser(result.user);
          }
          return result;
        } catch (error) {
          setLastError(toReadableFirebaseError(error));
          return null;
        }
      },
      async completeGoogleSignup(uid, name, email, role, phone) {
        if (!phone.trim()) {
          setLastError('Ingresa un numero de telefono.');
          return null;
        }

        try {
          const nextUser = await completeGoogleSignupFn(uid, name, email, role, phone.trim());
          if (!nextUser) {
            setLastError('No se pudo crear la cuenta.');
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
