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
  { label: 'Prendas activas', value: '100' },
  { label: 'Eventos KPI', value: '15' },
  { label: 'APK instalable', value: '1' },
] as const;

export type FlowItem = { icon: LucideIcon; step: string; title: string; copy: string };
export const clientFlow: FlowItem[] = [
  { icon: Sparkles, step: '01', title: 'Registro y perfil', copy: 'El usuario entra con correo o Google, elige si sera cliente o vendedor y registra telefono para que cada contacto comercial tenga trazabilidad.' },
  { icon: ShoppingBag, step: '02', title: 'Catalogo optimizado', copy: 'El catalogo actual trabaja con 100 prendas activas para evitar lag; Firestore guarda el inventario y SQLite acelera la primera carga.' },
  { icon: Heart, step: '03', title: 'Favoritos y looks', copy: 'Los favoritos muestran intencion de compra. Desde ellos el cliente arma looks, mezcla prendas y prepara combinaciones para solicitar.' },
  { icon: MessageCircle, step: '04', title: 'Solicitud comercial', copy: 'La app crea solicitudes por vendedor y maneja estados: pendiente, contactado, reservado, vendido o cancelado para medir conversion y stock.' },
];

export type RolePanel = {
  role: string; title: string; copy: string; icon: LucideIcon; accent: string;
  points: string[]; stats: Array<{ label: string; value: string }>;
};
export const rolePanels: RolePanel[] = [
  {
    role: 'Cliente', title: 'Compra guiada por estilo',
    copy: 'Representa la experiencia principal: descubrir prendas, guardar interes, crear looks y pasar de exploracion a contacto comercial.',
    icon: UserRoundCheck, accent: '#C9A84C',
    points: ['Explora catalogo filtrado', 'Crea looks desde favoritos', 'Solicita compra con telefono'],
    stats: [{ label: 'Intencion', value: 'likes' }, { label: 'Looks', value: 'SQLite' }, { label: 'Contacto', value: 'solicitud' }],
  },
  {
    role: 'Vendedor', title: 'Inventario con seguimiento',
    copy: 'Demuestra el lado operativo: publicar productos, recibir solicitudes, responder clientes y mantener inventario actualizado.',
    icon: Boxes, accent: '#52A882',
    points: ['Crea y edita prendas', 'Gestiona solicitudes y estados', 'Controla stock reservado/vendido'],
    stats: [{ label: 'Catalogo', value: '100' }, { label: 'Stock', value: 'vivo' }, { label: 'Ventas', value: 'status' }],
  },
  {
    role: 'Admin', title: 'Control operativo y metricas',
    copy: 'Cierra la evaluacion: permite revisar usuarios, actividad, calidad de datos, eventos KPI y evidencias tecnicas de la entrega.',
    icon: LayoutDashboard, accent: '#6CA8D9',
    points: ['Audita usuarios y roles', 'Revisa KPIs de adopcion', 'Valida reglas y calidad'],
    stats: [{ label: 'Usuarios', value: 'roles' }, { label: 'Eventos', value: '15' }, { label: 'Entrega', value: 'QA' }],
  },
];

export type ArchNode = { label: string; detail: string; icon: LucideIcon };
export const archNodes: ArchNode[] = [
  { label: 'Expo App', detail: 'UI, navegacion y APK', icon: Smartphone },
  { label: 'Firebase', detail: 'Auth, reglas y datos', icon: ShieldCheck },
  { label: 'SQLite cache', detail: 'Carga local rapida', icon: Database },
  { label: 'Analytics', detail: 'Eventos de uso y conversion', icon: BarChart3 },
  { label: 'Solicitudes', detail: 'Estados por vendedor', icon: ClipboardList },
  { label: 'Catalogo', detail: '100 prendas optimizadas', icon: UsersRound },
  { label: 'Cloudinary', detail: 'Imagenes por CDN', icon: BrainCircuit },
];

export const kpiCards = [
  { label: 'Adopcion', value: 'DAU / MAU', detail: 'Registros, login y apertura del catalogo explican cuantos usuarios llegan y vuelven a usar la app.' },
  { label: 'Conversion', value: 'Solicitudes', detail: 'purchase_request_created conecta vista de prenda o look con contacto real al vendedor.' },
  { label: 'Retencion', value: 'Reaperturas', detail: 'login_success, catalog_viewed y look_created ayudan a defender si el usuario regresa.' },
  { label: 'Inventario', value: 'Stock', detail: 'Los estados reservado, vendido y cancelado explican como sube o baja la disponibilidad.' },
] as const;

export type ProofItem = { icon: LucideIcon; title: string; copy: string };
export const proofItems: ProofItem[] = [
  { icon: ShieldCheck, title: 'Seguridad por rol', copy: 'Firebase Auth valida identidad; Firestore Rules limitan usuarios, prendas, looks y solicitudes segun rol.' },
  { icon: RadioTower, title: 'Rendimiento y red', copy: '100 prendas activas, cache SQLite y manejo de errores reducen lag y sostienen uso con red inestable.' },
  { icon: Smartphone, title: 'Entrega movil', copy: 'APK real generado con EAS Build preview, probado en Android y con ruta tecnica lista para iOS.' },
  { icon: BadgeCheck, title: 'Evidencia final', copy: 'Build TypeScript, pruebas, reglas, seed historico, KPIs y documentos QA/UX/KPI sustentan la entrega.' },
];

export const catalogPreview = [
  { title: 'Blazer champagne', price: '$189.000 COP', color: '#C9A84C' },
  { title: 'Look urbano', price: '3 prendas', color: '#313136' },
  { title: 'Stock vendedor', price: 'Reservadas + vendidas', color: '#52A882' },
] as const;

// DEV STORY
export type DevPhase = { phase: string; title: string; description: string };
export const devStory = {
  subject: 'Dispositivos Moviles',
  objective: 'Desarrollar y evaluar una aplicacion movil funcional para catalogo de moda aplicando arquitectura, persistencia, autenticacion, UX, despliegue, QA y metricas.',
  deliverable: 'MVP academico con APK instalable en Android, landing 3D de exposicion, pruebas automatizadas y documentacion tecnica.',
  phases: [
    { phase: '01', title: 'Arquitectura base', description: 'MVVM + Clean Architecture separa data, domain y presentation para que la app sea mantenible.' },
    { phase: '02', title: 'Autenticacion y roles', description: 'Firebase Auth con correo/contrasena y Google Sign-In. Cada rol recibe permisos y pantallas coherentes.' },
    { phase: '03', title: 'Catalogo y looks', description: 'Galeria filtrable, detalle de prenda, favoritos, creacion de looks y catalogo optimizado a 100 prendas.' },
    { phase: '04', title: 'Flujo comercial', description: 'Solicitudes por prenda o look, separacion por vendedor, estados de ciclo de vida e impacto en inventario.' },
    { phase: '05', title: 'KPIs y entrega', description: 'Eventos KPI, panel admin, pruebas automatizadas, reglas Firebase, EAS Build Android y landing 3D.' },
  ] as DevPhase[],
} as const;

// TECH STACK
export type TechItem = { name: string; version: string; role: string; category: 'core' | 'data' | 'auth' | 'build' | 'quality' };
export const techStack: TechItem[] = [
  { name: 'React Native', version: '0.81.5', role: 'UI y componentes moviles multiplataforma', category: 'core' },
  { name: 'Expo SDK', version: '54', role: 'Framework, herramientas y acceso nativo', category: 'core' },
  { name: 'TypeScript', version: '5.9', role: 'Tipado estatico y seguridad de tipos', category: 'core' },
  { name: 'React Navigation', version: 'v7', role: 'Navegacion por stack y entre pantallas', category: 'core' },
  { name: 'expo-sqlite', version: 'v16', role: 'Persistencia local offline-first', category: 'data' },
  { name: 'Cloud Firestore', version: 'v12', role: 'Base de datos remota y sync', category: 'data' },
  { name: 'Cloudinary', version: 'CDN', role: 'Almacenamiento y entrega de imagenes', category: 'data' },
  { name: 'Firebase Auth', version: 'v12', role: 'Autenticacion correo y Google', category: 'auth' },
  { name: 'EAS Build', version: 'preview', role: 'Build reproducible Android/iOS', category: 'build' },
  { name: 'Vitest', version: 'v4', role: 'Pruebas unitarias automatizadas', category: 'quality' },
];

// PURCHASE FLOW
export type PurchaseState = { id: string; label: string; color: string; description: string };
export const purchaseStates: PurchaseState[] = [
  { id: 'pending', label: 'Pendiente', color: '#9b9080', description: 'Solicitud creada por el cliente, esperando contacto del vendedor.' },
  { id: 'contacted', label: 'Contactado', color: '#6CA8D9', description: 'El vendedor contacto al cliente para coordinar la venta.' },
  { id: 'reserved', label: 'Reservada', color: '#C9A84C', description: 'Prenda apartada. El stock se descuenta como unidad reservada.' },
  { id: 'sold', label: 'Vendida', color: '#52A882', description: 'Venta completada. Stock confirmado como vendido.' },
  { id: 'cancelled', label: 'Cancelada', color: '#E05252', description: 'Solicitud cancelada. El stock reservado se restaura.' },
];

// DATABASE SCHEMA
export const sqliteTables = [
  { name: 'garments', purpose: 'Prendas y productos del catalogo' },
  { name: 'looks', purpose: 'Looks creados por usuarios' },
  { name: 'look_items', purpose: 'Relacion entre looks y prendas' },
  { name: 'favorites', purpose: 'Favoritos por usuario' },
  { name: 'schema_meta', purpose: 'Version de esquema y metadatos de sync' },
] as const;

export const firestoreCollections = [
  { name: 'users', purpose: 'Perfiles, roles y telefonos' },
  { name: 'garments', purpose: 'Catalogo remoto optimizado a 100 prendas' },
  { name: 'looks', purpose: 'Sincronizacion de looks' },
  { name: 'purchaseRequests', purpose: 'Solicitudes de compra' },
  { name: 'analyticsEvents', purpose: 'Eventos KPI de uso y conversion' },
] as const;

// SCALE & EVIDENCE
export const scaleStats = {
  current: { garments: 100, categories: 20, garmentsPerCategory: 5 },
  seed: { admins: 3, vendors: 40, clients: 250, garments: 1500, totalDocs: 1793 },
  stress: { admins: 3, vendors: 80, clients: 500, garments: 3000, totalDocs: 3583 },
  tests: { files: 9, cases: 15 },
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

// NAV (unused extended content)
export const navItems13 = [
  { label: 'Desarrollo', target: 'dev' },
  { label: 'Stack', target: 'stack' },
  { label: 'Roles', target: 'roles' },
  { label: 'Arch', target: 'arch' },
  { label: 'KPIs', target: 'kpis' },
  { label: 'Escala', target: 'scale' },
  { label: 'APK', target: 'demo' },
] as const;
