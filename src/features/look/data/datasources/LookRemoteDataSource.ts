import { LookRow } from '../../../../core/database/types';

type FirebaseCache = {
  initializeApp: any;
  getApps: any;
  getApp: any;
  getFirestore: any;
  collection: any;
  doc: any;
  setDoc: any;
  deleteDoc: any;
  getDocs: any;
  query: any;
  where: any;
};

let firebaseCache: FirebaseCache | null = null;

function tryLoadFirebase(): boolean {
  if (firebaseCache) return true;
  try {
    const app = require('firebase/app');
    const firestore = require('firebase/firestore');
    firebaseCache = {
      initializeApp: app.initializeApp,
      getApps: app.getApps,
      getApp: app.getApp,
      getFirestore: firestore.getFirestore,
      collection: firestore.collection,
      doc: firestore.doc,
      setDoc: firestore.setDoc,
      deleteDoc: firestore.deleteDoc,
      getDocs: firestore.getDocs,
      query: firestore.query,
      where: firestore.where,
    };
    return true;
  } catch {
    return false;
  }
}

function readFirebaseConfig(): Record<string, string> | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) return null;
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

export const LOOKS_COLLECTION = 'looks';

export interface LookRemoteDataSource {
  isConfigured(): boolean;
  upsertLook(look: LookRow, garmentIds: string[]): Promise<void>;
  deleteLook(id: string): Promise<void>;
  fetchLooksByUser(userId: string): Promise<Array<{ look: LookRow; garmentIds: string[] }>>;
}

export class LookRemoteDataSourceImpl implements LookRemoteDataSource {
  private configured = false;
  private db: any = null;
  private initialized = false;

  private initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (!tryLoadFirebase()) { this.configured = false; return; }
    const config = readFirebaseConfig();
    if (!config) { this.configured = false; return; }
    try {
      const app = firebaseCache!.getApps().length > 0
        ? firebaseCache!.getApp()
        : firebaseCache!.initializeApp(config);
      this.db = firebaseCache!.getFirestore(app);
      this.configured = true;
    } catch {
      this.configured = false;
    }
  }

  isConfigured(): boolean {
    this.initialize();
    return this.configured && this.db !== null;
  }

  async upsertLook(look: LookRow, garmentIds: string[]): Promise<void> {
    if (!this.isConfigured() || !firebaseCache) return;
    await firebaseCache.setDoc(
      firebaseCache.doc(this.db, LOOKS_COLLECTION, look.id),
      {
        id: look.id,
        userId: look.userId,
        name: look.name,
        description: look.description,
        coverImageUrl: look.coverImageUrl ?? null,
        garmentIds,
        createdAt: look.createdAt,
        updatedAt: look.updatedAt,
      },
      { merge: true },
    );
  }

  async deleteLook(id: string): Promise<void> {
    if (!this.isConfigured() || !firebaseCache) return;
    await firebaseCache.deleteDoc(firebaseCache.doc(this.db, LOOKS_COLLECTION, id));
  }

  async fetchLooksByUser(userId: string): Promise<Array<{ look: LookRow; garmentIds: string[] }>> {
    if (!this.isConfigured() || !firebaseCache) return [];
    const q = firebaseCache.query(
      firebaseCache.collection(this.db, LOOKS_COLLECTION),
      firebaseCache.where('userId', '==', userId),
    );
    const snapshot = await firebaseCache.getDocs(q);
    const results: Array<{ look: LookRow; garmentIds: string[] }> = [];
    snapshot.forEach((docSnap: any) => {
      const d = docSnap.data() as Record<string, any>;
      if (!d.id || !d.userId || !d.name) return;
      results.push({
        look: {
          id: d.id,
          userId: d.userId,
          name: d.name,
          description: d.description ?? '',
          coverImageUrl: d.coverImageUrl ?? null,
          createdAt: d.createdAt ?? new Date().toISOString(),
          updatedAt: d.updatedAt ?? new Date().toISOString(),
        },
        garmentIds: Array.isArray(d.garmentIds) ? d.garmentIds : [],
      });
    });
    return results;
  }
}
