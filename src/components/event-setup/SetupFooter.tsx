import Link from "next/link";
import { buttonClasses } from "@/components/auth/Button";
import type { SetupStep } from "@/lib/event-setup/steps";

export function SetupFooter({
  step,
  showSaveDraft = false,
}: {
  step: SetupStep;
  showSaveDraft?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-3">
        {step.prevHref ? (
          <Link href={step.prevHref} className={buttonClasses("secondary", "gap-2")}>
            <span aria-hidden>←</span>
            Back
          </Link>
        ) : showSaveDraft ? (
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
          >
            <span aria-hidden>✓</span>
            Save draft
          </button>
        ) : (
          <span />
        )}
      </div>
      {step.nextHref ? (
        <Link
          href={step.nextHref}
          className={buttonClasses("primary", "gap-2 self-start sm:self-auto")}
        >
          {step.nextLabel}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
