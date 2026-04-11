import { AuthUser, UserRole } from '../types';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type FirebaseRuntime = {
  initializeApp: any;
  getApps: any;
  getApp: any;
  getAuth: any;
  initializeAuth: any;
  getReactNativePersistence: any;
  createUserWithEmailAndPassword: any;
  signInWithEmailAndPassword: any;
  signOut: any;
  getFirestore: any;
  doc: any;
  getDoc: any;
  setDoc: any;
};

type FirebaseContext = {
  auth: any;
  db: any;
  runtime: FirebaseRuntime;
};

type FirebaseLikeError = {
  code?: string;
  message?: string;
};

let runtimeCache: FirebaseRuntime | null = null;
let contextCache: FirebaseContext | null = null;

export function toReadableFirebaseError(error: unknown): string {
  const firebaseError = error as FirebaseLikeError;
  const code = firebaseError?.code ?? '';

  if (code === 'auth/email-already-in-use') {
    return 'Ese correo ya esta registrado.';
  }

  if (code === 'auth/invalid-email') {
    return 'El formato del correo no es valido.';
  }

  if (code === 'auth/weak-password') {
    return 'La contrasena es muy debil. Usa al menos 6 caracteres.';
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/user-not-found' ||
    code === 'auth/wrong-password'
  ) {
    return 'Credenciales invalidas. Verifica correo y contrasena.';
  }

  if (code === 'permission-denied') {
    return 'Firestore rechazo la operacion. Revisa reglas de la coleccion users.';
  }

  if (code === 'auth/network-request-failed' || code === 'unavailable') {
    return 'No hay conexion con Firebase. Revisa internet e intenta de nuevo.';
  }

  return firebaseError?.message ?? 'No se pudo completar la operacion con Firebase.';
}

function readFirebaseConfig(): FirebaseConfig | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

function tryLoadRuntime(): FirebaseRuntime | null {
  if (runtimeCache) {
    return runtimeCache;
  }

  try {
    // eslint-disable-next-line global-require
    const app = require('firebase/app');
    // eslint-disable-next-line global-require
    const auth = require('firebase/auth');
    // eslint-disable-next-line global-require
    const firestore = require('firebase/firestore');

    runtimeCache = {
      initializeApp: app.initializeApp,
      getApps: app.getApps,
      getApp: app.getApp,
      getAuth: auth.getAuth,
      initializeAuth: auth.initializeAuth,
      getReactNativePersistence: auth.getReactNativePersistence,
      createUserWithEmailAndPassword: auth.createUserWithEmailAndPassword,
      signInWithEmailAndPassword: auth.signInWithEmailAndPassword,
      signOut: auth.signOut,
      getFirestore: firestore.getFirestore,
      doc: firestore.doc,
      getDoc: firestore.getDoc,
      setDoc: firestore.setDoc,
    };

    return runtimeCache;
  } catch {
    return null;
  }
}

function normalizeRole(value: unknown): UserRole {
  if (value === 'admin' || value === 'vendor' || value === 'user') {
    return value;
  }

  return 'user';
}

async function getFirebaseContext(): Promise<FirebaseContext | null> {
  if (contextCache) {
    return contextCache;
  }

  const runtime = tryLoadRuntime();
  const config = readFirebaseConfig();
  if (!runtime || !config) {
    return null;
  }

  try {
    const app = runtime.getApps().length > 0 ? runtime.getApp() : runtime.initializeApp(config);
    let authInstance: any;

    try {
      // eslint-disable-next-line global-require
      const asyncStorageModule = require('@react-native-async-storage/async-storage');
      const storageFactory = asyncStorageModule.createAsyncStorage;
      const storage =
        typeof storageFactory === 'function'
          ? storageFactory('outfitcatalog_auth')
          : asyncStorageModule.default ?? asyncStorageModule;

      authInstance = runtime.initializeAuth(app, {
        persistence: runtime.getReactNativePersistence(storage),
      });
    } catch {
      authInstance = runtime.getAuth(app);
    }

    contextCache = {
      auth: authInstance,
      db: runtime.getFirestore(app),
      runtime,
    };
    return contextCache;
  } catch {
    return null;
  }
}

async function getRoleProfile(ctx: FirebaseContext, uid: string): Promise<{
  role: UserRole;
  name: string;
  email: string;
}> {
  const userRef = ctx.runtime.doc(ctx.db, 'users', uid);
  const snapshot = await ctx.runtime.getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as Record<string, unknown>;
    return {
      role: normalizeRole(data.role),
      name: typeof data.name === 'string' ? data.name : 'Usuario',
      email: typeof data.email === 'string' ? data.email : '',
    };
  }

  return {
    role: 'user',
    name: 'Usuario',
    email: '',
  };
}

async function ensureUserProfile(
  ctx: FirebaseContext,
  uid: string,
  fallback: { name: string; email: string; role: UserRole },
): Promise<{ role: UserRole; name: string; email: string }> {
  const current = await getRoleProfile(ctx, uid);

  const name = current.name || fallback.name || 'Usuario';
  const email = current.email || fallback.email;
  const role = current.role || fallback.role;

  await ctx.runtime.setDoc(
    ctx.runtime.doc(ctx.db, 'users', uid),
    {
      name,
      email,
      role,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return { name, email, role };
}

export async function signInWithFirebase(email: string, password: string): Promise<AuthUser | null> {
  const ctx = await getFirebaseContext();
  if (!ctx) {
    return null;
  }

  const credentials = await ctx.runtime.signInWithEmailAndPassword(ctx.auth, email, password);
  const { uid } = credentials.user;
  const fallbackEmail = credentials.user.email ?? email;
  const fallbackName = credentials.user.displayName ?? fallbackEmail.split('@')[0] ?? 'Usuario';

  const profile = await ensureUserProfile(ctx, uid, {
    name: fallbackName,
    email: fallbackEmail,
    role: 'user',
  });
  const normalizedEmail = profile.email || fallbackEmail;
  const normalizedName = profile.name || normalizedEmail.split('@')[0] || 'Usuario';

  return {
    id: uid,
    name: normalizedName,
    email: normalizedEmail,
    role: profile.role,
  };
}

export async function registerWithFirebase(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<AuthUser | null> {
  const ctx = await getFirebaseContext();
  if (!ctx) {
    return null;
  }

  const credentials = await ctx.runtime.createUserWithEmailAndPassword(ctx.auth, email, password);
  const uid = credentials.user.uid;

  await ctx.runtime.setDoc(ctx.runtime.doc(ctx.db, 'users', uid), {
    name,
    email: email.trim().toLowerCase(),
    role,
    createdAt: new Date().toISOString(),
  });

  return {
    id: uid,
    name,
    email: email.trim().toLowerCase(),
    role,
  };
}

export async function signOutFirebase(): Promise<void> {
  const ctx = await getFirebaseContext();
  if (!ctx) {
    return;
  }

  await ctx.runtime.signOut(ctx.auth);
}
