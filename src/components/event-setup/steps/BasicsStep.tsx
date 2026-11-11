"use client";

import { Card } from "@/components/overview/Card";
import { useEventSetup } from "../EventSetupProvider";
import { SetupField, SetupInput, SetupSelect, SetupTextarea } from "../SetupField";
import { SetupShell } from "../SetupShell";

const CATEGORIES = [
  "Music & nightlife",
  "Arts & culture",
  "Food & drink",
  "Wellness",
  "Other",
];

export function BasicsStep() {
  const { draft, setDraft } = useEventSetup();

  return (
    <SetupShell stepId="basics" showSaveDraft>
      <Card>
        <h2 className="text-base font-medium">1. Basics</h2>

        <div className="mt-5 overflow-hidden rounded-2xl bg-surface-2">
          <div className="aspect-[16/9] sm:aspect-[21/9]">
            {/* Decorative: event title field names the cover. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.coverImageUrl}
              alt=""
              className="size-full object-cover"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-disabled="true"
            className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-[11px] font-semibold text-fg"
          >
            <span aria-hidden>▣</span>
            Change cover
          </button>
          <p className="text-[11px] text-muted">{draft.coverMeta}</p>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <SetupField label="Event title">
            <SetupInput
              value={draft.title}
              onChange={(e) => setDraft({ title: e.target.value })}
            />
          </SetupField>

          <SetupField label="Description">
            <SetupTextarea
              value={draft.description}
              onChange={(e) => setDraft({ description: e.target.value })}
            />
          </SetupField>

          <SetupField label="Category">
            <SetupSelect
              value={draft.category}
              onChange={(e) => setDraft({ category: e.target.value })}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </SetupSelect>
          </SetupField>

          <SetupField
            label="Event URL"
            hint="A short link for your invitations and event page."
          >
            <div className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-accent">
              <span className="shrink-0 text-muted">exper.live /</span>
              <input
                value={draft.slug}
                onChange={(e) =>
                  setDraft({
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-"),
                  })
                }
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
            </div>
          </SetupField>
        </div>
      </Card>
    </SetupShell>
  );
}
