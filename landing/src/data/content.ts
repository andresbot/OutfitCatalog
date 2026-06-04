import {
  BadgeCheck, BarChart3, Boxes, BrainCircuit, ClipboardList, Database,
  Heart, LayoutDashboard, MessageCircle, RadioTower,
  ShieldCheck, ShoppingBag, Smartphone, Sparkles, UserRoundCheck, UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const apkUrl = 'https://expo.dev/artifacts/eas/op3jk14owqSZtyJV5J7rBA.apk';

export const authors = ['Andres Botero', 'Juan Camilo Triana'] as const;

export const navItems = [
  { label: 'App', target: 'whatis' },
  { label: 'Flujo', target: 'flow' },
  { label: 'Roles', target: 'roles' },
  { label: 'Arquitectura', target: 'arch' },
  { label: 'KPIs', target: 'kpis' },
  { label: 'QA', target: 'qa' },
] as const;

export const heroMetrics = [
  { label: 'Roles conectados', value: '3' },
  { label: 'Flujos clave', value: '9' },
  { label: 'Eventos KPI', value: '12+' },
  { label: 'Build Android', value: 'APK' },
] as const;

export type FlowItem = { icon: LucideIcon; step: string; title: string; copy: string };
export const clientFlow: FlowItem[] = [
  { icon: Sparkles, step: '01', title: 'Onboarding directo', copy: 'El usuario entiende el valor de la app, crea cuenta con correo o Google y registra telefono para completar el perfil.' },
  { icon: ShoppingBag, step: '02', title: 'Catalogo filtrable', copy: 'Explora prendas por categoria, talla, precio y vendedor, con carga optimizada y cache local para una primera experiencia fluida.' },
  { icon: Heart, step: '03', title: 'Favoritos y looks', copy: 'Guarda prendas, arma looks desde favoritos y conserva combinaciones listas para compartir o solicitar.' },
  { icon: MessageCircle, step: '04', title: 'Solicitud comercial', copy: 'Crea solicitudes por prenda o por look, separadas por vendedor cuando el look mezcla tiendas distintas.' },
];

export type RolePanel = {
  role: string; title: string; copy: string; icon: LucideIcon; accent: string;
  points: string[]; stats: Array<{ label: string; value: string }>;
};
export const rolePanels: RolePanel[] = [
  {
    role: 'Cliente', title: 'Compra guiada por estilo',
    copy: 'El cliente construye una seleccion visual, guarda favoritos, crea looks y contacta al vendedor correcto.',
    icon: UserRoundCheck, accent: '#C9A84C',
    points: ['Registro con telefono obligatorio', 'Looks desde favoritos', 'Envio del look por WhatsApp'],
    stats: [{ label: 'Favoritos', value: 'sync' }, { label: 'Looks', value: 'local + cloud' }, { label: 'Solicitudes', value: 'estado vivo' }],
  },
  {
    role: 'Vendedor', title: 'Inventario con seguimiento',
    copy: 'Administra prendas, revisa solicitudes, cambia estados y ve como el stock baja o se reserva segun el avance comercial.',
    icon: Boxes, accent: '#52A882',
    points: ['Stock bajo y agotado', 'Reservadas y vendidas', 'WhatsApp de contacto por tienda'],
    stats: [{ label: 'Productos', value: 'conteo' }, { label: 'Unidades', value: 'stock' }, { label: 'Ventas', value: 'status' }],
  },
  {
    role: 'Admin', title: 'Control operativo y metricas',
    copy: 'Supervisa usuarios, vendedores, catalogo global, moderacion y KPIs del comportamiento real de la app.',
    icon: LayoutDashboard, accent: '#6CA8D9',
    points: ['Gestion de usuarios', 'Reportes por rol', 'Eventos de adopcion y conversion'],
    stats: [{ label: 'Usuarios', value: 'roles' }, { label: 'KPIs', value: '30 dias' }, { label: 'Calidad', value: 'QA' }],
  },
];

export type ArchNode = { label: string; detail: string; icon: LucideIcon };
export const archNodes: ArchNode[] = [
  { label: 'Expo App', detail: 'React Native 0.81', icon: Smartphone },
  { label: 'Firebase', detail: 'Auth + Firestore', icon: ShieldCheck },
  { label: 'SQLite cache', detail: 'Offline first', icon: Database },
  { label: 'Analytics', detail: 'KPIs gratis', icon: BarChart3 },
  { label: 'Solicitudes', detail: 'Reserva / venta', icon: ClipboardList },
  { label: 'Seed masivo', detail: 'Usuarios + prendas', icon: UsersRound },
  { label: 'Try-on', detail: 'Flujo visual', icon: BrainCircuit },
];

export const kpiCards = [
  { label: 'Usuarios activos', value: 'DAU / MAU', detail: 'Medibles con Firebase Analytics y eventos propios.' },
  { label: 'Conversion', value: 'Solicitudes', detail: 'Desde vista de prenda o look hasta reserva y venta.' },
  { label: 'Retencion', value: 'Reaperturas', detail: 'Se analiza por login, catalog_viewed y look_created.' },
  { label: 'Inventario', value: 'Stock', detail: 'Baja al vender, se reserva por estado y marca agotados.' },
] as const;

export type ProofItem = { icon: LucideIcon; title: string; copy: string };
export const proofItems: ProofItem[] = [
  { icon: ShieldCheck, title: 'Firebase seguro', copy: 'Auth, Firestore rules por rol, validacion de solicitudes y permisos separados para cliente, vendedor y admin.' },
  { icon: RadioTower, title: 'Red resiliente', copy: 'Cache local, banner offline, sincronizacion al reconectar y mensajes claros cuando Firestore rechaza una accion.' },
  { icon: Smartphone, title: 'Entrega movil', copy: 'APK generado con EAS para Android y ruta preparada para iOS via Apple Developer o TestFlight.' },
  { icon: BadgeCheck, title: 'Evidencia final', copy: 'Build TypeScript, pruebas unitarias, reglas finales, seed masivo y documentos QA/UX/KPI listos para entrega academica.' },
];

export const catalogPreview = [
  { title: 'Blazer champagne', price: '$189.000 COP', color: '#C9A84C' },
  { title: 'Look urbano', price: '3 prendas', color: '#313136' },
  { title: 'Stock vendedor', price: 'Reservadas + vendidas', color: '#52A882' },
] as const;

// ─── DEV STORY ───────────────────────────────────────────────────────────────
export type DevPhase = { phase: string; title: string; description: string };
export const devStory = {
  subject: 'Dispositivos Moviles',
  objective: 'Desarrollar y evaluar una aplicacion movil funcional para catalogo de moda aplicando arquitectura, persistencia, autenticacion, UX, despliegue y QA.',
  deliverable: 'MVP academico con APK instalable en Android, pruebas automatizadas y documentacion tecnica.',
  phases: [
    { phase: '01', title: 'Arquitectura base', description: 'MVVM + Clean Architecture, capas data/domain/presentation, inyeccion de dependencias, SQLite con migraciones.' },
    { phase: '02', title: 'Autenticacion y roles', description: 'Firebase Auth con correo/contrasena y Google Sign-In. Roles diferenciados: cliente, vendedor, admin.' },
    { phase: '03', title: 'Catalogo y looks', description: 'Galeria filtrable, detalle de prenda, favoritos, creacion de looks y envio por WhatsApp.' },
    { phase: '04', title: 'Flujo comercial', description: 'Solicitudes de compra por prenda o look, estados de ciclo de vida, inventario con metricas de stock.' },
    { phase: '05', title: 'KPIs y entrega', description: 'Analytics propio en Firestore, panel admin con KPIs de 30 dias, seed masivo, EAS Build Android.' },
  ] as DevPhase[],
} as const;

// ─── TECH STACK ──────────────────────────────────────────────────────────────
export type TechItem = { name: string; version: string; role: string; category: 'core' | 'data' | 'auth' | 'build' | 'quality' };
export const techStack: TechItem[] = [
  { name: 'React Native', version: '0.81.5', role: 'UI y componentes moviles multiplataforma', category: 'core' },
  { name: 'Expo SDK', version: '54', role: 'Framework, herramientas y acceso nativo', category: 'core' },
  { name: 'TypeScript', version: '5.9', role: 'Tipado estatico y seguridad de tipos', category: 'core' },
  { name: 'React Navigation', version: 'v7', role: 'Navegacion por stack y entre pantallas', category: 'core' },
  { name: 'expo-sqlite', version: 'v16', role: 'Persistencia local offline-first', category: 'data' },
  { name: 'Cloud Firestore', version: 'v12', role: 'Base de datos remota y sync', category: 'data' },
  { name: 'Cloudinary', version: '—', role: 'Almacenamiento y CDN de imagenes', category: 'data' },
  { name: 'Firebase Auth', version: 'v12', role: 'Autenticacion correo y Google', category: 'auth' },
  { name: 'EAS Build', version: '—', role: 'Build reproducible Android/iOS', category: 'build' },
  { name: 'Vitest', version: 'v4', role: 'Pruebas unitarias automatizadas', category: 'quality' },
];

// ─── PURCHASE FLOW (STATE MACHINE) ──────────────────────────────────────────
export type PurchaseState = { id: string; label: string; color: string; description: string };
export const purchaseStates: PurchaseState[] = [
  { id: 'pending',    label: 'Pendiente',  color: '#9b9080', description: 'Solicitud creada por el cliente, esperando contacto del vendedor.' },
  { id: 'contacted',  label: 'Contactado', color: '#6CA8D9', description: 'El vendedor contacto al cliente para coordinar la venta.' },
  { id: 'reserved',   label: 'Reservada',  color: '#C9A84C', description: 'Prenda apartada. El stock se descuenta como unidad reservada.' },
  { id: 'sold',       label: 'Vendida',    color: '#52A882', description: 'Venta completada. Stock confirmado como vendido.' },
  { id: 'cancelled',  label: 'Cancelada',  color: '#E05252', description: 'Solicitud cancelada. El stock reservado se restaura.' },
];

// ─── DATABASE SCHEMA ─────────────────────────────────────────────────────────
export const sqliteTables = [
  { name: 'garments',     purpose: 'Prendas y productos del catalogo' },
  { name: 'looks',        purpose: 'Looks creados por usuarios' },
  { name: 'look_items',   purpose: 'Relacion entre looks y prendas' },
  { name: 'favorites',    purpose: 'Favoritos por usuario' },
  { name: 'schema_meta',  purpose: 'Version de esquema y metadatos de sync' },
] as const;

export const firestoreCollections = [
  { name: 'users',             purpose: 'Perfiles, roles y telefonos' },
  { name: 'garments',          purpose: 'Catalogo e inventario remoto' },
  { name: 'looks',             purpose: 'Sincronizacion de looks' },
  { name: 'purchaseRequests',  purpose: 'Solicitudes de compra' },
  { name: 'analyticsEvents',   purpose: 'Eventos KPI de uso y conversion' },
] as const;

// ─── SCALE & EVIDENCE ────────────────────────────────────────────────────────
export const scaleStats = {
  seed: { admins: 3, vendors: 40, clients: 250, garments: 1500, totalDocs: 1793 },
  stress: { admins: 3, vendors: 80, clients: 500, garments: 3000, totalDocs: 3583 },
  tests: { files: 9, cases: 14 },
  build: {
    commitSha: '5bd8d25',
    buildId: 'b56095a2-87a4-4dac-ae47-7f5d8599dee4',
    platform: 'Android',
    profile: 'preview',
    status: 'FINISHED',
    packageName: 'com.camilotriana07.outfitcatalog',
  },
  analyticsEvents: 15,
} as const;

export const analyticsEventsList = [
  'sign_up_completed', 'google_sign_up_completed', 'login_success', 'google_sign_in_success',
  'catalog_viewed', 'garment_viewed', 'favorite_added', 'favorite_removed',
  'look_created', 'look_updated', 'look_deleted',
  'purchase_request_created', 'purchase_request_status_changed', 'purchase_request_deleted',
  'inventory_item_created',
] as const;

// ─── NAV (UPDATED — 13 scenes) ──────────────────────────────────────────────
export const navItems13 = [
  { label: 'Desarrollo', target: 'dev' },
  { label: 'Stack',      target: 'stack' },
  { label: 'Roles',      target: 'roles' },
  { label: 'Arch',       target: 'arch' },
  { label: 'KPIs',       target: 'kpis' },
  { label: 'Escala',     target: 'scale' },
  { label: 'APK',        target: 'demo' },
] as const;
