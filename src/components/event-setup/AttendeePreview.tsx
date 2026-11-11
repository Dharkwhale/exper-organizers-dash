"use client";

import { formatNaira } from "@/lib/event-setup/mock";
import { useEventSetup } from "./EventSetupProvider";

export function AttendeePreview({
  footnote = "Preview only · Nothing is sent to attendees.",
}: {
  footnote?: string;
}) {
  const { draft } = useEventSetup();
  const ticket = draft.tickets[0];

  return (
    <aside className="w-full max-w-sm justify-self-center lg:justify-self-end">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted">
        ATTENDEE APP PREVIEW
      </p>
      <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface">
        <div className="aspect-[16/10] overflow-hidden bg-surface-2">
          {/* Decorative: preview title below names the event. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={draft.coverImageUrl}
            alt=""
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-3 p-5">
          <h3 className="text-2xl font-semibold tracking-tight">{draft.title}</h3>
          <p className="text-[11px] text-muted">
            25 Oct 2026 · 20:00 WAT · {draft.city}
          </p>
          <p className="text-[11px] leading-relaxed text-muted">
            {`${draft.venueName}, Victoria Island · ${draft.city}, ${draft.country}`}
          </p>
          {ticket ? (
            <div>
              <p className="text-sm">
                {`${ticket.name} · ${formatNaira(ticket.price)}`}
              </p>
              <p className="mt-1 text-[11px] text-muted">{ticket.description}</p>
            </div>
          ) : null}
          <div className="rounded-2xl bg-surface-2 px-4 py-3 text-sm">
            Your access · 1 guest · {ticket?.name ?? "General Access"}
          </div>
          <button
            type="button"
            aria-disabled="true"
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-fg"
          >
            Get access
          </button>
          <p className="text-[10px] leading-relaxed text-muted">{footnote}</p>
        </div>
      </div>
    </aside>
  );
}
