import { PROMO_RATE } from "./promo";

export type PricedLine = { price: number; qty: number };

export type OrderPricing = {
  itemCount: number;
  itemsTotal: number;
  packaging: number;
  /** items + box/packaging */
  subtotal: number;
  discount: number;
  /** subtotal − discount. Delivery is NOT included until its cost is confirmed. */
  total: number;
};

/**
 * subtotal = items + packaging
 * discount = promoEligible ? subtotal × 10 % : 0   (rounded to whole tenge)
 * total    = subtotal − discount
 */
export function calculatePricing(lines: readonly PricedLine[], packaging: number, promoEligible: boolean): OrderPricing {
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  const itemsTotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const subtotal = itemsTotal + packaging;
  const discount = promoEligible && subtotal > 0 ? Math.round(subtotal * PROMO_RATE) : 0;
  return { itemCount, itemsTotal, packaging, subtotal, discount, total: subtotal - discount };
}

/** 12500 → "12 500 ₸", −1250 → "−1 250 ₸" */
export function formatTenge(amount: number): string {
  const abs = Math.abs(Math.round(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${amount < 0 ? "−" : ""}${abs} ₸`;
}
