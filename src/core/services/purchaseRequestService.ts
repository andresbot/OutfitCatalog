import { GarmentRow } from '../database/types';
import { trackEvent } from './analyticsService';

export type PurchaseRequestStatus = 'pending' | 'contacted' | 'reserved' | 'sold' | 'cancelled';

export type PurchaseRequestItem = {
  garmentId: string;
  name: string;
  category: string;
  price: number;
  size: string;
  color: string;
  imageUrl: string;
  vendorId: string;
  vendorName: string;
};

export type PurchaseRequest = {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  vendorId: string;
  vendorName: string;
  source: 'garment' | 'look';
  sourceId: string;
  sourceName: string;
  items: PurchaseRequestItem[];
  total: number;
  status: PurchaseRequestStatus;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type CreatePurchaseRequestInput = {
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  vendorId: string;
  vendorName: string;
  source: 'garment' | 'look';
  sourceId: string;
  sourceName: string;
  items: PurchaseRequestItem[];
  message?: string;
};

export type VendorStockMetrics = {
  productCount: number;
  availableUnits: number;
  inventoryValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingRequests: number;
  activeRequests: number;
  reservedUnits: number;
  soldUnits: number;
};

type MetricGarment = {
  stock: number;
  price: number;
};

type FirebaseRuntime = {
  initializeApp: any;
  getApps: any;
  getApp: any;
  getFirestore: any;
  collection: any;
  doc: any;
  getDocs: any;
  query: any;
  runTransaction: any;
  setDoc: any;
  updateDoc: any;
  deleteDoc: any;
  where: any;
};

const COLLECTION_NAME = 'purchaseRequests';
const GARMENT_COLLECTION_NAME = 'garments';
const LOW_STOCK_THRESHOLD = 5;

export const PURCHASE_REQUEST_STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
  pending: 'Pendiente',
  contacted: 'Contactado',
  reserved: 'Reservado',
  sold: 'Vendido',
  cancelled: 'Cancelado',
};

let runtimeCache: FirebaseRuntime | null = null;
let dbCache: any = null;
let storageCache: any | null = null;

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
      doc: firestore.doc,
      getDocs: firestore.getDocs,
      query: firestore.query,
      runTransaction: firestore.runTransaction,
      setDoc: firestore.setDoc,
      updateDoc: firestore.updateDoc,
      deleteDoc: firestore.deleteDoc,
      where: firestore.where,
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

function getStorage(): any | null {
  if (storageCache) return storageCache;

  try {
    // eslint-disable-next-line global-require
    const asyncStorageModule = require('@react-native-async-storage/async-storage');
    storageCache = asyncStorageModule.default ?? asyncStorageModule;
    return storageCache;
  } catch {
    return null;
  }
}

function localStorageKey(): string {
  return `${COLLECTION_NAME}:local`;
}

async function readLocalRequests(): Promise<PurchaseRequest[]> {
  const storage = getStorage();
  if (!storage) return [];

  const raw = await storage.getItem(localStorageKey());
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((item) => toPurchaseRequest(item.id, item))
      : [];
  } catch {
    return [];
  }
}

async function writeLocalRequests(requests: PurchaseRequest[]): Promise<void> {
  const storage = getStorage();
  if (!storage) return;
  await storage.setItem(localStorageKey(), JSON.stringify(requests));
}

async function saveLocalRequest(request: PurchaseRequest): Promise<void> {
  const current = await readLocalRequests();
  const withoutDuplicate = current.filter((item) => item.id !== request.id);
  await writeLocalRequests([request, ...withoutDuplicate]);
}

async function removeLocalRequest(requestId: string): Promise<void> {
  const current = await readLocalRequests();
  await writeLocalRequests(current.filter((item) => item.id !== requestId));
}

function mergeRequests(remote: PurchaseRequest[], local: PurchaseRequest[]): PurchaseRequest[] {
  const map = new Map<string, PurchaseRequest>();
  for (const request of [...local, ...remote]) {
    map.set(request.id, request);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function toRequestError(error: unknown): Error {
  const code = (error as { code?: string })?.code;
  if (code === 'permission-denied') {
    return new Error('Firestore rechazo purchaseRequests. Revisa reglas de Firebase.');
  }
  if (code === 'unavailable') {
    return new Error('Firebase no esta disponible. Se usara cache local.');
  }
  return error instanceof Error ? error : new Error('No se pudo guardar la solicitud.');
}

function statusConsumesStock(status: PurchaseRequestStatus): boolean {
  return status === 'reserved' || status === 'sold';
}

function stockDeltaForStatusChange(
  currentStatus: PurchaseRequestStatus,
  nextStatus: PurchaseRequestStatus,
): number {
  const currentConsumes = statusConsumesStock(currentStatus);
  const nextConsumes = statusConsumesStock(nextStatus);

  if (currentConsumes === nextConsumes) return 0;
  return nextConsumes ? -1 : 1;
}

function countItemsByGarment(items: PurchaseRequestItem[]): Map<string, {
  item: PurchaseRequestItem;
  quantity: number;
}> {
  const quantities = new Map<string, { item: PurchaseRequestItem; quantity: number }>();

  for (const item of items) {
    const current = quantities.get(item.garmentId);
    if (current) {
      current.quantity += 1;
    } else {
      quantities.set(item.garmentId, { item, quantity: 1 });
    }
  }

  return quantities;
}

function readNumericField(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function calculateMetrics(
  garments: MetricGarment[],
  requests: PurchaseRequest[],
): VendorStockMetrics {
  const availableUnits = garments.reduce((sum, garment) => sum + garment.stock, 0);
  const inventoryValue = garments.reduce(
    (sum, garment) => sum + garment.stock * garment.price,
    0,
  );
  const reservedUnits = requests
    .filter((request) => request.status === 'reserved')
    .reduce((sum, request) => sum + request.items.length, 0);
  const soldUnits = requests
    .filter((request) => request.status === 'sold')
    .reduce((sum, request) => sum + request.items.length, 0);

  return {
    productCount: garments.length,
    availableUnits,
    inventoryValue,
    lowStockProducts: garments.filter(
      (garment) => garment.stock > 0 && garment.stock <= LOW_STOCK_THRESHOLD,
    ).length,
    outOfStockProducts: garments.filter((garment) => garment.stock === 0).length,
    pendingRequests: requests.filter((request) => request.status === 'pending').length,
    activeRequests: requests.filter((request) =>
      request.status === 'pending' ||
      request.status === 'contacted' ||
      request.status === 'reserved',
    ).length,
    reservedUnits,
    soldUnits,
  };
}

function normalizeStatus(value: unknown): PurchaseRequestStatus {
  if (
    value === 'pending' ||
    value === 'contacted' ||
    value === 'reserved' ||
    value === 'sold' ||
    value === 'cancelled'
  ) {
    return value;
  }
  return 'pending';
}

function toPurchaseRequest(id: string, value: Record<string, unknown>): PurchaseRequest {
  const items = Array.isArray(value.items)
    ? (value.items as PurchaseRequestItem[])
    : [];

  return {
    id,
    buyerId: typeof value.buyerId === 'string' ? value.buyerId : '',
    buyerName: typeof value.buyerName === 'string' ? value.buyerName : 'Cliente',
    buyerEmail: typeof value.buyerEmail === 'string' ? value.buyerEmail : '',
    buyerPhone: typeof value.buyerPhone === 'string' ? value.buyerPhone : undefined,
    vendorId: typeof value.vendorId === 'string' ? value.vendorId : '',
    vendorName: typeof value.vendorName === 'string' ? value.vendorName : 'Vendedor',
    source: value.source === 'look' ? 'look' : 'garment',
    sourceId: typeof value.sourceId === 'string' ? value.sourceId : '',
    sourceName: typeof value.sourceName === 'string' ? value.sourceName : '',
    items,
    total: typeof value.total === 'number' ? value.total : Number(value.total ?? 0),
    status: normalizeStatus(value.status),
    message: typeof value.message === 'string' ? value.message : '',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
  };
}

function createId(input: CreatePurchaseRequestInput): string {
  const entropy = Math.random().toString(36).slice(2, 8);
  return `request-${input.buyerId}-${input.vendorId}-${Date.now()}-${entropy}`;
}

export function garmentToRequestItem(
  garment: Pick<
    GarmentRow,
    | 'id'
    | 'name'
    | 'category'
    | 'price'
    | 'size'
    | 'color'
    | 'imageUrl'
    | 'vendorId'
    | 'vendorName'
  >,
): PurchaseRequestItem {
  return {
    garmentId: garment.id,
    name: garment.name,
    category: garment.category,
    price: garment.price,
    size: garment.size,
    color: garment.color,
    imageUrl: garment.imageUrl,
    vendorId: garment.vendorId,
    vendorName: garment.vendorName,
  };
}

export function buildPurchaseRequestMessage(request: Pick<
  PurchaseRequest,
  'buyerName' | 'buyerPhone' | 'items' | 'source' | 'sourceName' | 'total'
>): string {
  const lines = [
    `Hola, soy ${request.buyerName}.`,
    '',
    request.source === 'look'
      ? `Quiero consultar/reservar este look: ${request.sourceName || 'Look'}`
      : 'Quiero consultar/reservar esta prenda:',
    '',
  ];

  for (const item of request.items) {
    lines.push(`- ${item.name}`);
    lines.push(`  Talla: ${item.size} | Color: ${item.color}`);
    lines.push(`  Precio: $${item.price.toLocaleString('es-CO')}`);
    lines.push('');
  }

  lines.push(`Total estimado: $${request.total.toLocaleString('es-CO')}`);
  if (request.buyerPhone) {
    lines.push(`Telefono: ${request.buyerPhone}`);
  }
  lines.push('');
  lines.push('Solicitud registrada desde ATELIER.');
  return lines.join('\n');
}

export async function createPurchaseRequest(
  input: CreatePurchaseRequestInput,
): Promise<PurchaseRequest> {
  const now = new Date().toISOString();
  const total = input.items.reduce((sum, item) => sum + item.price, 0);
  const buyerPhone = input.buyerPhone?.trim();
  const draft: PurchaseRequest = {
    id: createId(input),
    buyerId: input.buyerId,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    ...(buyerPhone ? { buyerPhone } : {}),
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    source: input.source,
    sourceId: input.sourceId,
    sourceName: input.sourceName,
    items: input.items,
    total,
    status: 'pending',
    message: '',
    createdAt: now,
    updatedAt: now,
  };
  const message = input.message || buildPurchaseRequestMessage(draft);
  const request = { ...draft, message };
  const context = getDb();
  let remoteSaved = true;

  try {
    if (!context) {
      throw new Error('Firebase no esta configurado.');
    }
    await context.runtime.setDoc(
      context.runtime.doc(context.db, COLLECTION_NAME, request.id),
      request,
    );
  } catch (error) {
    remoteSaved = false;
    console.warn('Purchase request remote save failed, using local cache:', toRequestError(error));
    await saveLocalRequest(request);
  }

  void trackEvent(
    'purchase_request_created',
    {
      source: request.source,
      sourceId: request.sourceId,
      vendorId: request.vendorId,
      itemCount: request.items.length,
      total: request.total,
      remoteSaved,
    },
    {
      id: request.buyerId,
      name: request.buyerName,
      email: request.buyerEmail,
      role: 'user',
      ...(request.buyerPhone ? { phone: request.buyerPhone } : {}),
    },
  );

  return request;
}

export async function listPurchaseRequestsForUser(
  userId: string,
  mode: 'buyer' | 'vendor',
): Promise<PurchaseRequest[]> {
  const context = getDb();
  const local = (await readLocalRequests()).filter((request) =>
    mode === 'vendor' ? request.vendorId === userId : request.buyerId === userId,
  );
  if (!context) return local;

  try {
    const field = mode === 'vendor' ? 'vendorId' : 'buyerId';
    const q = context.runtime.query(
      context.runtime.collection(context.db, COLLECTION_NAME),
      context.runtime.where(field, '==', userId),
    );
    const snapshot = await context.runtime.getDocs(q);
    const requests: PurchaseRequest[] = [];
    snapshot.forEach((docSnap: any) => {
      requests.push(toPurchaseRequest(docSnap.id, docSnap.data() as Record<string, unknown>));
    });

    return mergeRequests(requests, local);
  } catch (error) {
    console.warn('Purchase request remote list failed, using local cache:', toRequestError(error));
    return local;
  }
}

export async function getVendorStockMetrics(vendorId: string): Promise<VendorStockMetrics> {
  const requests = await listPurchaseRequestsForUser(vendorId, 'vendor');
  const context = getDb();

  if (!context) {
    return calculateMetrics([], requests);
  }

  try {
    const q = context.runtime.query(
      context.runtime.collection(context.db, GARMENT_COLLECTION_NAME),
      context.runtime.where('vendorId', '==', vendorId),
    );
    const snapshot = await context.runtime.getDocs(q);
    const garments: MetricGarment[] = [];

    snapshot.forEach((docSnap: any) => {
      const data = docSnap.data() as Record<string, unknown>;
      garments.push({
        stock: readNumericField(data.stock, 0),
        price: readNumericField(data.price, 0),
      });
    });

    return calculateMetrics(garments, requests);
  } catch (error) {
    console.warn('Vendor stock metrics failed:', toRequestError(error));
    return calculateMetrics([], requests);
  }
}

async function applyStockDeltaForRequest(
  context: { runtime: FirebaseRuntime; db: any },
  transaction: any,
  request: PurchaseRequest,
  deltaPerUnit: number,
  now: string,
): Promise<void> {
  if (deltaPerUnit === 0 || request.items.length === 0) return;

  const quantities = countItemsByGarment(request.items);
  const entries = Array.from(quantities.values()).map(({ item, quantity }) => ({
    item,
    quantity,
    ref: context.runtime.doc(context.db, GARMENT_COLLECTION_NAME, item.garmentId),
  }));
  const snapshots = await Promise.all(entries.map((entry) => transaction.get(entry.ref)));

  for (let index = 0; index < entries.length; index += 1) {
    const { item, quantity, ref } = entries[index];
    const garmentSnap = snapshots[index];

    if (!garmentSnap.exists()) {
      throw new Error(`No existe la prenda "${item.name}" para actualizar stock.`);
    }

    const data = garmentSnap.data() as Record<string, unknown>;
    const currentStock = readNumericField(data.stock, 0);
    const nextStock = currentStock + deltaPerUnit * quantity;

    if (nextStock < 0) {
      throw new Error(
        `Stock insuficiente para "${item.name}". Disponible: ${currentStock}, requerido: ${quantity}.`,
      );
    }

    transaction.update(ref, {
      stock: nextStock,
      updatedAt: now,
    });
  }
}

export async function updatePurchaseRequestStatus(
  requestId: string,
  status: PurchaseRequestStatus,
): Promise<void> {
  const context = getDb();
  const local = await readLocalRequests();
  const localRequest = local.find((request) => request.id === requestId);
  const existsLocal = Boolean(localRequest);
  let trackedRequest: PurchaseRequest | null = localRequest ?? null;
  let previousStatus: PurchaseRequestStatus | null = localRequest?.status ?? null;

  try {
    if (!context) {
      throw new Error('Firebase no esta configurado.');
    }
    await context.runtime.runTransaction(context.db, async (transaction: any) => {
      const requestRef = context.runtime.doc(context.db, COLLECTION_NAME, requestId);
      const requestSnap = await transaction.get(requestRef);

      if (!requestSnap.exists()) {
        throw new Error('No existe la solicitud en Firestore.');
      }

      const currentRequest = toPurchaseRequest(
        requestSnap.id,
        requestSnap.data() as Record<string, unknown>,
      );
      trackedRequest = currentRequest;
      previousStatus = currentRequest.status;
      const now = new Date().toISOString();
      const delta = stockDeltaForStatusChange(currentRequest.status, status);

      await applyStockDeltaForRequest(context, transaction, currentRequest, delta, now);

      transaction.update(requestRef, {
        status,
        updatedAt: now,
      });
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === 'permission-denied') {
      throw toRequestError(error);
    }
    if (!existsLocal) {
      throw toRequestError(error);
    }
    console.warn('Purchase request remote update failed, using local cache:', toRequestError(error));
  }

  if (existsLocal) {
    await writeLocalRequests(
      local.map((request) =>
        request.id === requestId
          ? { ...request, status, updatedAt: new Date().toISOString() }
          : request,
      ),
    );
  }

  if (trackedRequest && previousStatus !== status) {
    void trackEvent(
      'purchase_request_status_changed',
      {
        requestId,
        previousStatus,
        nextStatus: status,
        source: trackedRequest.source,
        vendorId: trackedRequest.vendorId,
        buyerId: trackedRequest.buyerId,
        itemCount: trackedRequest.items.length,
        total: trackedRequest.total,
      },
      {
        id: trackedRequest.vendorId,
        name: trackedRequest.vendorName,
        email: '',
        role: 'vendor',
      },
    );
  }
}

export async function deletePurchaseRequest(requestId: string): Promise<void> {
  const context = getDb();
  const local = await readLocalRequests();
  const localRequest = local.find((request) => request.id === requestId);
  const existsLocal = Boolean(localRequest);

  if (existsLocal) {
    await removeLocalRequest(requestId);
    if (localRequest) {
      void trackEvent(
        'purchase_request_deleted',
        {
          requestId,
          source: localRequest.source,
          vendorId: localRequest.vendorId,
          buyerId: localRequest.buyerId,
          status: localRequest.status,
          itemCount: localRequest.items.length,
          localOnly: true,
        },
        {
          id: localRequest.buyerId,
          name: localRequest.buyerName,
          email: localRequest.buyerEmail,
          role: 'user',
          ...(localRequest.buyerPhone ? { phone: localRequest.buyerPhone } : {}),
        },
      );
    }
    return;
  }

  const deletedRequestRef: { current: PurchaseRequest | null } = { current: null };
  try {
    if (!context) {
      throw new Error('Firebase no esta configurado.');
    }
    await context.runtime.runTransaction(context.db, async (transaction: any) => {
      const requestRef = context.runtime.doc(context.db, COLLECTION_NAME, requestId);
      const requestSnap = await transaction.get(requestRef);

      if (!requestSnap.exists()) {
        return;
      }

      const currentRequest = toPurchaseRequest(
        requestSnap.id,
        requestSnap.data() as Record<string, unknown>,
      );
      deletedRequestRef.current = currentRequest;
      const now = new Date().toISOString();

      if (currentRequest.status === 'reserved') {
        await applyStockDeltaForRequest(context, transaction, currentRequest, 1, now);
      }

      transaction.delete(requestRef);
    });
  } catch (error) {
    throw toRequestError(error);
  }

  if (deletedRequestRef.current) {
    const deletedRequest = deletedRequestRef.current;
    void trackEvent(
      'purchase_request_deleted',
      {
        requestId,
        source: deletedRequest.source,
        vendorId: deletedRequest.vendorId,
        buyerId: deletedRequest.buyerId,
        status: deletedRequest.status,
        itemCount: deletedRequest.items.length,
        localOnly: false,
      },
    );
  }
}
