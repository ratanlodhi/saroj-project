export const DEFAULT_SHIPPING_INSURANCE_PERCENTAGE = 10;
export const SHIPPING_INSURANCE_STORAGE_KEY = 'shipping_insurance_percentage';

export function normalizeShippingInsurancePercentage(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_SHIPPING_INSURANCE_PERCENTAGE;
  }

  return Math.min(100, Math.max(0, Number(parsed.toFixed(2))));
}

export function calculateShippingCost(orderTotal: number, shippingPercentage: number): number {
  if (orderTotal <= 0) {
    return 0;
  }

  return Math.round((orderTotal * shippingPercentage) / 100);
}
