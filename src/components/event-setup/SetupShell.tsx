"use client";

import type { ReactNode } from "react";
import { stepById } from "@/lib/event-setup/steps";
import type { SetupStepId } from "@/lib/event-setup/types";
import { AttendeePreview } from "./AttendeePreview";
import { useEventSetup } from "./EventSetupProvider";
import { SetupFooter } from "./SetupFooter";
import { SetupStepper } from "./SetupStepper";

export function SetupShell({
  stepId,
  children,
  previewFootnote,
  showSaveDraft = false,
}: {
  stepId: SetupStepId;
  children: ReactNode;
  previewFootnote?: string;
  showSaveDraft?: boolean;
}) {
  const { draft } = useEventSetup();
  const step = stepById(stepId);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-[1.05] tracking-tight">
          {step.title}
        </h1>
        <p className="text-[11px] text-muted">
          {`${draft.title} · ${draft.status} · ${draft.savedAtLabel}`}
        </p>
      </div>

      <SetupStepper current={stepId} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.75fr)] xl:items-start">
        <div className="min-w-0">{children}</div>
        <AttendeePreview footnote={previewFootnote} />
      </div>

      <SetupFooter step={step} showSaveDraft={showSaveDraft} />
    </div>
  );
}
