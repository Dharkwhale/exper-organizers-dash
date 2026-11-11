import type { ButtonHTMLAttributes } from "react";

type ButtonProps = {
  variant?: "primary" | "secondary" | "pill";
  busy?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-accent px-5 py-2.5 text-xs text-accent-fg hover:brightness-95",
  secondary: "bg-surface-2 px-5 py-2.5 text-xs text-fg hover:bg-border",
  pill: "bg-surface-2 px-3 py-1.5 text-[11px] text-fg hover:bg-border",
} as const;

/** Class string for elements that should look like a Button (e.g. a Link). */
export function buttonClasses(
  variant: keyof typeof variants = "primary",
  extra = "",
): string {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

export function Button({
  variant = "primary",
  busy = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={buttonClasses(variant, className)}
      {...rest}
    >
      {busy ? (
        <span
          data-spinner
          aria-hidden="true"
          className="mr-2 size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-pulse"
        />
      ) : null}
      {children}
    </button>
  );
}
