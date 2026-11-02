import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  /** Rendered inside the input frame, after the input (e.g. a Show toggle). */
  trailing?: ReactNode;
  /** Rendered on the label row, right-aligned (e.g. "Forgot password?"). */
  labelAside?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function Field({
  label,
  error,
  hint,
  trailing,
  labelAside,
  className = "",
  ...input
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[11px] text-muted">
          {label}
        </label>
        {labelAside}
      </div>
      <div
        className={`flex items-center rounded-lg border bg-bg px-3 transition-colors focus-within:border-accent ${
          error ? "border-danger" : "border-transparent"
        }`}
      >
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-fg outline-none placeholder:text-muted/60"
          {...input}
        />
        {trailing}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-[11px] text-danger">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="text-[11px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
