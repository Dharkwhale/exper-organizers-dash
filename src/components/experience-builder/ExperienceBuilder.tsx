"use client";

import { useMemo, useState } from "react";
import { buttonClasses } from "@/components/auth/Button";
import { Card } from "@/components/overview/Card";
import { SetupField, SetupInput, SetupSelect, SetupTextarea } from "@/components/event-setup/SetupField";
import { designExperienceBuilder } from "@/lib/experience-builder/mock";
import type { BuilderPrompt } from "@/lib/experience-builder/types";

type EditorTab = "content" | "delivery" | "scoring";

const FORMATS = [
  "Wrong answers only",
  "Multiple choice",
  "Photo upload",
  "Squad text",
];

const AUDIENCES = [
  "All checked-in attendees",
  "Squad captains",
  "VIP only",
];

export function ExperienceBuilder() {
  const initial = useMemo(() => designExperienceBuilder(), []);
  const [prompts, setPrompts] = useState(initial.prompts);
  const [selectedId, setSelectedId] = useState(
    () => initial.prompts.find((p) => p.status === "selected")?.id ?? initial.prompts[0]?.id,
  );
  const [tab, setTab] = useState<EditorTab>("content");

  const selected = prompts.find((p) => p.id === selectedId) ?? prompts[0];

  function updateSelected(patch: Partial<BuilderPrompt>) {
    if (!selected) return;
    setPrompts((current) =>
      current.map((prompt) =>
        prompt.id === selected.id ? { ...prompt, ...patch } : prompt,
      ),
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="min-w-0">
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
            Experience Builder
          </h1>
          <p className="mt-2 text-[11px] text-muted">
            {`${initial.eventTitle} · ${initial.meta}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("primary", "cursor-not-allowed gap-2")}
          >
            <span aria-hidden>+</span>
            Add prompt
          </button>
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
          >
            <span aria-hidden>📁</span>
            Import from event
          </button>
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
          >
            <span aria-hidden>✓</span>
            Save version
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.35fr)_minmax(16rem,0.85fr)] xl:items-start">
        <TimelineCard
          prompts={prompts}
          selectedId={selected?.id}
          onSelect={setSelectedId}
        />

        {selected ? (
          <EditorCard
            prompt={selected}
            tab={tab}
            onTabChange={setTab}
            onChange={updateSelected}
            disclaimer={initial.disclaimer}
          />
        ) : null}

        {selected ? <PromptPreview prompt={selected} /> : null}
      </div>
    </div>
  );
}

function TimelineCard({
  prompts,
  selectedId,
  onSelect,
}: {
  prompts: BuilderPrompt[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Card>
      <h2 className="flex flex-wrap items-baseline gap-2 text-base font-medium">
        Tonight&apos;s timeline
        <span className="text-[11px] font-normal text-muted">
          {`${prompts.length} prompts`}
        </span>
      </h2>
      <p className="mt-1 text-[11px] text-muted">Manual send · Drag to reorder.</p>

      <ul className="mt-5 flex flex-col gap-3">
        {prompts.map((prompt) => {
          const selected = prompt.id === selectedId;
          return (
            <li key={prompt.id}>
              <button
                type="button"
                onClick={() => onSelect(prompt.id)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                  selected
                    ? "bg-surface-2 ring-2 ring-accent"
                    : "bg-surface-2/60 hover:bg-surface-2"
                }`}
              >
                {selected ? (
                  <p className="text-[10px] font-semibold tracking-wide text-accent">
                    {`SELECTED · ${prompt.time}`}
                  </p>
                ) : null}
                <p className="flex items-start justify-between gap-2 text-sm font-medium">
                  <span>{prompt.title}</span>
                  {prompt.status === "sent" ? (
                    <span aria-hidden className="text-accent">
                      ✓
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {selected
                    ? `${prompt.kindLabel} · ${prompt.format} · ${prompt.durationLabel}`
                    : `${prompt.time} · ${prompt.kindLabel} · ${prompt.durationLabel} · ${prompt.statusLabel}`}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-[11px] leading-relaxed text-muted">
        Timings are event-local. Nothing sends automatically while manual send is
        enabled.
      </p>
    </Card>
  );
}

function EditorCard({
  prompt,
  tab,
  onTabChange,
  onChange,
  disclaimer,
}: {
  prompt: BuilderPrompt;
  tab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  onChange: (patch: Partial<BuilderPrompt>) => void;
  disclaimer: string;
}) {
  const tabs: { id: EditorTab; label: string }[] = [
    { id: "content", label: "Content" },
    { id: "delivery", label: "Delivery" },
    { id: "scoring", label: "Scoring" },
  ];

  return (
    <Card>
      <h2 className="text-base font-medium">Ask the room</h2>

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
                : "bg-surface-2 text-muted hover:text-fg"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "content" ? (
        <div className="mt-5 flex flex-col gap-4">
          <SetupField label="Prompt format">
            <SetupSelect
              value={prompt.format}
              onChange={(e) => onChange({ format: e.target.value })}
            >
              {FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </SetupSelect>
          </SetupField>

          <SetupField label="Question">
            <SetupTextarea
              value={prompt.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </SetupField>

          <SetupField label="Supporting text">
            <SetupTextarea
              value={prompt.supportingText}
              onChange={(e) => onChange({ supportingText: e.target.value })}
            />
          </SetupField>

          <SetupField label="Audience">
            <SetupSelect
              value={prompt.audience}
              onChange={(e) => onChange({ audience: e.target.value })}
            >
              {AUDIENCES.map((audience) => (
                <option key={audience} value={audience}>
                  {audience}
                </option>
              ))}
            </SetupSelect>
          </SetupField>

          <SetupField label="Duration">
            <SetupInput
              value={prompt.duration}
              onChange={(e) => onChange({ duration: e.target.value })}
            />
          </SetupField>
        </div>
      ) : null}

      {tab === "delivery" ? (
        <div className="mt-5 flex flex-col gap-4 text-sm">
          <MetaRow label="Audience" value={prompt.audience} />
          <MetaRow label="Duration" value={prompt.duration} />
          <MetaRow label="Manual send" value="On · Operator confirms before send" />
        </div>
      ) : null}

      {tab === "scoring" ? (
        <div className="mt-5 flex flex-col gap-4 text-sm">
          <MetaRow label="Scoring" value={prompt.scoring} />
          <p className="text-[11px] leading-relaxed text-muted">{disclaimer}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 border-t border-border/50 pt-5 text-[11px] text-muted">
        <p>
          Response limit · Edit · {prompt.responseLimit}
        </p>
        <p>Moderation · {prompt.moderation}</p>
        <p>Scoring · Edit · {prompt.scoring}</p>
        <p className="leading-relaxed">{disclaimer}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses("primary", "cursor-not-allowed")}
        >
          Save prompt
        </button>
        <button
          type="button"
          aria-disabled="true"
          className={buttonClasses(
            "secondary",
            "cursor-not-allowed gap-2 text-danger hover:text-danger",
          )}
        >
          <span aria-hidden>🗑</span>
          Remove prompt
        </button>
      </div>
    </Card>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

function PromptPreview({ prompt }: { prompt: BuilderPrompt }) {
  return (
    <aside className="w-full max-w-sm justify-self-center xl:justify-self-end">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted">
        ATTENDEE APP · PREVIEW
      </p>
      <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface">
        <div className="aspect-[16/10] overflow-hidden bg-surface-2">
          {/* Decorative: prompt title below names the preview. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/overview/neon-solstice.jpg"
            alt=""
            className="size-full object-cover"
          />
        </div>
        <div className="flex flex-col gap-3 p-5">
          <h3 className="text-xl font-semibold tracking-tight">{prompt.title}</h3>
          <p className="text-[11px] leading-relaxed text-muted">
            {prompt.supportingText}
          </p>
          <div className="rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted">
            Your answer · {prompt.answerPlaceholder}
          </div>
          <button
            type="button"
            aria-disabled="true"
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-fg"
          >
            {prompt.ctaLabel}
          </button>
          <p className="text-[10px] leading-relaxed text-muted">
            Preview only · Nothing is sent to attendees.
          </p>
        </div>
      </div>
    </aside>
  );
}
