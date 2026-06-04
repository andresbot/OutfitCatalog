import { Platform } from 'react-native';
import { AuthUser } from '../../types';

export type AnalyticsEventName =
  | 'app_open'
  | 'login_success'
  | 'sign_up_completed'
  | 'google_sign_in_success'
  | 'google_sign_up_completed'
  | 'catalog_viewed'
  | 'garment_viewed'
  | 'favorite_added'
  | 'favorite_removed'
  | 'look_created'
  | 'look_updated'
  | 'look_deleted'
  | 'purchase_request_created'
  | 'purchase_request_status_changed'
  | 'purchase_request_deleted'
  | 'inventory_item_created'
  | 'inventory_item_updated'
  | 'inventory_item_deleted'
  | 'admin_report_viewed';

type AnalyticsParamValue =
  | string
  | number
  | boolean
  | null
  | AnalyticsParamValue[]
  | { [key: string]: AnalyticsParamValue | undefined };

export type AnalyticsParams = Record<string, AnalyticsParamValue | undefined>;

export type AnalyticsEventRecord = {
  id: string;
  name: AnalyticsEventName | string;
  createdAt: string;
  sessionId: string;
  platform: string;
  userId?: string;
  role?: string;
  params: Record<string, AnalyticsParamValue>;
};

export type AnalyticsSummary = {
  days: number;
  totalEvents: number;
  activeUsers: number;
  anonymousSessions: number;
  signUps: number;
  logins: number;
  catalogViews: number;
  garmentViews: number;
  favoritesAdded: number;
  favoritesRemoved: number;
  looksCreated: number;
  purchaseRequestsCreated: number;
  purchaseRequestsSold: number;
  inventoryItemsCreated: number;
  inventoryItemsUpdated: number;
  topEvents: { name: string; count: number }[];
};

type FirebaseRuntime = {
  collection: any;
  doc: any;
  getApp: any;
  getApps: any;
  getDocs: any;
  getFirestore: any;
  initializeApp: any;
  setDoc: any;
};

const COLLECTION_NAME = 'analyticsEvents';
const APP_VERSION = '1.0.0';
const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
      collection: firestore.collection,
      doc: firestore.doc,
      getApp: app.getApp,
      getApps: app.getApps,
      getDocs: firestore.getDocs,
      getFirestore: firestore.getFirestore,
      initializeApp: app.initializeApp,
      setDoc: firestore.setDoc,
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

function getDb(): { runtime: FirebaseRuntime; db: any } | null {
  const runtime = tryLoadRuntime();
  const config = readFirebaseConfig();
  if (!runtime || !config) return null;

  if (!dbCache) {
    const app = runtime.getApps().length > 0 ? runtime.getApp() : runtime.initializeApp(config);
    dbCache = runtime.getFirestore(app);
  }

  return { runtime, db: dbCache };
}

function sanitizeValue(value: AnalyticsParamValue | undefined): AnalyticsParamValue | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeValue(item))
      .filter((item): item is AnalyticsParamValue => item !== undefined);
  }

  const sanitized: Record<string, AnalyticsParamValue> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    const nextValue = sanitizeValue(nestedValue);
    if (nextValue !== undefined) {
      sanitized[key] = nextValue;
    }
  }
  return sanitized;
}

function sanitizeParams(params: AnalyticsParams = {}): Record<string, AnalyticsParamValue> {
  const sanitized: Record<string, AnalyticsParamValue> = {};
  for (const [key, value] of Object.entries(params)) {
    const nextValue = sanitizeValue(value);
    if (nextValue !== undefined) {
      sanitized[key] = nextValue;
    }
  }
  return sanitized;
}

function createEventId(name: string): string {
  const entropy = Math.random().toString(36).slice(2, 8);
  return `event-${name}-${Date.now()}-${entropy}`;
}

function emptySummary(days: number): AnalyticsSummary {
  return {
    days,
    totalEvents: 0,
    activeUsers: 0,
    anonymousSessions: 0,
    signUps: 0,
    logins: 0,
    catalogViews: 0,
    garmentViews: 0,
    favoritesAdded: 0,
    favoritesRemoved: 0,
    looksCreated: 0,
    purchaseRequestsCreated: 0,
    purchaseRequestsSold: 0,
    inventoryItemsCreated: 0,
    inventoryItemsUpdated: 0,
    topEvents: [],
  };
}

export async function trackEvent(
  name: AnalyticsEventName,
  params: AnalyticsParams = {},
  user?: AuthUser | null,
): Promise<void> {
  const context = getDb();
  if (!context) return;

  const id = createEventId(name);
  const payload: AnalyticsEventRecord = {
    id,
    name,
    createdAt: new Date().toISOString(),
    sessionId: SESSION_ID,
    platform: Platform.OS,
    params: {
      ...sanitizeParams(params),
      appVersion: APP_VERSION,
    },
    ...(user?.id ? { userId: user.id } : {}),
    ...(user?.role ? { role: user.role } : {}),
  };

  try {
    await context.runtime.setDoc(
      context.runtime.doc(context.db, COLLECTION_NAME, id),
      payload,
    );
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('Analytics event save failed:', error);
    }
  }
}

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const context = getDb();
  if (!context) return emptySummary(days);

  try {
    const snapshot = await context.runtime.getDocs(
      context.runtime.collection(context.db, COLLECTION_NAME),
    );
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    const events: AnalyticsEventRecord[] = [];

    snapshot.forEach((docSnap: any) => {
      const data = docSnap.data() as Partial<AnalyticsEventRecord>;
      const createdAt = typeof data.createdAt === 'string' ? data.createdAt : '';
      const createdTime = new Date(createdAt).getTime();
      if (!createdAt || Number.isNaN(createdTime) || createdTime < since) {
        return;
      }

      events.push({
        id: typeof data.id === 'string' ? data.id : docSnap.id,
        name: typeof data.name === 'string' ? data.name : 'unknown',
        createdAt,
        sessionId: typeof data.sessionId === 'string' ? data.sessionId : '',
        platform: typeof data.platform === 'string' ? data.platform : '',
        userId: typeof data.userId === 'string' ? data.userId : undefined,
        role: typeof data.role === 'string' ? data.role : undefined,
        params: data.params && typeof data.params === 'object' ? data.params : {},
      });
    });

    const users = new Set(events.map((event) => event.userId).filter(Boolean));
    const anonymousSessions = new Set(
      events
        .filter((event) => !event.userId && event.sessionId)
        .map((event) => event.sessionId),
    );
    const byName = new Map<string, number>();
    events.forEach((event) => increment(byName, event.name));

    return {
      days,
      totalEvents: events.length,
      activeUsers: users.size,
      anonymousSessions: anonymousSessions.size,
      signUps:
        (byName.get('sign_up_completed') ?? 0) +
        (byName.get('google_sign_up_completed') ?? 0),
      logins:
        (byName.get('login_success') ?? 0) +
        (byName.get('google_sign_in_success') ?? 0),
      catalogViews: byName.get('catalog_viewed') ?? 0,
      garmentViews: byName.get('garment_viewed') ?? 0,
      favoritesAdded: byName.get('favorite_added') ?? 0,
      favoritesRemoved: byName.get('favorite_removed') ?? 0,
      looksCreated: byName.get('look_created') ?? 0,
      purchaseRequestsCreated: byName.get('purchase_request_created') ?? 0,
      purchaseRequestsSold: events.filter(
        (event) =>
          event.name === 'purchase_request_status_changed' &&
          event.params.nextStatus === 'sold',
      ).length,
      inventoryItemsCreated: byName.get('inventory_item_created') ?? 0,
      inventoryItemsUpdated: byName.get('inventory_item_updated') ?? 0,
      topEvents: Array.from(byName.entries())
        .map(([eventName, count]) => ({ name: eventName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
    };
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('Analytics summary failed:', error);
    }
    return emptySummary(days);
  }
}
