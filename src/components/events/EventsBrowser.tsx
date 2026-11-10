"use client";

import { useState } from "react";
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

const field =
  "rounded-2xl bg-surface-2 px-4 text-sm outline-none focus-visible:outline-2 focus-visible:outline-accent";

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
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Your events</h1>
        <p className="mt-2 text-[11px] text-muted">
          From the first idea to the last moment. All dates and times are local to the event.
        </p>
        <div className="mt-8">
          <ActionButton variant="primary" icon="+">
            Create event
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-5 py-2.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-accent ${
              tab === id ? "bg-accent text-black" : "bg-surface-2 text-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className={`flex flex-1 flex-col gap-1 py-3 ${field}`}>
          <span className="text-[10px] text-muted">Search events</span>
          <input
            type="search"
            name="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event name or city"
            className="bg-transparent text-sm outline-none placeholder:text-fg"
          />
        </label>
        <select
          aria-label="City"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={`py-3 ${field}`}
        >
          <option value="">All cities</option>
          {cities(events).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <ActionButton variant="secondary">Calendar view</ActionButton>
      </div>

      <Card
        title={`${current.label} events`}
        aside={`${shown.length} ${shown.length === 1 ? "event" : "events"}`}
      >
        {shown.length === 0 ? (
          <p className="mt-6 text-sm text-muted">{emptyMessage}</p>
        ) : (
          <div className="mt-4">
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
        Timezone changes are saved per event; attendee calendars use the selected IANA timezone.
      </p>
    </div>
  );
}
