/**
 * Strips all non-digit characters and normalizes 8 to 7
 */
export function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }
  return digits;
}

/**
 * Validates Russian mobile numbers:
 * Must be exactly 11 digits, start with 7, and the operator code starts with 9
 */
export function isValidRussianPhone(value: string): boolean {
  const digits = normalizePhone(value);
  return /^79\d{9}$/.test(digits);
}

/**
 * Formats user input as: +7 (XXX) XXX-XX-XX
 */
export function formatRussianPhone(value: string): string {
  let digits = value.replace(/\D/g, '');

  if (!digits) return '';

  // Standardize 8 or 7 as the leading Russian country code
  if (digits.startsWith('8') || digits.startsWith('7')) {
    digits = digits.slice(1);
  }

  // Cap at 10 digits (excluding country code +7)
  digits = digits.slice(0, 10);

  let formatted = '+7';

  if (digits.length > 0) {
    formatted += ' (' + digits.slice(0, 3);
  }
  if (digits.length >= 4) {
    formatted += ') ' + digits.slice(3, 6);
  }
  if (digits.length >= 7) {
    formatted += '-' + digits.slice(6, 8);
  }
  if (digits.length >= 9) {
    formatted += '-' + digits.slice(8, 10);
  }

  return formatted;
}