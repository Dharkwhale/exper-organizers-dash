"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/auth/Button";
import { Card } from "@/components/overview/Card";
import { designMoments } from "@/lib/moments/mock";
import type { MomentTab } from "@/lib/moments/types";

export function Moments() {
  const data = designMoments();
  const [tab, setTab] = useState<MomentTab>("pending");

  const tabs: { id: MomentTab; label: string }[] = [
    { id: "pending", label: `Pending ${data.counts.pending}` },
    { id: "approved", label: `Approved ${data.counts.approved}` },
    { id: "rejected", label: `Rejected ${data.counts.rejected}` },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-5">
        <div>
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
            Moments moderation
          </h1>
          <p className="mt-2 text-[11px] text-muted">{data.eventMeta}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                tab === item.id
                  ? "bg-accent text-accent-fg"
                  : "bg-surface-2 text-fg hover:bg-border"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.85fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-3xl bg-[#ececeb] text-[#111111]">
            <div className="aspect-[16/10] w-full overflow-hidden bg-[#d8d8d6]">
              {/* Decorative: caption below names the moment. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.current.imageUrl}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className="px-5 py-5 sm:px-6">
              <p className="text-[clamp(1.15rem,2.2vw,1.45rem)] font-semibold tracking-tight">
                {data.current.caption}
              </p>
              <p className="mt-2 text-[11px] text-[#6b6b6f]">
                {data.current.authorMeta}
              </p>
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-disabled="true"
              className={buttonClasses("primary", "cursor-not-allowed gap-2")}
            >
              <CheckIcon />
              Approve photo
            </button>
            <button
              type="button"
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-xs font-semibold text-danger"
            >
              <RejectIcon />
              Reject…
            </button>
            <button
              type="button"
              aria-disabled="true"
              className={buttonClasses("secondary", "cursor-not-allowed")}
            >
              Skip for now
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-muted">
            {data.current.actionNote}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Submission details">
            <div className="mt-4">
              <p className="text-sm font-medium">{data.current.submitter}</p>
              <p className="mt-1 text-[11px] text-muted">
                {data.current.ticketMeta}
              </p>
            </div>

            <div className="mt-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[11px] text-muted">Photo consent</p>
                <p className="text-sm">{data.current.consent}</p>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                {data.current.consentNote}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-[11px] text-muted">Automated screening</p>
              <p className="mt-1 text-sm">{data.current.screening}</p>
            </div>

            <label className="mt-5 flex min-h-[4.5rem] w-full flex-col justify-center gap-1 rounded-[1.25rem] bg-surface-2 px-5 py-3">
              <span className="text-[10px] text-muted">Rejection reason</span>
              <span className="flex items-center justify-between gap-3 text-sm">
                <span>Select a reason if rejecting</span>
                <span aria-hidden className="text-muted">
                  ⌄
                </span>
              </span>
            </label>

            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              Harassment, personal information or unsafe content should not be
              published.
            </p>
          </Card>

          <Card title="Up next" aside="/ Oldest first">
            <ul className="mt-5 flex flex-col gap-4">
              {data.queue.map((item) => (
                <li key={item.id}>
                  <p className="text-sm">
                    {item.name}{" "}
                    <span className="text-muted">· {item.action}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] text-muted">{data.queueFooter}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.8"
    >
      <path d="M2.5 6.2 4.8 8.5 9.5 3.5" />
    </svg>
  );
}

function RejectIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.8"
    >
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  );
}
