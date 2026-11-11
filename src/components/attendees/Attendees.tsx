"use client";

import { useMemo, useState } from "react";
import { buttonClasses } from "@/components/auth/Button";
import { Card } from "@/components/overview/Card";
import { designAttendees } from "@/lib/attendees/mock";
import type { Guest } from "@/lib/attendees/types";

type FilterTab = "all" | "pending" | "checked-in";

export function Attendees() {
  const data = designAttendees();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  const guests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.guests.filter((guest) => {
      if (filter === "pending" && guest.status !== "pending") return false;
      if (filter === "checked-in" && guest.status !== "checked-in") return false;
      if (!q) return true;
      return (
        guest.name.toLowerCase().includes(q) ||
        guest.ticket.toLowerCase().includes(q)
      );
    });
  }, [data.guests, filter, query]);

  const filters: { id: FilterTab; label: string }[] = [
    {
      id: "all",
      label: `All ${data.totals.all.toLocaleString("en-GB")}`,
    },
    {
      id: "pending",
      label: `Pending ${data.totals.pending.toLocaleString("en-GB")}`,
    },
    {
      id: "checked-in",
      label: `Checked In ${data.totals.checkedIn.toLocaleString("en-GB")}`,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header>
        <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
          Attendees / Check-in
        </h1>
        <p className="mt-2 text-[11px] text-muted">{data.eventMeta}</p>
      </header>

      <section
        aria-label="Attendee metrics"
        className="grid gap-4 rounded-3xl bg-surface p-5 sm:grid-cols-3 sm:gap-0 sm:p-6"
      >
        {data.metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`min-w-0 sm:px-5 ${
              index > 0 ? "sm:border-l sm:border-border/50" : "sm:pl-0"
            }`}
          >
            <p className="text-[11px] text-muted">{metric.label}</p>
            <p className="mt-2 text-[clamp(1.75rem,3vw,2.25rem)] font-medium tracking-tight">
              {metric.value}
            </p>
            <p className="mt-1 text-[11px] text-muted">{metric.detail}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses("primary", "cursor-not-allowed gap-2")}
        >
          <QrIcon />
          Scan QR ticket
        </button>
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
        >
          <SearchIcon />
          Manual lookup
        </button>
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
        >
          <ExportIcon />
          Export guest list
        </button>
      </div>

      <label className="flex min-h-[4.8rem] w-full flex-col justify-center gap-1 rounded-[1.25rem] border border-accent bg-surface-2 px-5 py-3">
        <span className="text-[10px] text-muted">Search attendees</span>
        <input
          type="search"
          name="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, email or ticket reference"
          className="min-w-0 bg-transparent text-sm outline-none placeholder:text-fg"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              filter === item.id
                ? "bg-accent text-accent-fg"
                : "bg-surface-2 text-fg hover:bg-border"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card
        title="Guest list"
        aside={`/ Showing ${guests.length} of ${data.totals.all.toLocaleString("en-GB")}`}
      >
        <ul className="mt-5 flex flex-col">
          {guests.map((guest) => (
            <GuestRow key={guest.id} guest={guest} />
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-muted">
            {`Page ${data.page} of ${data.pageCount}`}
          </p>
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
          >
            Next page
            <span aria-hidden>→</span>
          </button>
        </div>
      </Card>

      <p className="text-[11px] leading-relaxed text-muted">{data.footnote}</p>
    </div>
  );
}

function GuestRow({ guest }: { guest: Guest }) {
  return (
    <li className="border-b border-border/50 py-4 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{guest.name}</p>
          <p className="mt-1 text-[11px] text-muted">{guest.ticket}</p>
        </div>
        <GuestStatusLabel guest={guest} />
      </div>
    </li>
  );
}

function GuestStatusLabel({ guest }: { guest: Guest }) {
  if (guest.status === "pending") {
    return (
      <button
        type="button"
        aria-disabled="true"
        className="shrink-0 text-sm font-medium text-accent"
      >
        Check in →
      </button>
    );
  }

  return (
    <p className="shrink-0 text-sm text-muted">
      {`Checked in · ${guest.checkedInAt}`}
    </p>
  );
}

function QrIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.5"
    >
      <path d="M2 4V2.5A.5.5 0 0 1 2.5 2H4M8 2h1.5a.5.5 0 0 1 .5.5V4M10 8v1.5a.5.5 0 0 1-.5.5H8M4 10H2.5a.5.5 0 0 1-.5-.5V8" />
      <rect x="3.75" y="3.75" width="1.75" height="1.75" fill="currentColor" stroke="none" />
      <rect x="6.5" y="3.75" width="1.75" height="1.75" fill="currentColor" stroke="none" />
      <rect x="3.75" y="6.5" width="1.75" height="1.75" fill="currentColor" stroke="none" />
      <path d="M6.5 7.5h2v2h-1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.5"
    >
      <circle cx="5" cy="5" r="3.25" />
      <path d="M7.5 7.5 10.5 10.5" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.5"
    >
      <path d="M6 1.5v6.5M3.5 5.5 6 8l2.5-2.5M2 10h8" />
    </svg>
  );
}
