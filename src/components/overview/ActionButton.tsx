import type { ReactNode } from "react";
import { buttonClasses } from "@/components/auth/Button";

/**
 * A button for an action whose destination doesn't exist yet. It looks live but
 * is announced as disabled and does nothing, so nobody is sent to a dead end.
 */
export function ActionButton({
  children,
  variant,
  icon,
}: {
  children: ReactNode;
  variant: "primary" | "secondary";
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-disabled="true"
      className={buttonClasses(variant, "cursor-not-allowed gap-2")}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </button>
  );
}
