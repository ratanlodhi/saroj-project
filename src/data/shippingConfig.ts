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

/** True when country is India (common spellings / codes). Unknown/empty treated as domestic for cart pricing. */
export function isIndiaCountry(country: string | null | undefined): boolean {
  if (country == null || String(country).trim() === '') {
    return true;
  }
  const c = String(country).trim().toLowerCase();
  return c === 'india' || c === 'in' || c === 'भारत';
}

/**
 * Shipping & insurance: India = domestic % (default 0 = free); any other country = international % (default 15).
 */
export function calculateShippingByCountry(
  orderTotal: number,
  country: string | null | undefined,
  domesticPercentage: number,
  internationalPercentage: number
): number {
  if (orderTotal <= 0) {
    return 0;
  }
  const pct = isIndiaCountry(country) ? domesticPercentage : internationalPercentage;
  return calculateShippingCost(orderTotal, pct);
}
