import { UserRole } from '../types';

type FirebaseRuntime = {
  initializeApp: any;
  getApps: any;
  getApp: any;
  getFirestore: any;
  collection: any;
  getDocs: any;
  doc: any;
  updateDoc: any;
  deleteDoc: any;
  query: any;
  orderBy: any;
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

let runtimeCache: FirebaseRuntime | null = null;
let dbCache: any = null;

function tryLoadRuntime(): FirebaseRuntime | null {
  if (runtimeCache) return runtimeCache;
  try {
    // eslint-disable-next-line global-require
    const app = require('firebase/app');
    // eslint-disable-next-line global-require
    const firestore = require('firebase/firestore');

    runtimeCache = {
      initializeApp: app.initializeApp,
      getApps: app.getApps,
      getApp: app.getApp,
      getFirestore: firestore.getFirestore,
      collection: firestore.collection,
      getDocs: firestore.getDocs,
      doc: firestore.doc,
      updateDoc: firestore.updateDoc,
      deleteDoc: firestore.deleteDoc,
      query: firestore.query,
      orderBy: firestore.orderBy,
    };
    return runtimeCache;
  } catch {
    return null;
  }
}

function readFirebaseConfig() {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

function getDb(): any | null {
  if (dbCache) return dbCache;
  const runtime = tryLoadRuntime();
  const config = readFirebaseConfig();
  if (!runtime || !config) return null;

  const app =
    runtime.getApps().length > 0 ? runtime.getApp() : runtime.initializeApp(config);
  dbCache = runtime.getFirestore(app);
  return dbCache;
}

function normalizeRole(value: unknown): UserRole {
  if (value === 'admin' || value === 'vendor' || value === 'user') return value;
  return 'user';
}

export async function listAllUsers(): Promise<ManagedUser[]> {
  const runtime = tryLoadRuntime();
  const db = getDb();
  if (!runtime || !db) return [];

  const usersRef = runtime.collection(db, 'users');
  const snapshot = await runtime.getDocs(usersRef);
  const users: ManagedUser[] = [];
  snapshot.forEach((docSnap: any) => {
    const data = docSnap.data() as Record<string, unknown>;
    users.push({
      id: docSnap.id,
      name: typeof data.name === 'string' ? data.name : 'Usuario',
      email: typeof data.email === 'string' ? data.email : '',
      role: normalizeRole(data.role),
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    });
  });
  return users.sort((a, b) => a.email.localeCompare(b.email));
}

export async function updateUserRole(uid: string, role: UserRole): Promise<boolean> {
  const runtime = tryLoadRuntime();
  const db = getDb();
  if (!runtime || !db) return false;

  await runtime.updateDoc(runtime.doc(db, 'users', uid), {
    role,
    updatedAt: new Date().toISOString(),
  });
  return true;
}

export async function deleteUserProfile(uid: string): Promise<boolean> {
  const runtime = tryLoadRuntime();
  const db = getDb();
  if (!runtime || !db) return false;

  await runtime.deleteDoc(runtime.doc(db, 'users', uid));
  return true;
}
