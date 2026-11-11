"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClasses } from "@/components/auth/Button";
import { ActionButton } from "@/components/overview/ActionButton";
import { Card } from "@/components/overview/Card";
import { cities, filterEvents } from "@/lib/events/filter";
import type { EventTab, EventsData } from "@/lib/events/types";
import { EventRowItem } from "./EventRowItem";

const TABS: { id: EventTab; label: string; empty: string }[] = [
  { id: "upcoming", label: "Upcoming", empty: "No upcoming events." },
  { id: "live", label: "Live", empty: "No live events." },
  { id: "past", label: "Past", empty: "No past events." },
  { id: "drafts", label: "Drafts", empty: "No draft events." },
];

function ChevronDown() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 text-fg"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" strokeLinecap="round" />
    </svg>
  );
}

export function EventsBrowser({ events, nowIso, truncated }: EventsData) {
  const [tab, setTab] = useState<EventTab>("upcoming");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const shown = filterEvents(
    events,
    { tab, query, city: city || null },
    new Date(nowIso),
  );
  const filtering = query.trim() !== "" || city !== "";
  const emptyMessage =
    events.length === 0
      ? "No events yet. Events you create will show up here."
      : filtering
        ? "No events match your search."
        : current.empty;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
            Your events
          </h1>
          <p className="mt-2 max-w-xl text-[11px] text-muted">
            From the first idea to the last moment. All dates and times are local
            to the event.
          </p>
        </div>
        <div className="shrink-0 sm:pt-1">
          <Link href="/events/setup/basics" className={buttonClasses("primary", "gap-2")}>
            <span aria-hidden>+</span>
            Create event
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-5 py-2.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              tab === id
                ? "bg-accent text-accent-fg"
                : "bg-surface-2 text-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
        <label className="flex min-h-[4.8rem] min-w-0 flex-1 flex-col justify-center gap-1 rounded-[1.25rem] bg-surface-2 px-5 py-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
          <span className="text-[10px] text-muted">Search events</span>
          <input
            type="search"
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event name or city"
            className="min-w-0 bg-transparent text-sm outline-none placeholder:text-fg"
          />
        </label>

        <div className="relative w-full shrink-0 lg:w-auto">
          <select
            aria-label="City"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 w-full appearance-none rounded-full bg-surface-2 py-2.5 pl-5 pr-11 text-sm font-semibold text-fg outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:min-w-[9.5rem]"
          >
            <option value="">All cities</option>
            {cities(events).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <ChevronDown />
          </span>
        </div>

        <ActionButton variant="secondary" icon={<CalendarIcon />}>
          Calendar view
        </ActionButton>
      </div>

      <Card
        title={`${current.label} events`}
        aside={`${shown.length} ${shown.length === 1 ? "event" : "events"}`}
      >
        {shown.length === 0 ? (
          <p className="mt-6 text-sm text-muted">{emptyMessage}</p>
        ) : (
          <div className="mt-2">
            {shown.map((event) => (
              <EventRowItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </Card>

      {truncated ? (
        <p className="text-[11px] text-muted">Showing the 50 most recent events.</p>
      ) : null}
      <p className="text-[11px] text-muted">
        Timezone changes are saved per event; attendee calendars use the selected
        IANA timezone.
      </p>
    </div>
  );
}
