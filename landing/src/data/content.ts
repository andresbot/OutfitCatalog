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
