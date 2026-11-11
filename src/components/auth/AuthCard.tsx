import { useId, type ReactNode } from "react";

export function AuthCard({
  title,
  step,
  children,
}: {
  title: string;
  step?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId}>
      <div className="mb-6 flex items-center justify-between">
        <h2 id={titleId} className="text-2xl font-semibold">
          {title}
        </h2>
        {step ? <span className="text-[11px] text-muted">{step}</span> : null}
      </div>
      {children}
    </section>
  );
}
