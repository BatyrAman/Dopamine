/**
 * Дофамин — landing. Box builder lives in ./builder/BoxBuilder.tsx (Figma V2 frames).
 * Source: Figma file 36acSalggxTnUvYD5C4Rhv, frame "Dopamine — Landing" (node 3:39).
 * Visual reference: design/figma-reference.png
 * All colors / spacing / radii / fonts come from Figma variables mapped to
 * Tailwind theme tokens in src/index.css (bg-primary, gap-lg, rounded-pill, text-h2 …).
 */
import type { ReactNode } from "react";
import { Button } from "./Button";
import BoxBuilder from "./builder/BoxBuilder";
import { WHATSAPP_PHONE_DISPLAY, WHATSAPP_URL } from "../config";
import { buildWhatsAppUrl } from "../lib/order";

import iconBook from "../assets/figma/icon-book.svg";
import iconCake from "../assets/figma/icon-cake.svg";
import iconSmile from "../assets/figma/icon-smile.svg";
import iconUsers from "../assets/figma/icon-users.svg";
import iconHeart from "../assets/figma/icon-heart.svg";
import iconHand from "../assets/figma/icon-hand.svg";
import iconMail from "../assets/figma/icon-mail.svg";
import iconTruck from "../assets/figma/icon-truck.svg";
import iconQr from "../assets/figma/icon-qr.svg";
import iconGift from "../assets/figma/icon-gift.svg";

/* ------------------------------------------------------------------ */
/* Tokens used as data (Tailwind needs full class names, not strings   */
/* built at runtime, so tone → classes is an explicit map).            */
/* ------------------------------------------------------------------ */

type Tone = "primary" | "violet" | "mint" | "sun" | "sky";

const toneSoft: Record<Tone, string> = {
  primary: "bg-primary-soft",
  violet: "bg-violet-soft",
  mint: "bg-mint-soft",
  sun: "bg-sun-soft",
  sky: "bg-sky-soft",
};
const toneSolid: Record<Tone, string> = {
  primary: "bg-primary",
  violet: "bg-violet",
  mint: "bg-mint",
  sun: "bg-sun",
  sky: "bg-sky",
};

/* ------------------------------------------------------------------ */
/* Data (from the business plan)                                       */
/* ------------------------------------------------------------------ */

const NAV = [
  { label: "Санаттар", href: "#categories" },
  { label: "Қалай жұмыс істейді", href: "#how" },
  { label: "Конструктор", href: "#constructor" },
  { label: "Хит-бокстар", href: "#hits" },
  { label: "Жеткізу", href: "#footer" },
];

const CATEGORIES: { title: string; items: string; price: string; tone: Tone; icon: string }[] = [
  { title: "Жұптарға", items: "Шам, жұп кружка, шоколад, «себебі сен…» карточкалары", price: "7–12 мың ₸", tone: "primary", icon: iconHeart },
  { title: "Ата-анаға", items: "Шай жинағы, термокружка, тәспі, жылы шұлық, бал", price: "8–12 мың ₸", tone: "mint", icon: iconUsers },
  { title: "Бауырларға", items: "Ойын карточкалары, снэк, телефон қабы, брелок", price: "5–9 мың ₸", tone: "sky", icon: iconSmile },
  { title: "Туған күн", items: "Сан-шам, шар, тәтті, косметика миниатюрасы", price: "6–12 мың ₸", tone: "sun", icon: iconCake },
  { title: "Досқа, ұстазға", items: "Блокнот пен қалам, кружка, шоколад", price: "5–8 мың ₸", tone: "violet", icon: iconBook },
];

const STEPS: { n: number; title: string; text: string; tone: Tone }[] = [
  { n: 1, title: "Кімге?", text: "Жұбыңа, ата-анаңа, бауырыңа, туған күнге — санатты таңда.", tone: "primary" },
  { n: 2, title: "Бокс өлшемі", text: "Мини (2–3 зат), Стандарт (4–5 зат) немесе Үлкен (6–7 зат).", tone: "violet" },
  { n: 3, title: "Заттар мен ашықхат", text: "Каталогтан заттарды таңда, ашықхатқа өз сөзіңді жаз. Қалғанын біз істейміз.", tone: "mint" },
];

type SizeId = "mini" | "standard" | "large";
const SIZES: { id: SizeId; title: string; qty: string; price: string; max: number; hit?: boolean }[] = [
  { id: "mini", title: "Мини", qty: "2–3 зат", price: "5 000 ₸-ден", max: 3 },
  { id: "standard", title: "Стандарт", qty: "4–5 зат", price: "~9 000 ₸", max: 5, hit: true },
  { id: "large", title: "Үлкен", qty: "6–7 зат", price: "12 000 ₸-ге дейін", max: 7 },
];

const HITS: { name: string; category: string; text: string; price: string; tone: Tone; lid: Tone }[] = [
  { name: "Махаббат бокс", category: "Жұптарға", text: "Шам, жұп кружка, шоколад, 5 карточка", price: "9 900 ₸", tone: "primary", lid: "sun" },
  { name: "Анама алғыс", category: "Ата-анаға", text: "Шай жинағы, бал, жылы шұлық, термокружка", price: "11 500 ₸", tone: "mint", lid: "violet" },
  { name: "Туған күн хит", category: "Туған күн", text: "Сан-шам, шар, тәтті, косметика миниатюрасы", price: "8 500 ₸", tone: "sun", lid: "primary" },
];

/* ------------------------------------------------------------------ */
/* Primitives (Figma components: Button 4:8, CategoryCard 5:55,        */
/* ItemTile 6:73)                                                      */
/* ------------------------------------------------------------------ */

function IconBubble({ src, bg, size = "size-14", iconSize = "size-[26px]" }: { src: string; bg: string; size?: string; iconSize?: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-md ${bg} ${size}`}>
      <img src={src} alt="" className={iconSize} />
    </div>
  );
}

function SectionHeading({ kicker, title, sub, light = false }: { kicker: string; title: string; sub?: string; light?: boolean }) {
  return (
    <div className="flex flex-col gap-sm">
      <p className={`font-body text-small font-bold uppercase ${light ? "text-sun" : "text-primary"}`}>{kicker}</p>
      <h2 className={`font-display text-[32px] leading-[1.15] font-extrabold md:text-h2 ${light ? "text-on-primary" : "text-ink"}`}>{title}</h2>
      {sub && <p className="max-w-[640px] font-body text-body-lg leading-[1.5] text-ink-muted">{sub}</p>}
    </div>
  );
}

export function CategoryCard({ title, items, price, tone, icon }: (typeof CATEGORIES)[number]) {
  return (
    <a
      href="#constructor"
      className={`flex flex-col gap-md rounded-lg p-lg transition hover:-translate-y-1 ${toneSoft[tone]}`}
    >
      <IconBubble src={icon} bg="bg-surface" />
      <h3 className="font-display text-h3 leading-[1.15] font-extrabold text-ink">{title}</h3>
      <p className="font-body text-small leading-[1.45] text-ink-muted">{items}</p>
      <span className="mt-auto self-start rounded-pill bg-surface px-sm py-[6px] font-body text-small font-bold text-ink">{price}</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#" className="flex items-center gap-sm">
      <span className="flex size-11 items-center justify-center rounded-sm bg-primary font-display text-[22px] font-extrabold text-on-primary">Д</span>
      <span className={`font-display text-[22px] font-extrabold ${light ? "text-on-primary" : "text-ink"}`}>Дофамин</span>
    </a>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-border bg-surface px-md py-md lg:px-page-x">
      <Logo />
      <nav className="hidden items-center gap-lg font-body text-body font-medium text-ink xl:flex">
        {NAV.map((n) => (
          <a key={n.href} href={n.href} className="hover:text-primary">
            {n.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-sm">
        <span className="hidden sm:contents">
          <Button variant="Secondary" href={WHATSAPP_URL}>
            WhatsApp
          </Button>
        </span>
        <Button href="#constructor">Бокс жинау</Button>
      </div>
    </header>
  );
}

/** Hero illustration — shapes positioned in the 560×520 Figma frame, expressed in % so it scales. */
function HeroVisual() {
  const box = (x: number, y: number, w: number, h: number) => ({
    left: `${(x / 560) * 100}%`,
    top: `${(y / 520) * 100}%`,
    width: `${(w / 560) * 100}%`,
    height: `${(h / 520) * 100}%`,
  });
  const stickers: { label: string; x: number; y: number; dot: string }[] = [
    { label: "Жұбыңа", x: 40, y: 60, dot: "bg-primary" },
    { label: "Ата-анаға", x: 360, y: 150, dot: "bg-mint" },
    { label: "Туған күн", x: 30, y: 200, dot: "bg-sun" },
    { label: "Қазақша ашықхат", x: 330, y: 440, dot: "bg-violet" },
  ];
  return (
    <div className="relative aspect-[560/520] w-full max-w-[560px] shrink-0 overflow-hidden rounded-lg bg-primary-soft">
      <div className="absolute rounded-full bg-sun/50" style={box(-80, 320, 300, 300)} />
      <div className="absolute rounded-full bg-violet/25" style={box(400, -60, 240, 240)} />
      {/* gift box */}
      <div className="absolute rounded-[18px] bg-primary" style={box(150, 230, 260, 200)} />
      <div className="absolute rounded-[16px] bg-violet" style={box(130, 190, 300, 64)} />
      <div className="absolute bg-sun" style={box(265, 190, 30, 240)} />
      <div className="absolute bg-sun" style={box(150, 320, 260, 26)} />
      <div className="absolute rounded-full bg-sun" style={box(218, 140, 64, 64)} />
      <div className="absolute rounded-full bg-sun" style={box(278, 140, 64, 64)} />
      <div className="absolute rounded-full bg-primary" style={box(262, 170, 36, 36)} />
      {stickers.map((s) => (
        <span
          key={s.label}
          className="absolute flex items-center gap-xs rounded-pill bg-surface px-md py-sm font-body text-small font-semibold whitespace-nowrap text-ink shadow-[0_8px_24px_rgba(31,18,53,0.10)]"
          style={{ left: `${(s.x / 560) * 100}%`, top: `${(s.y / 520) * 100}%` }}
        >
          <span className={`size-3 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function Hero() {
  const title = "Өзің таңдап жинайтын";
  return (
    <section className="flex w-full flex-col items-center gap-2xl px-md py-2xl lg:flex-row lg:px-page-x lg:py-3xl">
      <div className="flex min-w-0 flex-1 flex-col gap-lg">
        <span className="inline-flex items-center gap-xs self-start rounded-pill bg-sun-soft px-md py-xs font-body text-small font-semibold text-ink">
          <span className="size-2 rounded-full bg-primary" />
          Алматы · Жаңа жылға 5 апта қалды
        </span>
        <h1 className="max-w-[620px] font-display text-[40px] leading-[1.1] font-extrabold text-ink sm:text-display">
          {title} <span className="text-primary">сыйлық бокс</span>
        </h1>
        <p className="max-w-[540px] font-body text-body-lg leading-[1.5] text-ink-muted">
          Жұбыңа, ата-анаңа, бауырыңа — бәріне! Заттарды өзің таңда, біз әдемілеп орап, Алматы бойынша жеткіземіз.
        </p>
        <div className="flex flex-wrap gap-sm">
          <Button href="#constructor">Бокс жинау →</Button>
          <Button variant="Secondary" href="#hits">
            Дайын хит-бокстар
          </Button>
        </div>
        <dl className="flex flex-wrap gap-x-2xl gap-y-md pt-md">
          {[
            ["5–12 мың ₸", "бір бокстың бағасы"],
            ["20–30 мин", "бір бокс жинау"],
            ["−10%", "жеткізуден 7 күн бұрын тапсырыс берсең"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col gap-1">
              <dt className="order-2 font-body text-small text-ink-muted">{l}</dt>
              <dd className="order-1 font-display text-h3 font-bold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <HeroVisual />
    </section>
  );
}

function Benefits() {
  const list: { icon: string; bg: string; title: string; text: string }[] = [
    { icon: iconHand, bg: "bg-primary-soft", title: "Өзің таңдайсың", text: "Каталогтан кез келген зат" },
    { icon: iconMail, bg: "bg-violet-soft", title: "Қазақша ашықхат", text: "Жылы сөзіңді біз жазамыз" },
    { icon: iconTruck, bg: "bg-mint-soft", title: "Алматы бойынша", text: "Курьер немесе өзің алып кету" },
    { icon: iconQr, bg: "bg-sun-soft", title: "Kaspi QR", text: "Аударым немесе QR арқылы" },
  ];
  return (
    <section className="w-full px-md lg:px-page-x">
      <ul className="grid grid-cols-1 gap-lg rounded-lg border border-border bg-surface px-xl py-lg sm:grid-cols-2 xl:flex xl:justify-between">
        {list.map((b) => (
          <li key={b.title} className="flex items-center gap-md">
            <IconBubble src={b.icon} bg={b.bg} size="size-12" iconSize="size-[22px]" />
            <div className="flex flex-col gap-[2px]">
              <p className="font-body text-body font-bold text-ink">{b.title}</p>
              <p className="font-body text-small text-ink-muted">{b.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Categories() {
  return (
    <section id="categories" className="flex w-full scroll-mt-24 flex-col gap-2xl px-md py-2xl lg:px-page-x lg:py-3xl">
      <SectionHeading
        kicker="01 · Санаттар"
        title="Кімге сыйлық жинаймыз?"
        sub="Әр санаттың өз кейіпкері мен стилі бар. Санатты таңда — қалғанын бірге жинаймыз."
      />
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.title} {...c} />
        ))}
      </div>
      <p className="inline-flex items-center gap-xs self-start rounded-pill border border-border bg-surface px-lg py-sm font-body text-body font-medium text-ink">
        <img src={iconGift} alt="" className="size-[18px]" />
        Уақытың жоқ па? Әр санатта 1–2 дайын хит-бокс бар
      </p>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="flex w-full scroll-mt-24 flex-col gap-2xl bg-surface px-md py-2xl lg:px-page-x lg:py-3xl">
      <SectionHeading kicker="02 · Қалай жұмыс істейді" title="3 қадам — және бокс дайын" />
      <ol className="grid grid-cols-1 gap-lg md:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex flex-col gap-md rounded-lg bg-bg p-xl">
            <span className={`flex size-12 items-center justify-center rounded-pill font-display text-[20px] font-extrabold text-on-primary ${toneSolid[s.tone]}`}>
              {s.n}
            </span>
            <p className="font-body text-small font-semibold text-ink-muted">{s.n}-қадам</p>
            <h3 className="font-display text-h3 font-extrabold text-ink">{s.title}</h3>
            <p className="font-body text-body leading-[1.5] text-ink-muted">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
        {SIZES.map((s) => (
          <div key={s.id} className={`flex items-center justify-between rounded-lg px-xl py-lg ${s.hit ? "bg-ink" : "bg-bg"}`}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-xs">
                <h3 className={`font-display text-h3 font-extrabold ${s.hit ? "text-on-primary" : "text-ink"}`}>{s.title}</h3>
                {s.hit && <span className="rounded-pill bg-sun px-xs py-1 font-body text-[12px] font-bold text-ink">Хит</span>}
              </div>
              <p className={`font-body text-body ${s.hit ? "text-border" : "text-ink-muted"}`}>{s.qty}</p>
            </div>
            <p className={`font-body text-body-lg font-bold ${s.hit ? "text-sun" : "text-primary"}`}>{s.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HitBoxes() {
  return (
    <section id="hits" className="flex w-full scroll-mt-24 flex-col gap-2xl bg-surface px-md py-2xl lg:px-page-x lg:py-3xl">
      <div className="flex flex-wrap items-end justify-between gap-lg">
        <SectionHeading kicker="04 · Хит-бокстар" title="Уақытың жоқ па? Дайынын ал" />
        <Button variant="Secondary" href="#hits">
          Барлық бокстар
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
        {HITS.map((h) => (
          <article key={h.name} className="flex flex-col gap-md rounded-lg bg-bg p-sm">
            <div className={`relative h-[240px] w-full overflow-hidden rounded-md ${toneSoft[h.tone]}`}>
              {/* box illustration, centered — 150×120 body, 174×40 lid, 26px ribbon */}
              <div className="absolute top-[90px] left-1/2 h-[120px] w-[150px] -translate-x-1/2 rounded-[14px]">
                <div className={`size-full rounded-[14px] ${toneSolid[h.tone]}`} />
              </div>
              <div className={`absolute top-[66px] left-1/2 h-10 w-[174px] -translate-x-1/2 rounded-[12px] ${toneSolid[h.lid]}`} />
              <div className="absolute top-[66px] left-1/2 h-[144px] w-[26px] -translate-x-1/2 bg-surface" />
              <span className="absolute top-md left-md rounded-pill bg-surface px-sm py-1 font-body text-[12px] font-semibold text-ink">{h.category}</span>
            </div>
            <div className="flex flex-col gap-xs px-sm">
              <h3 className="font-display text-h3 font-extrabold text-ink">{h.name}</h3>
              <p className="font-body text-body leading-[1.45] text-ink-muted">{h.text}</p>
            </div>
            <div className="mt-auto flex items-center justify-between px-sm pb-sm">
              <span className="font-display text-h3 font-extrabold text-primary">{h.price}</span>
              <Button variant="Dark" href={buildWhatsAppUrl(`Сәлеметсіз бе! «${h.name}» хит-боксына тапсырыс бергім келеді.`)}>
                Тапсырыс
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Promo() {
  return (
    <section className="w-full px-md py-2xl lg:px-page-x lg:py-3xl">
      <div className="flex flex-col items-center gap-2xl overflow-hidden rounded-lg bg-violet p-xl md:flex-row md:p-2xl">
        <div className="flex flex-1 flex-col gap-md">
          <p className="font-body text-small font-bold text-sun uppercase">Жаңа жыл · 14 ақпан · 8 наурыз · Наурыз</p>
          <h2 className="max-w-[640px] font-display text-[32px] leading-[1.15] font-extrabold text-on-primary md:text-h2">
            Жеткізу күнінен 7 күн бұрын тапсырыс бер — −10%
          </h2>
          <p className="max-w-[600px] font-body text-body-lg leading-[1.5] text-on-primary">
            Әр бокста QR және «келесі тапсырысқа 500 ₸» карточкасы. Мереке күндеріңді жазып аламыз — алдын ала еске саламыз.
          </p>
          <div>
            <Button variant="Secondary" href="#constructor">
              Бокс жинау
            </Button>
          </div>
        </div>
        <div className="flex size-[220px] shrink-0 -rotate-8 flex-col items-center justify-center rounded-pill bg-sun">
          <span className="font-display text-[56px] font-extrabold text-ink">−10%</span>
          <span className="font-body text-body font-semibold text-ink">7 күн бұрын</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols: { title: string; links: string[] }[] = [
    { title: "Сатып алу", links: ["Санаттар", "Конструктор", "Хит-бокстар", "Корпоративтік бокс"] },
    { title: "Ақпарат", links: ["Жеткізу және төлем", "Қайтару", "Жиі қойылатын сұрақтар"] },
    { title: "Байланыс", links: [`WhatsApp: ${WHATSAPP_PHONE_DISPLAY}`, "Instagram · TikTok · Threads", "Алматы"] },
  ];
  return (
    <footer id="footer" className="flex w-full flex-col gap-2xl bg-ink px-md py-2xl lg:px-page-x lg:py-3xl">
      <div className="flex flex-col justify-between gap-2xl md:flex-row">
        <div className="flex flex-col gap-md">
          <Logo light />
          <p className="max-w-[320px] font-body text-body leading-[1.5] text-border">Дофамин — сыйлық берген адамға да қуаныш</p>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="flex flex-col gap-sm">
            <p className="font-body text-body font-bold text-on-primary">{c.title}</p>
            {c.links.map((l) => (
              <a key={l} href={l.startsWith("WhatsApp") ? WHATSAPP_URL : "#"} className="font-body text-body text-border hover:text-on-primary">
                {l}
              </a>
            ))}
          </div>
        ))}
      </div>
      <hr className="border-on-primary/15" />
      <div className="flex flex-wrap justify-between gap-sm font-body text-small text-border">
        <span>© 2026 Дофамин. Алматы</span>
        <span>Kaspi QR · Kaspi Pay · аударым</span>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

export default function DopamineLanding() {
  return (
    <div className="flex min-h-screen w-full flex-col items-stretch bg-bg font-body text-ink">
      <Header />
      <main className="flex flex-col">
        <Hero />
        <Benefits />
        <Categories />
        <HowItWorks />
        <BoxBuilder />
        <HitBoxes />
        <Promo />
      </main>
      <Footer />
    </div>
  );
}
