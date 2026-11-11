"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/auth/Button";
import { Card } from "@/components/overview/Card";
import { useEventSetup } from "../EventSetupProvider";
import { SetupShell } from "../SetupShell";

export function ExperienceStep() {
  const { draft } = useEventSetup();

  return (
    <SetupShell
      stepId="experience"
      previewFootnote="Changes here update the attendee preview. Your draft stays private until publishing."
    >
      <Card>
        <h2 className="text-base font-medium">4. Experience</h2>

        <ul className="mt-6 flex flex-col gap-5">
          {draft.experience.map((item) => (
            <li key={item.id} className="border-b border-border/50 pb-5 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-[11px] text-accent">{item.status}</p>
              </div>
              <p className="mt-1 text-[11px] text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <h3 className="text-sm font-medium">Tonight&apos;s run of show</h3>
          <ul className="mt-4 flex flex-col gap-4">
            {draft.runOfShow.map((item) => (
              <li key={item.id}>
                <p className="text-sm">{item.title}</p>
                <p className="mt-1 text-[11px] text-muted">{item.meta}</p>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/experience-builder"
          className={`${buttonClasses("secondary", "mt-6 gap-2")}`}
        >
          <span aria-hidden>⚙</span>
          Open Experience Builder
        </Link>

        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          Manual send is on. Scheduled prompts stay in the queue until an operator
          confirms.
        </p>
      </Card>
    </SetupShell>
  );
}
