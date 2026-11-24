import { describe, expect, it } from "vitest";
import { buildOrderMessage, buildWhatsAppUrl, formatKzPhone, isOrderValid, normalizeKzPhone, validateOrder, type OrderDraft } from "./order";
import { calculatePricing, formatTenge } from "./pricing";

const base: OrderDraft = {
  recipientTitle: "Жұптарға",
  size: { title: "Үлкен", min: 6, max: 7 },
  lines: [
    { name: "Хош иісті шам", price: 2500, qty: 1 },
    { name: "Шоколад", price: 1200, qty: 2 },
    { name: "Жұп кружка", price: 3000, qty: 1 },
    { name: "Табиғи бал", price: 2200, qty: 2 },
  ],
  customerName: "Айдана",
  customerPhone: "8 775 778 59 45",
  deliveryDate: "2026-12-20",
  method: "courier",
  district: "Бостандық",
  street: "Абай даңғылы 150, 24-пәтер",
  receiverName: "",
  receiverPhone: "",
  message: "Жаным, Жаңа жылың құтты болсын!",
  from: "Айдана",
};

describe("calculatePricing", () => {
  it("no promo: total = items + packaging, delivery never included", () => {
    const p = calculatePricing([{ price: 2500, qty: 2 }, { price: 1000, qty: 1 }], 1500, false);
    expect(p).toEqual({ itemCount: 3, itemsTotal: 6000, packaging: 1500, subtotal: 7500, discount: 0, total: 7500 });
  });
  it("promo: 10% of subtotal, rounded to whole tenge", () => {
    const p = calculatePricing([{ price: 1205, qty: 1 }], 0, true);
    expect(p.discount).toBe(121);
    expect(p.total).toBe(1084);
  });
  it("empty cart has no discount", () => {
    expect(calculatePricing([], 0, true).discount).toBe(0);
  });
  it("formats KZT", () => {
    expect(formatTenge(13540)).toBe("13 540 ₸");
    expect(formatTenge(-1310)).toBe("−1 310 ₸");
    expect(formatTenge(0)).toBe("0 ₸");
  });
});

describe("phone", () => {
  it.each([
    ["87757785945", "77757785945"],
    ["+7 (775) 778-59-45", "77757785945"],
    ["7757785945", "77757785945"],
    ["8 775 778 59 45", "77757785945"],
  ])("normalizes %s", (input, out) => expect(normalizeKzPhone(input)).toBe(out));
  it.each(["", "12345", "+1 202 555 0100", "86757785945"])("rejects %s", (input) => expect(normalizeKzPhone(input)).toBeNull());
  it("formats", () => expect(formatKzPhone("77757785945")).toBe("+7 775 778 5945"));
});

describe("validateOrder", () => {
  const today = "2026-12-10";
  it("valid courier order", () => {
    expect(validateOrder(base, today)).toEqual({});
  });
  it("pickup does not require an address", () => {
    expect(validateOrder({ ...base, method: "pickup", street: "" }, today)).toEqual({});
  });
  it("courier requires an address", () => {
    expect(validateOrder({ ...base, street: "  " }, today).street).toBeDefined();
  });
  it("flags missing contact, date and too few items", () => {
    const e = validateOrder({ ...base, customerName: "", customerPhone: "123", deliveryDate: "", lines: base.lines.slice(0, 1) }, today);
    expect(Object.keys(e).sort()).toEqual(["box", "customerName", "customerPhone", "deliveryDate"]);
    expect(isOrderValid(e)).toBe(false);
  });
  it("rejects past delivery dates but allows today", () => {
    expect(validateOrder({ ...base, deliveryDate: "2026-12-09" }, today).deliveryDate).toBeDefined();
    expect(validateOrder({ ...base, deliveryDate: "2026-12-10" }, today).deliveryDate).toBeUndefined();
  });
  it("rejects a missing box size", () => {
    expect(validateOrder({ ...base, size: null }, today).box).toBeDefined();
  });
});

describe("WhatsApp message", () => {
  const pricing = calculatePricing(base.lines, 1500, true);
  const msg = buildOrderMessage(base, pricing);

  it("contains all required order details", () => {
    for (const part of [
      "Тапсырыс беруші: Айдана",
      "Телефон: +7 775 778 5945",
      "Бокс өлшемі: Үлкен (6–7 зат)",
      "Заттар саны: 6",
      "• Шоколад × 2 — 2 400 ₸",
      "Заттар құны: 12 300 ₸",
      "Сыйлық орамы: 1 500 ₸",
      "Жеңілдік (10%, 7 күн бұрын тапсырыс): −1 380 ₸",
      "Барлығы (жеткізусіз): 12 420 ₸",
      "Жеткізу күні: 20 желтоқсан 2026 (келісу қажет)",
      "Алу тәсілі: Курьер",
      "Мекенжай: Алматы, Бостандық ауданы, Абай даңғылы 150, 24-пәтер",
      "Жеткізу құны: тапсырыс рәсімделгеннен кейін нақтыланады",
      "Ашықхат: «Жаным, Жаңа жылың құтты болсын!» — Айдана",
    ])
      expect(msg).toContain(part);
  });
  it("does not invent a delivery price", () => {
    expect(msg).not.toMatch(/Жеткізу құны: \d/);
  });
  it("pickup message has no address and says no discount when not eligible", () => {
    const m = buildOrderMessage({ ...base, method: "pickup" }, calculatePricing(base.lines, 1500, false));
    expect(m).toContain("Алу тәсілі: Өзім алып кетемін");
    expect(m).not.toContain("Мекенжай:");
    expect(m).toContain("Жеңілдік: жоқ");
  });
  it("URL uses the business number and round-trips through encoding", () => {
    const url = buildWhatsAppUrl(msg);
    expect(url.startsWith("https://wa.me/77757785945?text=")).toBe(true);
    expect(url).not.toMatch(/[\s«»₸]/);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(msg);
  });
});
