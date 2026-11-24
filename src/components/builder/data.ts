/**
 * Box builder data & pricing rules.
 * Figures come from the business plan (Дофамин — сыйлық бокс бизнес-жоспары).
 * Anything marked TODO must be confirmed before launch.
 */

export type Tone = "primary" | "violet" | "mint" | "sun" | "sky";

export type RecipientId = "couple" | "parents" | "siblings" | "birthday" | "friend";
export const RECIPIENTS: { id: RecipientId; title: string; hint: string; tone: Tone }[] = [
  { id: "couple", title: "Жұптарға", hint: "7–12 мың ₸", tone: "primary" },
  { id: "parents", title: "Ата-анаға", hint: "8–12 мың ₸", tone: "mint" },
  { id: "siblings", title: "Бауырларға", hint: "5–9 мың ₸", tone: "sky" },
  { id: "birthday", title: "Туған күн", hint: "6–12 мың ₸", tone: "sun" },
  { id: "friend", title: "Досқа, ұстазға", hint: "5–8 мың ₸", tone: "violet" },
];

export type SizeId = "mini" | "standard" | "large";
/** min = items required to continue, max = box capacity. Packaging price per box size. */
export const SIZES: { id: SizeId; title: string; min: number; max: number; packaging: number; packagingNote: string }[] = [
  // TODO: confirm packaging cost for Мини / Үлкен (plan only gives 1 200 ₸ for Стандарт)
  { id: "mini", title: "Мини", min: 2, max: 3, packaging: 900, packagingNote: "Шағын қорап, толтырғыш, лента, ашықхат" },
  { id: "standard", title: "Стандарт", min: 4, max: 5, packaging: 1200, packagingNote: "Орта қорап, толтырғыш, лента, ашықхат" },
  { id: "large", title: "Үлкен", min: 6, max: 7, packaging: 1500, packagingNote: "Үлкен қорап, толтырғыш, лента, ашықхат" },
];

export type Filter = "Барлығы" | "Тәтті" | "Кружкалар" | "Шамдар" | "Жылы заттар" | "Ойындар";
export const FILTERS: Filter[] = ["Барлығы", "Тәтті", "Кружкалар", "Шамдар", "Жылы заттар", "Ойындар"];

export type Item = { id: string; name: string; price: number; tone: Tone; tags: Filter[] };
export const ITEMS: Item[] = [
  { id: "candle", name: "Хош иісті шам", price: 2500, tone: "primary", tags: ["Шамдар"] },
  { id: "mugs", name: "Жұп кружка", price: 3000, tone: "violet", tags: ["Кружкалар"] },
  { id: "choco", name: "Шоколад", price: 1200, tone: "sun", tags: ["Тәтті"] },
  { id: "cards", name: "«Себебі сен…» карточкалары", price: 1500, tone: "primary", tags: ["Ойындар"] },
  { id: "tea", name: "Шай жинағы", price: 2000, tone: "mint", tags: ["Тәтті"] },
  { id: "socks", name: "Жылы шұлық", price: 1500, tone: "sky", tags: ["Жылы заттар"] },
  { id: "honey", name: "Табиғи бал", price: 2200, tone: "sun", tags: ["Тәтті"] },
  { id: "keychain", name: "Брелок", price: 800, tone: "violet", tags: ["Ойындар"] },
];

/** Pre-order campaign from the marketing plan (2 weeks before a holiday). Applies to items only. */
export const PROMO = { active: true, label: "Алдын ала тапсырыс −10%", rate: 0.1 };

/** Share paid upfront (plan: «кемі 50%»). */
export const PREPAY_SHARE = 0.5;

export type DeliveryMethod = "courier" | "pickup";
export type DeliveryQuote = { price: number; window: string; provider: string };

export const DISTRICTS = ["Алмалы", "Әуезов", "Бостандық", "Жетісу", "Медеу", "Наурызбай", "Түрксіб", "Алатау"] as const;
export type District = (typeof DISTRICTS)[number];

/**
 * TODO: DEMO estimates only — replace with a real Yandex Go / inDrive quote.
 * Kept inside the plan's range (~1 500–2 500 ₸, paid by the client).
 */
const DEMO_COURIER_ESTIMATE: Record<District, number> = {
  Алмалы: 1500,
  Әуезов: 1700,
  Бостандық: 1600,
  Жетісу: 1800,
  Медеу: 1900,
  Наурызбай: 2500,
  Түрксіб: 2100,
  Алатау: 2400,
};

/**
 * Courier price depends on the address, so the UI never shows a price
 * until this resolves; before that it says «Мекенжай бойынша есептеледі».
 */
export async function quoteCourierDelivery(district: District, street: string): Promise<DeliveryQuote | null> {
  if (!street.trim()) return null;
  await new Promise((r) => setTimeout(r, 400)); // simulate network
  return { price: DEMO_COURIER_ESTIMATE[district], window: "Ертең · 18:00–21:00", provider: "Курьер · Yandex Go" };
}

export const PICKUP: DeliveryQuote = { price: 0, window: "Ертең 12:00-ден бастап", provider: "Өзім алып кетемін" };

export const formatTenge = (n: number) => `${n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("ru-RU").replace(/ /g, " ")} ₸`;

export const toneSoft: Record<Tone, string> = {
  primary: "bg-primary-soft",
  violet: "bg-violet-soft",
  mint: "bg-mint-soft",
  sun: "bg-sun-soft",
  sky: "bg-sky-soft",
};
export const toneSolid: Record<Tone, string> = {
  primary: "bg-primary",
  violet: "bg-violet",
  mint: "bg-mint",
  sun: "bg-sun",
  sky: "bg-sky",
};
