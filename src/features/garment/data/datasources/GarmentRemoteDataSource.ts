import { GarmentModel } from '../models/GarmentModel';

export const GARMENT_COLLECTION_NAME = 'garments';

type FirestoreGarmentDocument = {
  name?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  description?: string;
  size?: string;
  color?: string;
  stock?: number;
  vendorId?: string;
  vendorName?: string;
  published?: boolean;
};

let firebaseCache: {
  collection: any;
  deleteDoc: any;
  doc: any;
  getDocs: any;
  getFirestore: any;
  getApp: any;
  getApps: any;
  initializeApp: any;
  setDoc: any;
} | null = null;

function tryLoadFirebase() {
  if (firebaseCache) return true;

  try {
    // eslint-disable-next-line global-require
    const app = require('firebase/app');
    // eslint-disable-next-line global-require
    const firestore = require('firebase/firestore');

    firebaseCache = {
      collection: firestore.collection,
      deleteDoc: firestore.deleteDoc,
      doc: firestore.doc,
      getDocs: firestore.getDocs,
      getFirestore: firestore.getFirestore,
      getApp: app.getApp,
      getApps: app.getApps,
      initializeApp: app.initializeApp,
      setDoc: firestore.setDoc,
    };

    return true;
  } catch {
    // Firebase not available in this environment (e.g., React Native bundler)
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

function toGarmentModel(id: string, value: FirestoreGarmentDocument): GarmentModel | null {
  const parsedPrice =
    typeof value.price === 'number'
      ? value.price
      : typeof value.price === 'string'
        ? Number(value.price)
        : NaN;
  const parsedStock =
    typeof value.stock === 'number'
      ? value.stock
      : typeof value.stock === 'string'
        ? Number(value.stock)
        : NaN;

  if (
    typeof value.name !== 'string' ||
    typeof value.category !== 'string' ||
    Number.isNaN(parsedPrice) ||
    typeof value.imageUrl !== 'string' ||
    typeof value.description !== 'string' ||
    typeof value.size !== 'string' ||
    typeof value.color !== 'string' ||
    Number.isNaN(parsedStock) ||
    typeof value.vendorId !== 'string' ||
    typeof value.vendorName !== 'string'
  ) {
    return null;
  }

  return {
    id,
    name: value.name,
    category: value.category,
    price: parsedPrice,
    imageUrl: value.imageUrl,
    description: value.description,
    size: value.size,
    color: value.color,
    stock: parsedStock,
    vendorId: value.vendorId,
    vendorName: value.vendorName,
    published: value.published !== false,
  };
}

function toFirestoreGarmentDocument(garment: GarmentModel): FirestoreGarmentDocument {
  return {
    name: garment.name,
    category: garment.category,
    price: garment.price,
    imageUrl: garment.imageUrl,
    description: garment.description,
    size: garment.size,
    color: garment.color,
    stock: garment.stock,
    vendorId: garment.vendorId,
    vendorName: garment.vendorName,
    published: garment.published,
  };
}

export interface GarmentRemoteDataSource {
  isConfigured(): boolean;
  fetchGarments(): Promise<GarmentModel[]>;
  upsertGarment(garment: GarmentModel): Promise<void>;
  deleteGarment(id: string): Promise<void>;
}

export class GarmentRemoteDataSourceImpl implements GarmentRemoteDataSource {
  private configured = false;
  private db: any = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (!tryLoadFirebase()) {
      this.configured = false;
      return;
    }

    const config = readFirebaseConfig();
    if (!config) {
      this.configured = false;
      return;
    }

    try {
      if (firebaseCache!.getApps().length > 0) {
        this.db = firebaseCache!.getFirestore(firebaseCache!.getApp());
      } else {
        const app = firebaseCache!.initializeApp(config);
        this.db = firebaseCache!.getFirestore(app);
      }

      this.configured = true;
    } catch {
      this.configured = false;
      this.db = null;
    }
  }

  isConfigured(): boolean {
    return this.configured && this.db !== null;
  }

  async fetchGarments(): Promise<GarmentModel[]> {
    if (!this.isConfigured() || !firebaseCache) {
      return [];
    }

    const snapshot = await firebaseCache.getDocs(
      firebaseCache.collection(this.db, GARMENT_COLLECTION_NAME),
    );

    return snapshot.docs
      .map((doc: any) => toGarmentModel(doc.id, doc.data() as FirestoreGarmentDocument))
      .filter((garment: GarmentModel | null): garment is GarmentModel => garment !== null);
  }

  async upsertGarment(garment: GarmentModel): Promise<void> {
    if (!this.isConfigured() || !firebaseCache) {
      return;
    }

    await firebaseCache.setDoc(
      firebaseCache.doc(this.db, GARMENT_COLLECTION_NAME, garment.id),
      {
        ...toFirestoreGarmentDocument(garment),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  async deleteGarment(id: string): Promise<void> {
    if (!this.isConfigured() || !firebaseCache) {
      return;
    }

    await firebaseCache.deleteDoc(firebaseCache.doc(this.db, GARMENT_COLLECTION_NAME, id));
  }
}
