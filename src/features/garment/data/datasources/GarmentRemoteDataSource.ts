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
};

let firebaseCache: {
  collection: any;
  getDocs: any;
  getFirestore: any;
  getApp: any;
  getApps: any;
  initializeApp: any;
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
      getDocs: firestore.getDocs,
      getFirestore: firestore.getFirestore,
      getApp: app.getApp,
      getApps: app.getApps,
      initializeApp: app.initializeApp,
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
    Number.isNaN(parsedStock)
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
  };
}

export interface GarmentRemoteDataSource {
  isConfigured(): boolean;
  fetchGarments(): Promise<GarmentModel[]>;
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
}
