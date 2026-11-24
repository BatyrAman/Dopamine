/**
 * Box builder V2 — Figma frames:
 *   "V2 · Desktop · Box Builder", "V2 · Desktop · Review & Checkout",
 *   "V2 · Mobile · Box Builder", "V2 · Mobile · Bottom sheet", "V2 · Mobile · Review & Checkout".
 * Flow: Кімге → Өлшем → Заттар → Ашықхат → Тексеру.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "../Button";
import { Icon } from "./Icons";
import {
  DISTRICTS,
  FILTERS,
  ITEMS,
  PICKUP,
  PREPAY_SHARE,
  PROMO,
  RECIPIENTS,
  SIZES,
  formatTenge,
  quoteCourierDelivery,
  toneSoft,
  toneSolid,
  type DeliveryMethod,
  type DeliveryQuote,
  type District,
  type Filter,
  type Item,
  type RecipientId,
  type SizeId,
  type Tone,
} from "./data";

const STEPS = ["Кімге", "Өлшем", "Заттар", "Ашықхат", "Тексеру"] as const;
const MESSAGE_LIMIT = 200;
const WHATSAPP_NUMBER = ""; // TODO: business WhatsApp number, e.g. "77000000000"

type Cart = Record<string, number>;

/* ------------------------------------------------------------------ */
/* State                                                              */
/* ------------------------------------------------------------------ */

function useBuilder() {
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState<RecipientId | null>(null);
  const [sizeId, setSizeId] = useState<SizeId | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [method, setMethod] = useState<DeliveryMethod>("courier");
  const [district, setDistrict] = useState<District>("Бостандық");
  const [street, setStreet] = useState("");
  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [quoting, setQuoting] = useState(false);

  const size = SIZES.find((s) => s.id === sizeId) ?? null;
  const lines = ITEMS.filter((i) => cart[i.id]).map((i) => ({ item: i, qty: cart[i.id] }));
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const itemsTotal = lines.reduce((s, l) => s + l.qty * l.item.price, 0);
  const packaging = size?.packaging ?? 0;
  const discount = PROMO.active ? Math.round(itemsTotal * PROMO.rate) : 0;
  const delivery: DeliveryQuote | null = method === "pickup" ? PICKUP : quote;
  const total = itemsTotal + packaging - discount + (delivery?.price ?? 0);

  // Courier price is quoted only after an address is entered.
  useEffect(() => {
    if (method !== "courier") return;
    setQuote(null);
    if (!street.trim()) return;
    let alive = true;
    setQuoting(true);
    const t = setTimeout(async () => {
      const q = await quoteCourierDelivery(district, street);
      if (alive) {
        setQuote(q);
        setQuoting(false);
      }
    }, 500);
    return () => {
      alive = false;
      clearTimeout(t);
      setQuoting(false);
    };
  }, [method, district, street]);

  const max = size?.max ?? 0;
  const min = size?.min ?? 0;

  const add = (id: string) => setCart((c) => (count >= max ? c : { ...c, [id]: (c[id] ?? 0) + 1 }));
  const dec = (id: string) =>
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });
  const remove = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });

  const chooseSize = (id: SizeId) => {
    setSizeId(id);
    const cap = SIZES.find((s) => s.id === id)!.max;
    // trim the cart if the new box is smaller
    setCart((c) => {
      let left = cap;
      const next: Cart = {};
      for (const i of ITEMS) {
        const q = Math.min(c[i.id] ?? 0, left);
        if (q > 0) {
          next[i.id] = q;
          left -= q;
        }
      }
      return next;
    });
  };

  const valid = [
    recipient !== null,
    size !== null,
    size !== null && count >= min,
    true, // postcard text is optional
    delivery !== null && (method === "pickup" || (street.trim() !== "" && receiver.trim() !== "" && phone.trim() !== "")),
  ];
  const canOpen = (i: number) => valid.slice(0, i).every(Boolean);

  return {
    step, setStep, recipient, setRecipient, size, chooseSize, cart, lines, count, min, max,
    add, dec, remove, message, setMessage, from, setFrom,
    method, setMethod, district, setDistrict, street, setStreet, receiver, setReceiver, phone, setPhone,
    quote, quoting, delivery, itemsTotal, packaging, discount, total, valid, canOpen,
  };
}
type B = ReturnType<typeof useBuilder>;

/* ------------------------------------------------------------------ */
/* Small pieces (Figma: QtyControl, BoxSlot, SummaryItem, PriceRow)   */
/* ------------------------------------------------------------------ */

function Thumb({ tone, size = "size-12", dot = "size-6" }: { tone: Tone; size?: string; dot?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-sm ${toneSoft[tone]} ${size}`}>
      <span className={`rounded-full ${toneSolid[tone]} ${dot}`} />
    </span>
  );
}

function QtyControl({ qty, onDec, onInc, canInc, label, wide = false }: { qty: number; onDec: () => void; onInc: () => void; canInc: boolean; label: string; wide?: boolean }) {
  return (
    <div className={`flex items-center gap-xs rounded-pill bg-primary-soft p-1 ${wide ? "w-full justify-between" : ""}`}>
      <button type="button" onClick={onDec} aria-label={`${label}: азайту`} className="flex size-8 items-center justify-center rounded-pill bg-surface text-primary hover:bg-bg">
        <Icon name="minus" className="size-4" />
      </button>
      <span className="w-7 text-center font-body text-body font-bold text-ink" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={onInc}
        disabled={!canInc}
        aria-label={`${label}: көбейту`}
        className="flex size-8 items-center justify-center rounded-pill bg-primary text-on-primary hover:brightness-95 disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-muted"
      >
        <Icon name="plus" className="size-4" />
      </button>
    </div>
  );
}

function Slots({ b, small = false }: { b: B; small?: boolean }) {
  const units: Item[] = b.lines.flatMap((l) => Array<Item>(l.qty).fill(l.item));
  const dim = small ? "size-12" : "size-16";
  return (
    <ul className="flex flex-wrap gap-xs sm:gap-sm" aria-label={`${b.count} / ${b.max} зат`}>
      {Array.from({ length: b.max }, (_, i) => {
        const it = units[i];
        if (it)
          return (
            <li key={i} className={`flex items-center justify-center rounded-sm ${toneSoft[it.tone]} ${dim}`} title={it.name}>
              <span className={`rounded-full ${toneSolid[it.tone]} ${small ? "size-6" : "size-8"}`} />
            </li>
          );
        const required = i < b.min;
        return (
          <li
            key={i}
            className={`flex items-center justify-center rounded-sm border-[1.5px] border-dashed bg-surface ${dim} ${required ? "border-ink-muted text-ink-muted" : "border-border text-border"}`}
            title={required ? "Міндетті орын" : "Қосымша орын"}
          >
            <Icon name="plus" className="size-4" />
          </li>
        );
      })}
    </ul>
  );
}

function Progress({ b }: { b: B }) {
  const left = Math.max(b.min - b.count, 0);
  const pct = b.max ? Math.min((b.count / b.min) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-xs">
      <div className="flex justify-between gap-sm font-body text-small sm:text-body">
        <span className="font-bold text-ink">
          {b.count} / {b.min} зат таңдалды
        </span>
        <span className={`font-semibold ${left ? "text-primary" : "text-mint"}`}>
          {left ? `тағы ${left} зат қос` : b.count < b.max ? `дайын · тағы ${b.max - b.count} қосуға болады` : "бокс толы"}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-pill bg-bg" role="progressbar" aria-valuemin={0} aria-valuemax={b.min} aria-valuenow={b.count}>
        <div className={`h-full rounded-pill transition-all ${left ? "bg-primary" : "bg-mint"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PriceRow({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "discount" | "pending" }) {
  return (
    <div className="flex items-center justify-between gap-sm font-body">
      <span className="text-body text-ink-muted">{label}</span>
      <span className={tone === "discount" ? "text-body font-semibold text-mint" : tone === "pending" ? "text-right text-small font-medium text-ink-muted" : "text-body font-semibold text-ink"}>
        {value}
      </span>
    </div>
  );
}

function PriceBreakdown({ b }: { b: B }) {
  return (
    <div className="flex flex-col gap-sm">
      <PriceRow label={`Заттар (${b.count})`} value={formatTenge(b.itemsTotal)} />
      <PriceRow label="Сыйлық орамы" value={b.size ? formatTenge(b.packaging) : "Өлшемді таңда"} tone={b.size ? "default" : "pending"} />
      {b.discount > 0 && <PriceRow label={PROMO.label} value={formatTenge(-b.discount)} tone="discount" />}
      {b.delivery ? (
        <PriceRow label={`Жеткізу · ${b.delivery.provider}`} value={b.delivery.price ? formatTenge(b.delivery.price) : "Тегін"} />
      ) : (
        <PriceRow label="Жеткізу" value={b.quoting ? "Есептеліп жатыр…" : "Мекенжай бойынша есептеледі"} tone="pending" />
      )}
      <hr className="border-border" />
      <div className="flex items-center justify-between">
        <span className="font-body text-body-lg font-bold text-ink">Барлығы</span>
        <span className="font-display text-h3 font-extrabold text-primary">{formatTenge(b.total)}</span>
      </div>
      {!b.delivery && <p className="font-body text-small text-ink-muted">+ жеткізу (мекенжайды енгізгеннен кейін)</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Summary «Менің боксым» — sticky on desktop, bottom sheet on mobile */
/* ------------------------------------------------------------------ */

function nextAction(b: B): { label: string; disabled: boolean; go: () => void; hint?: string } {
  const go = () => b.setStep(b.step + 1);
  switch (b.step) {
    case 0:
      return { label: "Келесі: өлшем", disabled: !b.valid[0], go, hint: b.valid[0] ? undefined : "Алдымен кімге екенін таңда" };
    case 1:
      return { label: "Келесі: заттар", disabled: !b.valid[1], go, hint: b.valid[1] ? undefined : "Бокс өлшемін таңда" };
    case 2: {
      const left = b.min - b.count;
      return left > 0
        ? { label: `Тағы ${left} зат қос`, disabled: true, go, hint: `${b.min} зат жиналғанда ашықхатқа өтесің` }
        : { label: "Келесі: ашықхат", disabled: false, go };
    }
    case 3:
      return { label: "Боксты тексеру", disabled: false, go };
    default:
      return { label: `Тапсырысты растау · ${formatTenge(b.total)}`, disabled: !b.valid[4], go: () => confirmOrder(b), hint: b.valid[4] ? undefined : "Жеткізу мәліметтерін толтыр" };
  }
}

function confirmOrder(b: B) {
  const rec = RECIPIENTS.find((r) => r.id === b.recipient)?.title ?? "";
  const lines = [
    `Дофамин — тапсырыс`,
    `${rec} · ${b.size?.title} бокс`,
    ...b.lines.map((l) => `• ${l.item.name} × ${l.qty} — ${formatTenge(l.item.price * l.qty)}`),
    `Орау: ${formatTenge(b.packaging)}`,
    b.discount ? `${PROMO.label}: ${formatTenge(-b.discount)}` : "",
    `Жеткізу: ${b.delivery?.provider} — ${b.delivery?.price ? formatTenge(b.delivery.price) : "тегін"}`,
    b.method === "courier" ? `Мекенжай: Алматы, ${b.district}, ${b.street}; алушы ${b.receiver}, ${b.phone}` : "",
    b.message ? `Ашықхат: «${b.message}»${b.from ? ` — ${b.from}` : ""}` : "",
    `Барлығы: ${formatTenge(b.total)}`,
  ].filter(Boolean);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
}

function Summary({ b, onClose }: { b: B; onClose?: () => void }) {
  const action = nextAction(b);
  const free = b.max - b.count;
  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between gap-sm">
        <div className="flex items-center gap-xs">
          <h3 className="font-display text-h3 font-extrabold whitespace-nowrap text-ink">Менің боксым</h3>
          {b.size && (
            <span className="rounded-pill bg-primary-soft px-sm py-1 font-body text-small font-bold whitespace-nowrap text-primary">
              {b.count} / {b.min}
            </span>
          )}
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Жабу" className="flex size-8 items-center justify-center rounded-pill bg-bg text-ink">
            <Icon name="x" className="size-[18px]" />
          </button>
        )}
      </div>
      <p className="-mt-xs font-body text-small text-ink-muted">
        {[RECIPIENTS.find((r) => r.id === b.recipient)?.title, b.size && `${b.size.title} бокс`].filter(Boolean).join(" · ") || "Санат пен өлшем әлі таңдалмады"}
      </p>

      {b.lines.length > 0 && (
        <ul className="flex flex-col gap-sm">
          {b.lines.map(({ item, qty }) => (
            <li key={item.id} className="flex items-center gap-sm">
              <Thumb tone={item.tone} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-body text-small font-semibold text-ink">{item.name}</span>
                <span className="font-body text-small font-bold text-ink">{formatTenge(item.price * qty)}</span>
              </div>
              <QtyControl qty={qty} label={item.name} onDec={() => b.dec(item.id)} onInc={() => b.add(item.id)} canInc={b.count < b.max} />
              <button type="button" onClick={() => b.remove(item.id)} aria-label={`${item.name}: өшіру`} className="flex size-8 items-center justify-center rounded-pill text-ink-muted hover:bg-bg hover:text-primary">
                <Icon name="trash" className="size-[18px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {b.size && free > 0 && (
        <button
          type="button"
          onClick={() => {
            b.setStep(2);
            onClose?.();
          }}
          className="flex items-center gap-xs rounded-sm border-[1.2px] border-dashed border-ink-muted px-md py-sm font-body text-small font-medium text-ink-muted hover:text-primary"
        >
          <Icon name="plus" className="size-4" />
          {b.count < b.min ? `Тағы ${b.min - b.count} зат қажет — каталогтан қос` : `Тағы ${free} орын бос`}
        </button>
      )}

      <hr className="border-border" />
      <PriceBreakdown b={b} />

      <Button
        className="w-full"
        disabled={action.disabled}
        onClick={() => {
          action.go();
          onClose?.();
        }}
      >
        {action.label}
      </Button>
      {action.hint && (
        <p className="flex items-center gap-xs font-body text-small text-ink-muted">
          <Icon name="info" className="size-4 shrink-0" />
          {action.hint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stepper                                                            */
/* ------------------------------------------------------------------ */

function Stepper({ b }: { b: B }) {
  return (
    <nav aria-label="Бокс жинау қадамдары" className="w-full">
      {/* desktop */}
      <ol className="hidden items-center gap-xs md:flex">
        {STEPS.map((s, i) => {
          const done = i < b.step && b.valid[i];
          const current = i === b.step;
          return (
            <li key={s} className="flex items-center gap-xs">
              {i > 0 && <span className={`h-0.5 w-6 rounded-full lg:w-8 ${i <= b.step ? "bg-mint" : "bg-border"}`} />}
              <button
                type="button"
                disabled={!b.canOpen(i)}
                onClick={() => b.setStep(i)}
                aria-current={current ? "step" : undefined}
                className={`flex items-center gap-xs rounded-pill py-xs pr-md pl-xs font-body text-body transition disabled:cursor-not-allowed ${
                  current ? "bg-ink font-semibold text-on-primary" : done ? "font-semibold text-ink hover:bg-bg" : "font-medium text-ink-muted"
                }`}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-pill text-small font-bold ${
                    current ? "bg-primary text-on-primary" : done ? "bg-mint text-on-primary" : "border-[1.5px] border-border bg-surface text-ink-muted"
                  }`}
                >
                  {done ? <Icon name="check" className="size-4" /> : i + 1}
                </span>
                {s}
              </button>
            </li>
          );
        })}
      </ol>
      {/* mobile */}
      <div className="flex flex-col gap-xs md:hidden">
        <p className="font-body text-small font-semibold text-primary">
          Қадам {b.step + 1} / {STEPS.length} · {STEPS[b.step]}
        </p>
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              aria-label={s}
              disabled={!b.canOpen(i)}
              onClick={() => b.setStep(i)}
              className={`h-1 flex-1 rounded-full ${i < b.step ? "bg-mint" : i === b.step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Step panels                                                        */
/* ------------------------------------------------------------------ */

function Panel({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-[22px] font-extrabold text-ink md:text-h3">{title}</h3>
        {sub && <p className="font-body text-body text-ink-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function ChoiceCard({ selected, onClick, children, tone }: { selected: boolean; onClick: () => void; children: ReactNode; tone: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-xs rounded-lg p-lg text-left transition ${tone} ${
        selected ? "outline-2 -outline-offset-2 outline-primary" : "outline-1 -outline-offset-1 outline-transparent hover:outline-border"
      }`}
    >
      {children}
    </button>
  );
}

function StepRecipient({ b }: { b: B }) {
  return (
    <Panel title="Кімге сыйлық жинаймыз?" sub="Санатты таңда — каталогты соған сай ұсынамыз.">
      <div className="grid grid-cols-2 gap-md lg:grid-cols-3">
        {RECIPIENTS.map((r) => (
          <ChoiceCard key={r.id} selected={b.recipient === r.id} tone={toneSoft[r.tone]} onClick={() => b.setRecipient(r.id)}>
            <span className="flex w-full items-center justify-between">
              <span className={`size-3 rounded-full ${toneSolid[r.tone]}`} />
              {b.recipient === r.id && <Icon name="check" className="size-5 text-primary" />}
            </span>
            <span className="font-display text-body-lg font-extrabold text-ink">{r.title}</span>
            <span className="font-body text-small text-ink-muted">{r.hint}</span>
          </ChoiceCard>
        ))}
      </div>
    </Panel>
  );
}

function StepSize({ b }: { b: B }) {
  return (
    <Panel title="Бокс өлшемін таңда" sub="Өлшем қанша зат сиятынын анықтайды. Кейін өзгертуге болады.">
      <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
        {SIZES.map((s) => (
          <ChoiceCard key={s.id} selected={b.size?.id === s.id} tone="bg-surface" onClick={() => b.chooseSize(s.id)}>
            <span className="flex w-full items-center justify-between">
              <span className="font-display text-h3 font-extrabold text-ink">{s.title}</span>
              {s.id === "standard" && <span className="rounded-pill bg-sun px-xs py-1 font-body text-[12px] font-bold text-ink">Хит</span>}
            </span>
            <span className="font-body text-body font-semibold text-ink">
              {s.min}–{s.max} зат
            </span>
            <span className="font-body text-small text-ink-muted">
              Орау {formatTenge(s.packaging)} · {s.packagingNote.toLowerCase()}
            </span>
          </ChoiceCard>
        ))}
      </div>
    </Panel>
  );
}

function ProductCard({ item, b }: { item: Item; b: B }) {
  const qty = b.cart[item.id] ?? 0;
  const full = b.count >= b.max;
  return (
    <article
      className={`flex flex-col gap-sm rounded-md bg-surface px-sm pt-sm pb-sm transition ${
        qty ? "outline-2 -outline-offset-2 outline-primary" : "outline-1 -outline-offset-1 outline-border"
      }`}
    >
      <div className={`relative flex h-[120px] items-center justify-center rounded-sm sm:h-[132px] ${toneSoft[item.tone]}`}>
        <span className={`size-14 rounded-full sm:size-16 ${toneSolid[item.tone]}`} />
        {qty > 0 && (
          <span className="absolute top-xs left-xs flex items-center gap-1 rounded-pill bg-primary px-xs py-1 font-body text-[12px] font-bold text-on-primary">
            <Icon name="check" className="size-3" /> Боксыңда
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[2px] px-1">
        <h4 className="font-body text-body font-semibold text-ink">{item.name}</h4>
        <p className="font-body text-body-lg font-bold text-ink">{formatTenge(item.price)}</p>
      </div>
      {qty > 0 ? (
        <QtyControl wide qty={qty} label={item.name} onDec={() => b.dec(item.id)} onInc={() => b.add(item.id)} canInc={!full} />
      ) : (
        <button
          type="button"
          onClick={() => b.add(item.id)}
          disabled={full}
          className="flex items-center justify-center gap-xs rounded-pill border-[1.5px] border-primary py-xs font-body text-body font-semibold text-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:border-border disabled:text-ink-muted disabled:hover:bg-transparent"
        >
          <Icon name="plus" className="size-4" />
          {full ? "Бокс толы" : "Қосу"}
        </button>
      )}
    </article>
  );
}

function StepItems({ b }: { b: B }) {
  const [filter, setFilter] = useState<Filter>("Барлығы");
  const visible = filter === "Барлығы" ? ITEMS : ITEMS.filter((i) => i.tags.includes(filter));
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-md rounded-lg border border-border bg-surface p-md md:p-lg">
        <div className="flex items-center gap-md">
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary sm:flex">
            <Icon name="gift" className="size-[22px]" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <h3 className="font-display text-body-lg font-extrabold text-ink md:text-h3">
              {b.size!.title} бокс: {b.size!.min}–{b.size!.max} зат таңда
            </h3>
            <p className="hidden font-body text-body text-ink-muted sm:block">Бір затты бірнеше рет қосуға болады. {b.size!.min} зат жиналғанда келесі қадамға өтесің.</p>
          </div>
          <button type="button" onClick={() => b.setStep(1)} className="flex shrink-0 items-center gap-xs rounded-pill border border-border px-md py-xs font-body text-small font-semibold text-ink hover:border-ink">
            <Icon name="pencil" className="size-4" />
            <span className="hidden sm:inline">Өлшемді </span>өзгерту
          </button>
        </div>
        <Progress b={b} />
        <Slots b={b} />
      </div>

      <div className="flex items-center justify-between gap-sm">
        <div className="-mx-md flex gap-xs overflow-x-auto px-md md:mx-0 md:flex-wrap md:px-0">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`shrink-0 rounded-pill border px-md py-xs font-body text-small font-medium ${
                filter === f ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-ink hover:border-ink-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="hidden shrink-0 font-body text-small text-ink-muted md:inline">{visible.length} зат</span>
      </div>

      <div className="grid grid-cols-2 gap-sm md:gap-md xl:grid-cols-4">
        {visible.map((i) => (
          <ProductCard key={i.id} item={i} b={b} />
        ))}
      </div>
      <p className="font-body text-small text-ink-muted">* Зат таусылса, ұқсас затпен ауыстырамыз және алдын ала хабарлаймыз</p>
    </div>
  );
}

const inputCls = "w-full rounded-sm border border-border bg-surface px-md py-sm font-body text-body text-ink outline-none placeholder:text-ink-muted focus:border-primary";

function StepPostcard({ b }: { b: B }) {
  return (
    <Panel title="Ашықхатқа сөзің" sub="Қазақша, қолмен жазамыз. Бос қалдырсаң — ашықхатсыз жібереміз.">
      <div className="flex flex-col gap-md rounded-lg bg-sun-soft p-lg">
        <label className="flex flex-col gap-xs">
          <span className="font-body text-small font-semibold text-ink-muted">Тілек</span>
          <textarea
            value={b.message}
            maxLength={MESSAGE_LIMIT}
            onChange={(e) => b.setMessage(e.target.value)}
            rows={4}
            placeholder="Мысалы: Жаным, сен менің ең үлкен қуанышымсың! Жаңа жылың құтты болсын"
            className={`${inputCls} resize-none leading-[1.5]`}
          />
          <span className="self-end font-body text-small text-ink-muted">
            {b.message.length} / {MESSAGE_LIMIT}
          </span>
        </label>
        <label className="flex flex-col gap-xs">
          <span className="font-body text-small font-semibold text-ink-muted">Кімнен</span>
          <input value={b.from} onChange={(e) => b.setFrom(e.target.value)} placeholder="Атың" className={inputCls} />
        </label>
      </div>
    </Panel>
  );
}

function ReviewCard({ title, onEdit, children }: { title: string; onEdit?: () => void; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-md rounded-lg border border-border bg-surface p-md md:p-lg">
      <div className="flex items-center justify-between gap-sm">
        <h3 className="font-display text-body-lg font-extrabold text-ink md:text-h3">{title}</h3>
        {onEdit && (
          <button type="button" onClick={onEdit} className="flex items-center gap-xs rounded-pill border border-border px-md py-xs font-body text-small font-semibold text-ink hover:border-ink">
            <Icon name="pencil" className="size-4" />
            Өзгерту
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function StepReview({ b }: { b: B }) {
  const rec = RECIPIENTS.find((r) => r.id === b.recipient)!;
  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-[26px] font-extrabold text-ink md:text-h2">Боксыңды тексер</h3>
        <p className="font-body text-body-lg text-ink-muted">Бәрі дұрыс па? Кез келген бөлімді «Өзгерту» арқылы түзете аласың.</p>
      </div>

      <ReviewCard title={`${b.size!.title} бокс · ${rec.title}`} onEdit={() => b.setStep(1)}>
        <div className="flex items-center gap-lg">
          <div className="relative hidden h-[160px] w-[200px] shrink-0 overflow-hidden rounded-md bg-primary-soft sm:block" aria-hidden>
            <div className="absolute top-[62px] left-[45px] h-20 w-[110px] rounded-[12px] bg-primary" />
            <div className="absolute top-[44px] left-[35px] h-[30px] w-[130px] rounded-[10px] bg-violet" />
            <div className="absolute top-[44px] left-[92px] h-[98px] w-4 bg-sun" />
            <div className="absolute top-[22px] left-[72px] size-7 rounded-full bg-sun" />
            <div className="absolute top-[22px] left-[100px] size-7 rounded-full bg-sun" />
          </div>
          <div className="flex flex-col gap-sm">
            <p className="font-body text-body font-semibold text-mint">
              {b.count} / {b.max} зат · {b.count >= b.max ? "бокс толы" : "дайын"}
            </p>
            <Slots b={b} small />
          </div>
        </div>
      </ReviewCard>

      <ReviewCard title={`Заттар (${b.count})`} onEdit={() => b.setStep(2)}>
        <ul className="flex flex-col gap-sm">
          {b.lines.map(({ item, qty }) => (
            <li key={item.id} className="flex items-center gap-sm">
              <Thumb tone={item.tone} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-body text-small font-semibold text-ink">{item.name}</span>
                <span className="font-body text-small text-ink-muted">
                  {formatTenge(item.price)} × {qty}
                </span>
              </div>
              <span className="font-body text-body font-bold text-ink">{formatTenge(item.price * qty)}</span>
            </li>
          ))}
        </ul>
      </ReviewCard>

      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        <ReviewCard title="Ашықхат" onEdit={() => b.setStep(3)}>
          {b.message ? (
            <blockquote className="flex flex-col gap-xs rounded-md bg-sun-soft p-md font-body text-body leading-[1.5] text-ink">
              «{b.message}»{b.from && <cite className="font-body text-small font-semibold text-ink-muted not-italic">— {b.from}</cite>}
            </blockquote>
          ) : (
            <p className="font-body text-body text-ink-muted">Ашықхатсыз</p>
          )}
        </ReviewCard>
        <ReviewCard title="Орау">
          <div className="flex items-center gap-md">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-violet-soft text-violet">
              <Icon name="gift" className="size-[22px]" />
            </span>
            <p className="flex-1 font-body text-small text-ink-muted">{b.size!.packagingNote}</p>
            <span className="font-body text-body font-bold text-ink">{formatTenge(b.packaging)}</span>
          </div>
        </ReviewCard>
      </div>

      <ReviewCard title="Жеткізу">
        <fieldset className="grid grid-cols-1 gap-sm md:grid-cols-2">
          <legend className="sr-only">Жеткізу тәсілі</legend>
          {(["courier", "pickup"] as const).map((m) => {
            const sel = b.method === m;
            const price = m === "pickup" ? "Тегін" : b.quote ? formatTenge(b.quote.price) : b.quoting ? "…" : "Мекенжай бойынша";
            return (
              <label key={m} className={`flex cursor-pointer items-center gap-sm rounded-md p-md ${sel ? "bg-primary-soft outline-2 -outline-offset-2 outline-primary" : "bg-surface outline-1 -outline-offset-1 outline-border"}`}>
                <input type="radio" name="delivery" checked={sel} onChange={() => b.setMethod(m)} className="size-5 accent-primary" />
                <Icon name={m === "courier" ? "truck" : "pin"} className={`size-5 shrink-0 ${sel ? "text-primary" : "text-ink"}`} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-body text-body font-semibold text-ink">{m === "courier" ? "Курьер · Yandex Go" : "Өзім алып кетемін"}</span>
                  <span className="font-body text-small text-ink-muted">{m === "courier" ? (b.quote ? b.quote.window : "Мекенжайды енгіз") : PICKUP.window}</span>
                </span>
                <span className={`text-right font-body text-small font-bold ${sel ? "text-primary" : "text-ink"}`}>{price}</span>
              </label>
            );
          })}
        </fieldset>

        {b.method === "courier" && (
          <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
            <label className="flex flex-col gap-xs">
              <span className="font-body text-small font-semibold text-ink-muted">Аудан (Алматы)</span>
              <select value={b.district} onChange={(e) => b.setDistrict(e.target.value as District)} className={inputCls}>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-xs">
              <span className="font-body text-small font-semibold text-ink-muted">Көше, үй, пәтер</span>
              <input value={b.street} onChange={(e) => b.setStreet(e.target.value)} placeholder="Абай даңғылы 150, 24-пәтер" className={inputCls} />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="font-body text-small font-semibold text-ink-muted">Алушының аты</span>
              <input value={b.receiver} onChange={(e) => b.setReceiver(e.target.value)} placeholder="Ерлан" className={inputCls} />
            </label>
            <label className="flex flex-col gap-xs">
              <span className="font-body text-small font-semibold text-ink-muted">Алушының телефоны</span>
              <input value={b.phone} onChange={(e) => b.setPhone(e.target.value)} type="tel" inputMode="tel" placeholder="+7 7__ ___ __ __" className={inputCls} />
            </label>
          </div>
        )}
        <p className="flex items-center gap-xs font-body text-small text-ink-muted">
          <Icon name="info" className="size-4 shrink-0" />
          {b.method === "pickup"
            ? "Алматы, дүкеннен алып кетесің — жеткізу тегін"
            : b.quote
              ? "Курьер бағасы осы мекенжай бойынша есептелді"
              : "Курьер бағасы мекенжайды енгізгеннен кейін есептеледі"}
        </p>
      </ReviewCard>

      <p className="rounded-md bg-sun-soft px-md py-sm font-body text-small text-ink">
        Төлем: Kaspi QR не аударым · алдын ала {Math.round(PREPAY_SHARE * 100)}% — {formatTenge(Math.round(b.total * PREPAY_SHARE))}. Төлемнен кейін заттарды сатып алып, жинаймыз.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

export default function BoxBuilder() {
  const b = useBuilder();
  const [sheet, setSheet] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // mobile bottom bar only while the builder is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // keep the stepper in view when the step changes
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [b.step]);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheet]);

  const action = nextAction(b);
  const panel = useMemo(() => [StepRecipient, StepSize, StepItems, StepPostcard, StepReview][b.step], [b.step]);
  const Panel_ = panel;

  return (
    <section ref={ref} id="constructor" className="flex w-full scroll-mt-24 flex-col gap-lg px-md py-2xl lg:px-page-x lg:py-3xl">
      <div className="flex flex-col gap-sm">
        <p className="font-body text-small font-bold text-primary uppercase">03 · Конструктор</p>
        <h2 className="font-display text-[32px] leading-[1.15] font-extrabold text-ink md:text-h2">Боксыңды өзің жина</h2>
      </div>

      <div ref={topRef} className="sticky top-[77px] z-10 -mx-md scroll-mt-24 border-y border-border bg-surface px-md py-sm md:mx-0 md:rounded-pill md:border md:px-lg">
        <div className="flex items-center justify-between gap-md">
          <Stepper b={b} />
          <span className="hidden shrink-0 font-body text-small font-bold text-ink xl:inline">
            Қадам {b.step + 1} / {STEPS.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start gap-lg lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-lg pb-24 lg:pb-0">
          <Panel_ b={b} />
          <div className="flex flex-wrap items-center justify-between gap-sm">
            {b.step > 0 ? (
              <Button variant="Secondary" onClick={() => b.setStep(b.step - 1)}>
                <Icon name="arrowLeft" className="size-4" /> Артқа: {STEPS[b.step - 1].toLowerCase()}
              </Button>
            ) : (
              <span />
            )}
            <Button className="lg:hidden" disabled={action.disabled} onClick={action.go}>
              {action.label}
            </Button>
          </div>
        </div>

        <aside
          aria-label="Менің боксым"
          className="sticky top-[150px] hidden max-h-[calc(100vh-170px)] w-[400px] shrink-0 overflow-y-auto rounded-lg border border-border bg-surface p-lg shadow-[0_16px_40px_rgba(31,18,53,0.08)] lg:block"
        >
          <Summary b={b} />
        </aside>
      </div>

      {/* Mobile sticky bottom bar */}
      {inView && !sheet && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-sm bg-surface px-md pt-sm pb-[max(16px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(31,18,53,0.12)] lg:hidden">
          <button type="button" onClick={() => setSheet(true)} className="flex min-w-0 flex-1 flex-col text-left">
            <span className="font-body text-small font-semibold text-ink-muted">
              {b.size ? `${b.count} / ${b.min} зат${b.count < b.min ? ` · тағы ${b.min - b.count}` : ""}` : "Бокс бос"}
            </span>
            <span className="flex items-baseline gap-1">
              <span className="font-display text-[20px] font-extrabold text-ink">{formatTenge(b.total)}</span>
              {!b.delivery && <span className="font-body text-small text-ink-muted">+ жеткізу</span>}
            </span>
          </button>
          <Button onClick={() => setSheet(true)}>
            <Icon name="chevronUp" className="size-[18px]" /> Боксым
          </Button>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {sheet && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Менің боксым">
          <button type="button" aria-label="Жабу" onClick={() => setSheet(false)} className="absolute inset-0 bg-ink/50" />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[24px] bg-surface px-md pt-sm pb-xl shadow-[0_-8px_24px_rgba(31,18,53,0.12)]">
            <div className="mx-auto mb-sm h-1 w-10 rounded-full bg-border" />
            <Summary b={b} onClose={() => setSheet(false)} />
          </div>
        </div>
      )}
    </section>
  );
}
