import { daysBetween, isValidCalendarDate, type CalendarDate } from "./dates";

/** Early-order promo: 10 % off when the order is placed at least 7 calendar days before delivery. */
export const PROMO_RATE = 0.1;
export const PROMO_MIN_DAYS_AHEAD = 7;

export const PROMO_TEXT = {
  label: "Ерте тапсырыс жеңілдігі −10%",
  eligible: "Сіз 10% жеңілдікке ие болдыңыз!",
  notEligible: "10% жеңілдік алу үшін тапсырысты жеткізу күнінен кемінде 7 күн бұрын рәсімдеңіз",
} as const;

/**
 * True when `deliveryDate` is at least PROMO_MIN_DAYS_AHEAD calendar days after `orderDate`.
 * Both are "YYYY-MM-DD" calendar dates (order date = today in Almaty).
 * Missing / invalid dates are never eligible.
 */
export function isPromoEligible(orderDate: CalendarDate | null | undefined, deliveryDate: CalendarDate | null | undefined): boolean {
  if (!orderDate || !deliveryDate) return false;
  if (!isValidCalendarDate(orderDate) || !isValidCalendarDate(deliveryDate)) return false;
  return daysBetween(orderDate, deliveryDate) >= PROMO_MIN_DAYS_AHEAD;
}
