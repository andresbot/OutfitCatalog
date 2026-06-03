const PHONE_REGEX = /^\+?\d{10,15}$/;

export function validatePhone(raw: string): string | null {
  const cleaned = raw.replace(/\s/g, '');
  if (!cleaned) return null;
  return PHONE_REGEX.test(cleaned)
    ? null
    : 'Número inválido. Incluye código de país. Ej: 573001234567 o +573001234567';
}

export function cleanPhone(raw: string): string {
  return raw.replace(/\s/g, '');
}
