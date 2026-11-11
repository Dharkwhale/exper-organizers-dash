"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClasses } from "@/components/auth/Button";
import { Card } from "@/components/overview/Card";
import { designLiveControl } from "@/lib/live-control/mock";
import { sparklinePath } from "@/lib/overview/sparkline";

type StreamTab = "newest" | "laughed" | "flagged";

export function LiveControl() {
  const data = designLiveControl();
  const [streamTab, setStreamTab] = useState<StreamTab>("newest");
  const flaggedCount = data.responses.filter((item) => item.flagged).length;
  const responses =
    streamTab === "flagged"
      ? data.responses.filter((item) => item.flagged)
      : streamTab === "laughed"
        ? [...data.responses].sort((a, b) => b.laughs - a.laughs)
        : data.responses;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-5">
        <div>
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
            Live Control
          </h1>
          <p className="mt-2 text-[11px] text-muted">
            {`${data.eventTitle} · ${data.eventMeta}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-accent">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Live · Connected
          </p>
          <p className="text-[11px] text-muted">{data.syncLabel}</p>
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
          >
            <PauseIcon />
            Pause all
          </button>
          <button
            type="button"
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-xs font-semibold text-danger"
          >
            <StopIcon />
            End event…
          </button>
        </div>
      </header>

      <section
        aria-label="Live metrics"
        className="grid gap-4 rounded-3xl bg-surface p-5 sm:grid-cols-2 sm:gap-0 sm:p-6 xl:grid-cols-4"
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.9fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <LivePromptCard data={data.livePrompt} />
          <ResponseStream
            count={data.responses.length}
            flagged={flaggedCount}
            tab={streamTab}
            onTabChange={setStreamTab}
            responses={responses}
          />
          <ParticipationCard data={data.participation} />
          <RoomFeelCard data={data.roomFeel} />
          <LeaderboardCard entries={data.leaderboard} />
          <SquadScoresCard squads={data.squads} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <PromptQueueCard items={data.queue} />
          <PollResultsCard poll={data.poll} />
          <PhotoModerationCard photo={data.photo} />
          <ArrivalsCard arrivals={data.arrivals} />
          <RemindersCard reminders={data.reminders} />
          <IncidentsCard incidents={data.incidents} />
          <SafetyControlsCard />
        </div>
      </div>
    </div>
  );
}

function LivePromptCard({
  data,
}: {
  data: ReturnType<typeof designLiveControl>["livePrompt"];
}) {
  const progress = Math.min((data.answered / data.active) * 100, 100);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-accent">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-accent" />
          LIVE · TEXT PROMPT
        </p>
        <p className="text-[11px] text-muted">{data.indexLabel}</p>
      </div>

      {/* Title left · timer right — matches Figma live prompt row */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
        <div className="min-w-0">
          <h2 className="text-[clamp(1.35rem,2.5vw,1.85rem)] font-semibold tracking-tight">
            {data.title}
          </h2>
          <p className="mt-2 text-[11px] text-muted">{data.detail}</p>
        </div>
        <div className="shrink-0 text-left sm:pt-0.5 sm:text-right">
          <p className="text-[clamp(2.5rem,6vw,3.5rem)] font-semibold leading-none tracking-tight tabular-nums">
            {data.remaining}
          </p>
          <p className="mt-2 text-[11px] text-muted">{data.totalLabel}</p>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3 text-[11px] text-muted">
        <span className="min-w-0">
          {`${data.answered} of ${data.active.toLocaleString("en-GB")} active attendees answered`}
        </span>
        <span className="shrink-0">{data.answeredPercent}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 text-[11px] text-muted">{data.footerNote}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
        >
          <PauseIcon />
          Pause
        </button>
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
        >
          <StopIcon />
          End prompt
        </button>
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses("primary", "cursor-not-allowed gap-2")}
        >
          <SendNextIcon />
          Send next
        </button>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        {data.sendNextNote}
      </p>
    </Card>
  );
}

function ResponseStream({
  count,
  flagged,
  tab,
  onTabChange,
  responses,
}: {
  count: number;
  flagged: number;
  tab: StreamTab;
  onTabChange: (tab: StreamTab) => void;
  responses: ReturnType<typeof designLiveControl>["responses"];
}) {
  const tabs: { id: StreamTab; label: string }[] = [
    { id: "newest", label: "Newest" },
    { id: "laughed", label: "Most laughed at" },
    { id: "flagged", label: `Flagged ${flagged}` },
  ];

  return (
    <Card title="Response stream" aside={`${count} answers`}>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tab === item.id}
            onClick={() => onTabChange(item.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              tab === item.id
                ? "bg-accent text-accent-fg"
                : "text-fg hover:text-accent"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="mt-5 flex flex-col">
        {responses.map((item) => (
          <li
            key={item.id}
            className="border-b border-border/50 py-4 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm">{item.text}</p>
              <button
                type="button"
                aria-label="More actions"
                aria-disabled="true"
                className="shrink-0 text-muted"
              >
                ···
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              {`${item.author} · ${item.time} · ${item.laughs} laughs`}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Flagged answers are held from the public room until reviewed.
      </p>
    </Card>
  );
}

function PromptQueueCard({
  items,
}: {
  items: ReturnType<typeof designLiveControl>["queue"];
}) {
  return (
    <Card title="Prompt queue" aside="/ Manual send">
      <ul className="mt-5 flex flex-col gap-5">
        {items.map((item) => {
          const statusMuted = item.status === "Ready";
          return (
            <li key={item.id}>
              <p className="text-sm font-medium">
                {item.title}{" "}
                <span className={statusMuted ? "font-normal text-muted" : "font-normal"}>
                  · {item.status}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-muted">{item.detail}</p>
            </li>
          );
        })}
      </ul>
      <Link
        href="/experience-builder"
        className={buttonClasses("secondary", "mt-6 w-full gap-2")}
      >
        <RunOfShowIcon />
        Edit run of show
      </Link>
    </Card>
  );
}

function PollResultsCard({
  poll,
}: {
  poll: ReturnType<typeof designLiveControl>["poll"];
}) {
  return (
    <Card title={poll.title} aside={poll.closedLabel}>
      <p className="mt-3 text-[11px] text-muted">
        {`${poll.respondents} respondents · One vote per person`}
      </p>
      <ul className="mt-5 flex flex-col gap-4">
        {poll.options.map((option) => (
          <li key={option.label}>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span>{option.label}</span>
              <span className="text-muted">
                {`${option.percent}% / ${option.votes} votes`}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full ${
                  option.emphasize ? "bg-fg" : "bg-border"
                }`}
                style={{ width: `${option.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-disabled="true"
        className={buttonClasses("secondary", "mt-5 w-full cursor-not-allowed gap-2")}
      >
        <span aria-hidden>▣</span>
        Show results to room
      </button>
    </Card>
  );
}

function PhotoModerationCard({
  photo,
}: {
  photo: ReturnType<typeof designLiveControl>["photo"];
}) {
  return (
    <Card title="Photo moderation" aside={`${photo.pending} pending`}>
      <div className="mt-4 flex gap-4">
        <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-surface-2 sm:size-24">
          {/* Decorative: title beside it names the photo. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.imageUrl} alt="" className="size-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{photo.title}</p>
          <p className="mt-1 text-[11px] text-muted">{photo.author}</p>
          <p className="mt-1 text-[11px] text-muted">{photo.consent}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
        >
          <span aria-hidden>✓</span>
          Approve
        </button>
        <button
          type="button"
          aria-disabled="true"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-xs font-semibold text-danger"
        >
          <span aria-hidden>×</span>
          Reject
        </button>
      </div>

      <button
        type="button"
        aria-disabled="true"
        className={buttonClasses("secondary", "mt-3 cursor-not-allowed")}
      >
        Review all
      </button>
      <p className="mt-3 text-[11px] text-muted">
        {`${photo.approved} approved · ${photo.pendingCount} pending · ${photo.rejected} rejected · ${photo.submitted} submitted`}
      </p>
    </Card>
  );
}

function ParticipationCard({
  data,
}: {
  data: ReturnType<typeof designLiveControl>["participation"];
}) {
  const width = Math.min((data.active / data.checkedIn) * 100, 100);
  return (
    <Card title="Participation" aside="Last 5 min">
      <div className="mt-4 flex items-center justify-between gap-3 text-[11px]">
        <span className="text-muted">Active / checked-in attendees</span>
        <span>
          {`${data.active.toLocaleString("en-GB")} / ${data.checkedIn.toLocaleString("en-GB")}`}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        {`${data.activePercent} active · ${data.inactiveCheckedIn} checked-in attendees inactive. Registered total: ${data.registered.toLocaleString("en-GB")}; ${data.pendingArrival} have not arrived.`}
      </p>

      <div className="mt-5">
        <p className="text-sm">
          Current prompt respondents · {data.promptRespondents}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          Subset of the {data.active.toLocaleString("en-GB")} active participants.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-sm">
          Scored quiz · Sound check · {data.quizCorrectPercent} correct
        </p>
        <p className="mt-1 whitespace-pre-line text-[11px] text-muted">
          {data.quizDetail}
        </p>
      </div>
    </Card>
  );
}

function RoomFeelCard({
  data,
}: {
  data: ReturnType<typeof designLiveControl>["roomFeel"];
}) {
  const width = 300;
  const height = 60;
  const path = sparklinePath(
    data.series.map((point) => point.value),
    width,
    height,
  );

  return (
    <Card title="How the room feels" aside={`${data.people} people`}>
      <div className="mt-4 flex justify-between text-[10px] text-muted">
        <span>High energy</span>
        <span>{`${data.people} reactions · 5-min intervals`}</span>
      </div>
      {path ? (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="Room feeling over time"
            className="mt-3 h-20 w-full"
          >
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            {data.series.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted">
        {data.moods.map((mood) => (
          <span key={mood.label}>{`${mood.label} ${mood.count}`}</span>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Self-reported reactions; not a safety or crowd-capacity measure.
      </p>
    </Card>
  );
}

function LeaderboardCard({
  entries,
}: {
  entries: ReturnType<typeof designLiveControl>["leaderboard"];
}) {
  return (
    <Card title="Public leaderboard" aside="Individuals">
      <p className="mt-2 text-[11px] text-muted">
        Visible to attendees · Only opted-in public points
      </p>
      <ol className="mt-4 flex flex-col gap-4">
        {entries.map((entry, index) => (
          <li key={entry.name} className="flex items-baseline justify-between gap-3">
            <p className="text-sm">
              <span className="text-muted">{`${index + 1}. `}</span>
              {entry.name}
            </p>
            <p className="text-sm">
              {`${entry.points.toLocaleString("en-GB")} pts`}
            </p>
          </li>
        ))}
      </ol>
      <button
        type="button"
        aria-disabled="true"
        className={buttonClasses("secondary", "mt-5 cursor-not-allowed gap-2")}
      >
        <ExternalLinkIcon />
        Open public display
      </button>
    </Card>
  );
}

function SquadScoresCard({
  squads,
}: {
  squads: ReturnType<typeof designLiveControl>["squads"];
}) {
  return (
    <Card title="Private squad scores" aside="Not public">
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        🔒 Only organisers and each squad can see their own scores. Never sent to
        the public display.
      </p>
      <ul className="mt-4 flex flex-col gap-4">
        {squads.map((squad) => (
          <li key={squad.name}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm">{squad.name}</p>
              <p className="text-sm">
                {`${squad.points.toLocaleString("en-GB")} pts`}
              </p>
            </div>
            <p className="mt-1 text-[11px] text-muted">{squad.detail}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ArrivalsCard({
  arrivals,
}: {
  arrivals: ReturnType<typeof designLiveControl>["arrivals"];
}) {
  return (
    <Card title="Arrivals" aside="Main entrance">
      <p className="mt-3 text-sm">
        {`${arrivals.checkedIn.toLocaleString("en-GB")} checked in · ${arrivals.checkedInPercent}`}
      </p>
      <p className="mt-1 text-[11px] text-muted">
        {`${arrivals.registered.toLocaleString("en-GB")} registered people · ${arrivals.pending} pending`}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {arrivals.recent.map((person) => (
          <li key={person.code}>
            <p className="text-sm">
              {`${person.name} · ${person.code} · ${person.status}`}
            </p>
            <p className="mt-1 text-[11px] text-muted">{person.meta}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-disabled="true"
        className={buttonClasses("secondary", "mt-5 cursor-not-allowed gap-2")}
      >
        <CheckInIcon />
        Open check-in
      </button>
    </Card>
  );
}

function RemindersCard({
  reminders,
}: {
  reminders: ReturnType<typeof designLiveControl>["reminders"];
}) {
  return (
    <Card title="Reminders" aside={`${reminders.length} scheduled`}>
      <ul className="mt-4 flex flex-col gap-4">
        {reminders.map((item) => (
          <li key={item.id}>
            <p className="text-sm">
              {item.text}{" "}
              <span className="text-[11px] text-muted">· Edit</span>
            </p>
            <p className="mt-1 text-[11px] text-muted">{item.meta}</p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-disabled="true"
        className={buttonClasses("secondary", "mt-5 cursor-not-allowed gap-2")}
      >
        <BellIcon />
        Send a reminder
      </button>
    </Card>
  );
}

function IncidentsCard({
  incidents,
}: {
  incidents: ReturnType<typeof designLiveControl>["incidents"];
}) {
  return (
    <Card title="Incident log" aside="1 open">
      <ul className="mt-4 flex flex-col gap-4">
        {incidents.map((item) => (
          <li key={item.id}>
            <p className="text-sm">
              {item.title}{" "}
              <span className="text-[11px] text-muted">· {item.action}</span>
            </p>
            <p className="mt-1 text-[11px] text-muted">{item.meta}</p>
            {item.detail ? (
              <p className="mt-1 text-[11px] text-muted">{item.detail}</p>
            ) : null}
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-disabled="true"
        className={buttonClasses("secondary", "mt-5 cursor-not-allowed gap-2")}
      >
        <PlusIcon />
        Log incident
      </button>
    </Card>
  );
}

function SafetyControlsCard() {
  return (
    <Card title="Event safety controls">
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Pause stops prompts and timers across Live Control. Ending closes live
        participation for everyone.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses("secondary", "w-full cursor-not-allowed gap-2")}
        >
          <PauseIcon />
          Pause all activity
        </button>
        <button
          type="button"
          aria-disabled="true"
          className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-xs font-semibold text-danger"
        >
          <StopIcon />
          End event…
        </button>
      </div>
      <p className="mt-4 text-[11px] text-muted">
        Owner or Live operator only · Confirmation required.
      </p>
    </Card>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className="size-3 fill-current">
      <rect x="2" y="1.5" width="2.5" height="9" rx="0.5" />
      <rect x="7.5" y="1.5" width="2.5" height="9" rx="0.5" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className="size-3 fill-current">
      <rect x="2.5" y="2.5" width="7" height="7" rx="1" />
    </svg>
  );
}

function SendNextIcon() {
  return (
    <svg aria-hidden viewBox="0 0 14 12" className="size-3.5 fill-current">
      <path d="M1.5 1.2v9.6L8.2 6 1.5 1.2Z" />
      <rect x="9.5" y="1.5" width="2.2" height="9" rx="0.4" />
    </svg>
  );
}

function RunOfShowIcon() {
  return (
    <svg aria-hidden viewBox="0 0 14 12" className="size-3.5 fill-current">
      <rect x="4" y="1.5" width="9" height="1.6" rx="0.4" />
      <rect x="4" y="5.2" width="9" height="1.6" rx="0.4" />
      <rect x="4" y="8.9" width="9" height="1.6" rx="0.4" />
      <rect x="1" y="1.2" width="1.6" height="2.2" rx="0.3" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.5"
    >
      <path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v6A1.5 1.5 0 0 0 2.5 11h6A1.5 1.5 0 0 0 10 9.5V7" />
      <path d="M7 1h4v4M11 1 5.5 6.5" />
    </svg>
  );
}

function CheckInIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.5"
    >
      <path d="M2 4V2.5A.5.5 0 0 1 2.5 2H4M8 2h1.5a.5.5 0 0 1 .5.5V4M10 8v1.5a.5.5 0 0 1-.5.5H8M4 10H2.5a.5.5 0 0 1-.5-.5V8" />
      <rect x="3.5" y="3.5" width="5" height="5" rx="0.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className="size-3 fill-current">
      <path d="M6 1.2a2.8 2.8 0 0 0-2.8 2.8v1.3c0 .7-.3 1.4-.8 1.9L2 7.6h8l-.4-.4c-.5-.5-.8-1.2-.8-1.9V4A2.8 2.8 0 0 0 6 1.2Z" />
      <path d="M4.6 9.2a1.4 1.4 0 0 0 2.8 0" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.6"
    >
      <path d="M6 2v8M2 6h8" />
    </svg>
  );
}
