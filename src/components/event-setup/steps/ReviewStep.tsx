"use client";

import Link from "next/link";
import { Card } from "@/components/overview/Card";
import { totalGuestCapacity } from "@/lib/event-setup/mock";
import { useEventSetup } from "../EventSetupProvider";
import { SetupField, SetupSelect } from "../SetupField";
import { SetupShell } from "../SetupShell";

const VISIBILITY = [
  "Public · Listed in discovery",
  "Unlisted · Link only",
  "Private · Invite only",
];

export function ReviewStep() {
  const { draft, setDraft } = useEventSetup();
  const capacity = totalGuestCapacity(draft.tickets);

  return (
    <SetupShell stepId="review">
      <Card>
        <h2 className="text-base font-medium">5. Review</h2>
        <p className="mt-4 text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight">
          Ready for the room?
        </p>
        <p className="mt-2 text-[11px] text-muted">
          Review the details attendees will see. Publishing does not start Live
          Control.
        </p>

        <div className="mt-8 flex flex-col gap-6">
          <ReviewBlock
            title="Basics"
            href="/events/setup/basics"
            body={`${draft.title} · ${draft.category} · Public event`}
          />
          <ReviewBlock
            title="Date & venue"
            href="/events/setup/date-venue"
            body={`25 Oct, 20:00 → 26 Oct, 03:30 WAT\n${draft.venueName} · ${draft.city} · ${draft.timezone} (UTC+01:00)`}
          />
          <ReviewBlock
            title="Access"
            href="/events/setup/access"
            body={`${draft.currency} · ${draft.tickets.length} ticket types · ${capacity.total.toLocaleString("en-GB")} guest places`}
          />
          <ReviewBlock
            title="Experience"
            href="/events/setup/experience"
            body={`${draft.runOfShow.length} prompts · Photo review required · Private squad scores`}
          />
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-surface-2 px-4 py-4">
          <span
            aria-hidden
            className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-fg"
          >
            ✓
          </span>
          <div>
            <p className="text-sm">5 / 5 checked</p>
            <p className="mt-1 text-[11px] text-muted">{draft.checklistNote}</p>
          </div>
        </div>

        <div className="mt-6">
          <SetupField label="Visibility">
            <SetupSelect
              value={draft.visibility}
              onChange={(e) => setDraft({ visibility: e.target.value })}
            >
              {VISIBILITY.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SetupSelect>
          </SetupField>
        </div>
      </Card>
    </SetupShell>
  );
}

function ReviewBlock({
  title,
  href,
  body,
}: {
  title: string;
  href: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <Link href={href} className="text-[11px] text-muted hover:text-fg">
          Edit
        </Link>
      </div>
      <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-muted">
        {body}
      </p>
    </div>
  );
}
