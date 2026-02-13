export function sanitizePhoneNumber(input: string): string {
  return (input || '').replace(/[^\d]/g, '');
}

export function buildChatLink(phoneNumber: string, message: string): string {
  const phone = sanitizePhoneNumber(phoneNumber);
  if (!phone) return '';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

