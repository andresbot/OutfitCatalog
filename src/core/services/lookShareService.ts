import { Alert, Linking } from 'react-native';
import { getVendorPhone } from '../../auth/firebaseUsers';
import { formatCOP } from '../../features/garment/presentation/utils/formatCOP';
import { GarmentRow } from '../database/types';

export type VendorShareGroup = {
  vendorId: string;
  vendorName: string;
  vendorPhone: string | null;
  garments: Pick<GarmentRow, 'name' | 'price' | 'size' | 'color' | 'category'>[];
};

/** Groups garments by vendor and fetches each vendor's WhatsApp phone from Firestore. */
export async function buildShareGroups(
  garments: GarmentRow[],
): Promise<VendorShareGroup[]> {
  const map = new Map<string, VendorShareGroup>();

  for (const g of garments) {
    if (!map.has(g.vendorId)) {
      const phone = await getVendorPhone(g.vendorId);
      map.set(g.vendorId, {
        vendorId: g.vendorId,
        vendorName: g.vendorName,
        vendorPhone: phone,
        garments: [],
      });
    }
    map.get(g.vendorId)!.garments.push(g);
  }

  return Array.from(map.values());
}

/** Builds the WhatsApp message for a single vendor group. */
export function buildWhatsAppMessage(lookName: string, group: VendorShareGroup): string {
  const lines: string[] = [
    `Hola ${group.vendorName} 👋`,
    '',
    'Estoy interesado/a en las siguientes prendas de tu catálogo:',
    '',
  ];

  for (const g of group.garments) {
    lines.push(`• *${g.name}*`);
    lines.push(`  Categoría: ${g.category}`);
    lines.push(`  Talla: ${g.size} · Color: ${g.color}`);
    lines.push(`  Precio: ${formatCOP(g.price)}`);
    lines.push('');
  }

  if (lookName.trim()) {
    lines.push(`Look: _"${lookName}"_`);
    lines.push('');
  }

  lines.push('_Enviado desde ATELIER_ ✨');
  return lines.join('\n');
}

type PersonalLookGarment = Pick<
  GarmentRow,
  'name' | 'price' | 'size' | 'color' | 'category' | 'vendorName'
>;

export function buildPersonalLookMessage(
  lookName: string,
  garments: PersonalLookGarment[],
): string {
  const total = garments.reduce((sum, garment) => sum + garment.price, 0);
  const lines: string[] = ['*Mi look en ATELIER*', ''];

  if (lookName.trim()) {
    lines.push(`Look: _"${lookName}"_`);
    lines.push('');
  }

  lines.push('Prendas guardadas en este look:');
  lines.push('');

  for (const garment of garments) {
    lines.push(`- *${garment.name}*`);
    lines.push(`  Vendedor: ${garment.vendorName}`);
    lines.push(`  Categoria: ${garment.category}`);
    lines.push(`  Talla: ${garment.size} · Color: ${garment.color}`);
    lines.push(`  Precio: ${formatCOP(garment.price)}`);
    lines.push('');
  }

  lines.push(`Total estimado: *${formatCOP(total)}*`);
  lines.push('');
  lines.push('_Enviado desde ATELIER_');
  return lines.join('\n');
}

// ── Garment share ────────────────────────────────────────────────────────────

type GarmentShareInput = {
  name: string;
  category: string;
  price: number;
  size: string;
  color: string;
  stock: number;
  imageUrl: string;
  vendorId: string;
  vendorName: string;
  resultImageUrl?: string;
};

function stockLabel(stock: number): string {
  if (stock === 0) return 'Agotado ❌';
  if (stock <= 5) return `Últimas ${stock} unidades ⚠️`;
  return 'En stock ✅';
}

export function buildGarmentShareMessage(g: GarmentShareInput): string {
  const lines = [
    `*${g.name}* — ${g.vendorName}`,
    '',
    `Categoría: ${g.category}`,
    `Talla: ${g.size} · Color: ${g.color}`,
    `Precio: ${formatCOP(g.price)}`,
    `Disponibilidad: ${stockLabel(g.stock)}`,
    '',
    g.resultImageUrl
      ? `📸 Así me vería con esta prenda:\n${g.resultImageUrl}`
      : g.imageUrl,
    '',
    '¿Estás interesado/a en esta prenda?',
    '',
    '_Enviado desde ATELIER_ ✨',
  ];
  return lines.join('\n');
}

export async function shareGarment(g: GarmentShareInput): Promise<void> {
  const phone = await getVendorPhone(g.vendorId);
  const message = buildGarmentShareMessage(g);
  await openWhatsApp(phone, message);
}

/** Opens WhatsApp with the given phone number and message. */
export async function openWhatsApp(
  phone: string | null,
  message: string,
): Promise<void> {
  const cleanPhone = phone ? phone.replace(/\D/g, '') : null;
  const encoded = encodeURIComponent(message);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return;
  }

  // WhatsApp not installed — open web.whatsapp.com as fallback
  const webUrl = `https://web.whatsapp.com/send?text=${encoded}`;
  const canOpenWeb = await Linking.canOpenURL(webUrl);
  if (canOpenWeb) {
    await Linking.openURL(webUrl);
    return;
  }

  Alert.alert(
    'WhatsApp no disponible',
    'No se pudo abrir WhatsApp. Verifica que esté instalado en tu dispositivo.',
  );
}
