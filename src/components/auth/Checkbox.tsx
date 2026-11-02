import type { InputHTMLAttributes, ReactNode } from "react";

type CheckboxProps = { label: ReactNode } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export function Checkbox({ label, className = "", ...input }: CheckboxProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 text-[11px] text-muted ${className}`}
    >
      <input type="checkbox" className="peer sr-only" {...input} />
      <span
        aria-hidden
        className="flex size-4 shrink-0 items-center justify-center rounded border border-border text-accent-fg peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <svg viewBox="0 0 12 12" className="size-3" fill="none">
          <path
            d="M2.5 6.5l2.2 2.2L9.5 3.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{label}</span>
    </label>
  );
}
