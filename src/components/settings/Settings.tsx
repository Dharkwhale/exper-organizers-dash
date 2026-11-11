"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/auth/Button";
import { Card } from "@/components/overview/Card";
import { designSettings } from "@/lib/settings/mock";
import type { SettingsField, SettingsStatusRow, SettingsTab } from "@/lib/settings/types";

export function Settings() {
  const data = designSettings();
  const [tab, setTab] = useState<SettingsTab>("workspace");

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "workspace", label: "Workspace" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-5">
        <div>
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
            Settings
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
        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Organisation">
            <div className="mt-5 flex flex-col gap-3">
              {data.organisation.map((field) => (
                <TextField key={field.id} field={field} />
              ))}
            </div>
            <button
              type="button"
              aria-disabled="true"
              className={buttonClasses("primary", "mt-5 cursor-not-allowed")}
            >
              Save changes
            </button>
          </Card>

          <Card title="Event defaults">
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {data.eventDefaults.intro}
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {data.eventDefaults.fields.map((field) => (
                <SelectField key={field.id} field={field} />
              ))}
            </div>
            <div className="mt-5">
              <StatusRow row={data.eventDefaults.photoReview} />
            </div>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Security">
            <ul className="mt-5 flex flex-col gap-4">
              {data.security.map((row) => (
                <li key={row.id}>
                  <StatusRow row={row} />
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Notification delivery">
            <ul className="mt-5 flex flex-col gap-4">
              {data.notifications.map((row) => (
                <li key={row.id}>
                  <StatusRow row={row} />
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Workspace controls">
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {data.workspaceControls.body}
            </p>
            <button
              type="button"
              aria-disabled="true"
              className="mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-surface-2 px-5 py-2.5 text-xs font-semibold text-danger"
            >
              <TrashIcon />
              Delete workspace…
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TextField({ field }: { field: SettingsField }) {
  return (
    <label
      className={`flex min-h-[4.5rem] w-full flex-col justify-center gap-1 rounded-[1.25rem] bg-surface-2 px-5 py-3 ${
        field.focused ? "outline outline-2 outline-accent" : ""
      }`}
    >
      <span className="text-[10px] text-muted">{field.label}</span>
      <input
        type="text"
        defaultValue={field.value}
        readOnly
        className="min-w-0 bg-transparent text-sm outline-none"
      />
    </label>
  );
}

function SelectField({ field }: { field: SettingsField }) {
  return (
    <button
      type="button"
      aria-disabled="true"
      className="flex min-h-[4.5rem] w-full cursor-not-allowed flex-col justify-center gap-1 rounded-[1.25rem] bg-surface-2 px-5 py-3 text-left"
    >
      <span className="text-[10px] text-muted">{field.label}</span>
      <span className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0">{field.value}</span>
        <span aria-hidden className="shrink-0 text-muted">
          ⌄
        </span>
      </span>
    </button>
  );
}

function StatusRow({ row }: { row: SettingsStatusRow }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-sm">{row.label}</p>
        <p
          className={`shrink-0 text-sm ${
            row.statusAccent ? "font-medium text-accent" : "text-fg"
          }`}
        >
          {row.status}
        </p>
      </div>
      <p className="mt-1 text-[11px] text-muted">{row.detail}</p>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.5"
    >
      <path d="M2.5 3.5h7M4.5 3.5V2.5h3v1M3.5 3.5l.5 6.5h4l.5-6.5" />
    </svg>
  );
}
