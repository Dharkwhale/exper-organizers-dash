import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const shell =
  "w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm text-fg outline-none transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function SetupField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] text-muted">{label}</span>
      {children}
      {hint ? <span className="text-[11px] leading-relaxed text-muted">{hint}</span> : null}
    </label>
  );
}

export function SetupInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${shell} ${props.className ?? ""}`.trim()} />;
}

export function SetupTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${shell} min-h-24 resize-y ${props.className ?? ""}`.trim()}
    />
  );
}

export function SetupSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${shell} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10 ${props.className ?? ""}`.trim()}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M2.5 4.5 6 8l3.5-3.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        ...props.style,
      }}
    />
  );
}
