import type { ReactNode } from "react";

/** Figma component "Button" (4:8): Primary / Secondary / Dark / Disabled. */
export type ButtonVariant = "Primary" | "Secondary" | "Dark";

const variants: Record<ButtonVariant, string> = {
  Primary: "bg-primary text-on-primary hover:brightness-95",
  Secondary: "bg-surface text-ink border-[1.5px] border-border hover:border-ink",
  Dark: "bg-ink text-on-primary hover:opacity-90",
};

// Disabled = Figma "Variant=Disabled": border-colored fill, muted label.
const disabledCls = "disabled:cursor-not-allowed disabled:border-0 disabled:bg-border disabled:text-ink-muted disabled:brightness-100 disabled:opacity-100";

export function Button({
  children,
  variant = "Primary",
  href,
  onClick,
  disabled,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const cls = `inline-flex items-center justify-center gap-xs rounded-pill px-lg py-md font-body text-body font-semibold whitespace-nowrap transition ${variants[variant]} ${disabledCls} ${className}`;
  if (href && !disabled) {
    return (
      <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
