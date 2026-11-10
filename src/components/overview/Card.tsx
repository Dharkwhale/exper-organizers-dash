import type { ReactNode } from "react";

/** The rounded surface every overview section sits on. */
export function Card({
  title,
  aside,
  children,
  className = "",
}: {
  title?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl bg-surface p-5 sm:p-6 ${className}`}>
      {title ? (
        <h2 className="flex items-baseline gap-2 text-base font-medium">
          {title}
          {aside ? (
            <span className="text-[11px] font-normal text-muted">{aside}</span>
          ) : null}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
