"use client";

import { Card } from "@/components/overview/Card";
import { useEventSetup } from "../EventSetupProvider";
import { SetupField, SetupInput, SetupSelect } from "../SetupField";
import { SetupShell } from "../SetupShell";

const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Nairobi",
  "Europe/London",
  "America/New_York",
];

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "United Kingdom", "United States"];

export function DateVenueStep() {
  const { draft, setDraft } = useEventSetup();

  return (
    <SetupShell stepId="date-venue">
      <Card>
        <h2 className="text-base font-medium">2. Date / Venue</h2>

        <div className="mt-6 flex flex-col gap-4">
          <SetupField label="Venue name">
            <SetupInput
              value={draft.venueName}
              onChange={(e) => setDraft({ venueName: e.target.value })}
            />
          </SetupField>

          <SetupField label="Address">
            <SetupInput
              value={draft.address}
              onChange={(e) => setDraft({ address: e.target.value })}
            />
          </SetupField>

          <div className="grid gap-4 sm:grid-cols-2">
            <SetupField label="City">
              <SetupInput
                value={draft.city}
                onChange={(e) => setDraft({ city: e.target.value })}
              />
            </SetupField>
            <SetupField label="Country">
              <SetupSelect
                value={draft.country}
                onChange={(e) => setDraft({ country: e.target.value })}
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </SetupSelect>
            </SetupField>
          </div>

          <SetupField label="Start">
            <SetupInput
              value={draft.startLabel}
              onChange={(e) => setDraft({ startLabel: e.target.value })}
            />
          </SetupField>

          <SetupField label="End" hint={draft.endNote}>
            <SetupInput
              value={draft.endLabel}
              onChange={(e) => setDraft({ endLabel: e.target.value })}
            />
          </SetupField>

          <SetupField
            label="IANA timezone"
            hint={
              <>
                {draft.timezoneNote}
                <br />
                {TIMEZONES.join(" · ")}
              </>
            }
          >
            <SetupSelect
              value={draft.timezone}
              onChange={(e) => setDraft({ timezone: e.target.value })}
            >
              {TIMEZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </SetupSelect>
          </SetupField>

          <div className="mt-2 flex items-start justify-between gap-4 rounded-2xl bg-surface-2 px-4 py-4">
            <div>
              <p className="text-sm font-medium">Show venue before purchase</p>
              <p className="mt-1 text-[11px] text-muted">
                Attendees see the full address on the event page.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.showVenueBeforePurchase}
              onClick={() =>
                setDraft({
                  showVenueBeforePurchase: !draft.showVenueBeforePurchase,
                })
              }
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                draft.showVenueBeforePurchase ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 size-6 rounded-full bg-fg transition-transform ${
                  draft.showVenueBeforePurchase
                    ? "translate-x-5 bg-accent-fg"
                    : "translate-x-0.5"
                }`}
              />
              <span className="sr-only">
                {draft.showVenueBeforePurchase ? "On" : "Off"}
              </span>
            </button>
          </div>
        </div>
      </Card>
    </SetupShell>
  );
}
