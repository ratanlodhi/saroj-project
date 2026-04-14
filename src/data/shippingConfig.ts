/** India (domestic): free shipping & insurance by default (0%). */
export const DEFAULT_SHIPPING_INSURANCE_PERCENTAGE = 0;
export const SHIPPING_INSURANCE_STORAGE_KEY = 'shipping_insurance_percentage';
/** Outside India: % of order subtotal for shipping & insurance. */
export const DEFAULT_INTERNATIONAL_SHIPPING_PERCENTAGE = 15;
export const INTERNATIONAL_SHIPPING_STORAGE_KEY = 'international_shipping_percentage';

export function normalizeShippingInsurancePercentage(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_SHIPPING_INSURANCE_PERCENTAGE;
  }

  return Math.min(100, Math.max(0, Number(parsed.toFixed(2))));
}

export const DEFAULT_DOMESTIC_SHIPPING_PERCENTAGE = DEFAULT_SHIPPING_INSURANCE_PERCENTAGE;
export const DOMESTIC_SHIPPING_STORAGE_KEY = SHIPPING_INSURANCE_STORAGE_KEY;
export const normalizeShippingPercentage = normalizeShippingInsurancePercentage;

export function calculateShippingCost(orderTotal: number, shippingPercentage: number): number {
  if (orderTotal <= 0) {
    return 0;
  }

  return Math.round((orderTotal * shippingPercentage) / 100);
}

function normalizeCountryInput(country: string): string {
  return String(country)
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase();
}

/** ISO / common spellings for India (not Indonesia). */
const INDIA_ALIASES = new Set([
  'india',
  'in',
  'ind',
  'भारत',
  'bharat',
  'hindustan',
  'republic of india',
]);

/**
 * True when the delivery country is India (handles codes, Hindi, comma-separated lines, etc.).
 * Empty / unknown is treated as domestic for cart-only pricing before an address exists.
 */
export function isIndiaCountry(country: string | null | undefined): boolean {
  if (country == null || String(country).trim() === '') {
    return true;
  }

  const raw = String(country);
  const n = normalizeCountryInput(raw);

  if (INDIA_ALIASES.has(n)) {
    return true;
  }

  // Parentheses forms: "India (IN)", "(IN)"
  if (/\(\s*in\s*\)/i.test(raw) || /\(\s*ind\s*\)/i.test(raw)) {
    return true;
  }

  const segments = n.split(',').map((s) => s.trim()).filter(Boolean);
  const last = segments[segments.length - 1] ?? n;
  if (INDIA_ALIASES.has(last)) {
    return true;
  }

  // "State, India" — word "india" but not Indonesia
  if (/\bindia\b/i.test(n) && !/\bindonesia\b/i.test(n)) {
    return true;
  }

  return false;
}

/**
 * Shipping & insurance: India is always free (0). Other countries use the international % of subtotal.
 * (Domestic % from settings is not applied to India so misconfigured values cannot charge Indian addresses.)
 */
export function calculateShippingByCountry(
  orderTotal: number,
  country: string | null | undefined,
  _domesticPercentage: number,
  internationalPercentage: number
): number {
  if (orderTotal <= 0) {
    return 0;
  }
  if (isIndiaCountry(country)) {
    return 0;
  }
  return calculateShippingCost(orderTotal, internationalPercentage);
}
