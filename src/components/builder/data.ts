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

/** Share paid upfront (plan: «кемі 50%»). */
export const PREPAY_SHARE = 0.5;

/** Almaty districts — used only to structure the courier address (no prices attached). */
export const DISTRICTS = ["Алмалы", "Әуезов", "Бостандық", "Жетісу", "Медеу", "Наурызбай", "Түрксіб", "Алатау"] as const;
export type District = (typeof DISTRICTS)[number];

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
