import { WHATSAPP_URL } from "../config";
import { daysBetween, formatKazakhDate, isValidCalendarDate, type CalendarDate } from "./dates";
import { formatTenge, type OrderPricing } from "./pricing";

export type DeliveryMethod = "courier" | "pickup";

export type OrderLine = { name: string; price: number; qty: number };

export type OrderDraft = {
  recipientTitle: string | null;
  size: { title: string; min: number; max: number } | null;
  lines: OrderLine[];
  customerName: string;
  customerPhone: string;
  deliveryDate: CalendarDate | "";
  method: DeliveryMethod;
  district: string;
  street: string;
  receiverName: string;
  receiverPhone: string;
  message: string;
  from: string;
};

export type OrderField = "box" | "customerName" | "customerPhone" | "deliveryDate" | "street" | "receiverPhone";
export type OrderErrors = Partial<Record<OrderField, string>>;

/* ---------------- phone ---------------- */

/**
 * Normalises Kazakhstan numbers to "77XXXXXXXXX" (11 digits).
 * Accepts "8 775 778 59 45", "+7 (775) 778-59-45", "7757785945", "77757785945".
 * Returns null if it is not a valid +7 7XX number.
 */
export function normalizeKzPhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("8")) d = "7" + d.slice(1);
  else if (d.length === 10 && d.startsWith("7")) d = "7" + d;
  return /^77\d{9}$/.test(d) ? d : null;
}

/** "77757785945" → "+7 775 778 5945" */
export function formatKzPhone(normalized: string): string {
  return `+7 ${normalized.slice(1, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
}

/* ---------------- validation ---------------- */

export function validateOrder(d: OrderDraft, today: CalendarDate): OrderErrors {
  const e: OrderErrors = {};
  const count = d.lines.reduce((s, l) => s + l.qty, 0);

  if (!d.size) e.box = "Бокс өлшемін таңда";
  else if (count < d.size.min) e.box = `Боксқа кемінде ${d.size.min} зат қос (қазір ${count})`;
  else if (count > d.size.max) e.box = `Бұл боксқа ең көбі ${d.size.max} зат сияды`;

  if (!d.customerName.trim()) e.customerName = "Атыңды жаз";
  if (!d.customerPhone.trim()) e.customerPhone = "Телефон нөміріңді жаз";
  else if (!normalizeKzPhone(d.customerPhone)) e.customerPhone = "Нөмірді дұрыс жаз: +7 7XX XXX XX XX";

  if (!d.deliveryDate) e.deliveryDate = "Жеткізу күнін таңда";
  else if (!isValidCalendarDate(d.deliveryDate)) e.deliveryDate = "Күн дұрыс емес";
  else if (daysBetween(today, d.deliveryDate) < 0) e.deliveryDate = "Өткен күнді таңдауға болмайды";

  if (d.method === "courier") {
    if (!d.street.trim()) e.street = "Жеткізу мекенжайын жаз";
    if (d.receiverPhone.trim() && !normalizeKzPhone(d.receiverPhone)) e.receiverPhone = "Нөмірді дұрыс жаз: +7 7XX XXX XX XX";
  }
  return e;
}

export const isOrderValid = (errors: OrderErrors) => Object.keys(errors).length === 0;

/* ---------------- WhatsApp message ---------------- */

export const DELIVERY_COST_NOTE = "Жеткізу құны тапсырыс рәсімделгеннен кейін нақтыланады";
export const DELIVERY_DATE_NOTE = "Жеткізу күні мен мүмкіндігі қосымша келісіледі";

/** Plain-text order message in Kazakh. Call only for a valid draft. */
export function buildOrderMessage(d: OrderDraft, p: OrderPricing): string {
  const phone = normalizeKzPhone(d.customerPhone);
  const receiverPhone = normalizeKzPhone(d.receiverPhone);
  const out: string[] = [
    "Сәлеметсіз бе! Дофамин сайтынан жаңа тапсырыс:",
    "",
    `Тапсырыс беруші: ${d.customerName.trim()}`,
    `Телефон: ${phone ? formatKzPhone(phone) : d.customerPhone.trim()}`,
    "",
  ];
  if (d.recipientTitle) out.push(`Кімге: ${d.recipientTitle}`);
  if (d.size) out.push(`Бокс өлшемі: ${d.size.title} (${d.size.min}–${d.size.max} зат)`);
  out.push(`Заттар саны: ${p.itemCount}`, "Құрамы:");
  for (const l of d.lines) out.push(`• ${l.name} × ${l.qty} — ${formatTenge(l.price * l.qty)}`);
  out.push(
    "",
    `Заттар құны: ${formatTenge(p.itemsTotal)}`,
    `Сыйлық орамы: ${formatTenge(p.packaging)}`,
    p.discount > 0 ? `Жеңілдік (10%, 7 күн бұрын тапсырыс): −${formatTenge(p.discount)}` : "Жеңілдік: жоқ",
    `Барлығы (жеткізусіз): ${formatTenge(p.total)}`,
    "",
    `Жеткізу күні: ${d.deliveryDate ? formatKazakhDate(d.deliveryDate) : "—"} (келісу қажет)`,
    `Алу тәсілі: ${d.method === "courier" ? "Курьер" : "Өзім алып кетемін"}`,
  );
  if (d.method === "courier") {
    out.push(`Мекенжай: Алматы, ${d.district} ауданы, ${d.street.trim()}`);
    if (d.receiverName.trim() || receiverPhone)
      out.push(`Алушы: ${[d.receiverName.trim(), receiverPhone ? formatKzPhone(receiverPhone) : ""].filter(Boolean).join(", ")}`);
    out.push("Жеткізу құны: тапсырыс рәсімделгеннен кейін нақтыланады");
  } else {
    out.push("Алу орны мен уақыты WhatsApp арқылы келісіледі");
  }
  if (d.message.trim()) out.push("", `Ашықхат: «${d.message.trim()}»${d.from.trim() ? ` — ${d.from.trim()}` : ""}`);
  return out.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
