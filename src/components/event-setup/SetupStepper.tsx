import Link from "next/link";
import { SETUP_STEPS, type SetupStep } from "@/lib/event-setup/steps";
import type { SetupStepId } from "@/lib/event-setup/types";

export function SetupStepper({ current }: { current: SetupStepId }) {
  const activeIndex = SETUP_STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Event setup steps" className="w-full">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-2">
        {SETUP_STEPS.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            active={step.id === current}
            complete={index < activeIndex}
          />
        ))}
      </ol>
    </nav>
  );
}

function StepItem({
  step,
  active,
  complete,
}: {
  step: SetupStep;
  active: boolean;
  complete: boolean;
}) {
  return (
    <li>
      <Link
        href={step.href}
        aria-current={active ? "step" : undefined}
        className="group flex flex-col gap-2"
      >
        <span
          className={`h-1 rounded-full transition-colors ${
            active ? "bg-accent" : complete ? "bg-border" : "bg-surface-2"
          }`}
        />
        <span
          className={`text-[11px] font-medium ${
            active ? "text-accent" : "text-muted group-hover:text-fg"
          }`}
        >
          {step.label}
        </span>
      </Link>
    </li>
  );
}
