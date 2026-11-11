"use client";

import { Card } from "@/components/overview/Card";
import { formatNaira, totalGuestCapacity } from "@/lib/event-setup/mock";
import type { AccessMode } from "@/lib/event-setup/types";
import { useEventSetup } from "../EventSetupProvider";
import { SetupField, SetupSelect } from "../SetupField";
import { SetupShell } from "../SetupShell";

const CURRENCIES = [
  { value: "NGN", label: "NGN — Nigerian naira" },
  { value: "GBP", label: "GBP — British pound" },
  { value: "GHS", label: "GHS — Ghanaian cedi" },
  { value: "KES", label: "KES — Kenyan shilling" },
  { value: "USD", label: "USD — US dollar" },
];

const MODES: { id: AccessMode; label: string }[] = [
  { id: "paid", label: "Paid access" },
  { id: "free", label: "Free RSVP" },
  { id: "invite", label: "Invite only" },
];

export function AccessStep() {
  const { draft, setDraft } = useEventSetup();
  const capacity = totalGuestCapacity(draft.tickets);

  return (
    <SetupShell stepId="access">
      <Card>
        <h2 className="text-base font-medium">3. Access</h2>

        <div className="mt-6 flex flex-col gap-5">
          <SetupField
            label="Event currency"
            hint="NGN · GBP · GHS · KES · USD. Locked after the first sale."
          >
            <SetupSelect
              value={draft.currency}
              onChange={(e) => {
                const next = CURRENCIES.find((item) => item.value === e.target.value);
                setDraft({
                  currency: e.target.value,
                  currencyLabel: next?.label ?? e.target.value,
                });
              }}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </SetupSelect>
          </SetupField>

          <div className="flex flex-wrap gap-2">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-pressed={draft.accessMode === mode.id}
                onClick={() => setDraft({ accessMode: mode.id })}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  draft.accessMode === mode.id
                    ? "bg-accent text-accent-fg"
                    : "bg-surface-2 text-muted hover:text-fg"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <ul className="flex flex-col">
            {draft.tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="border-b border-border/50 py-4 last:border-b-0"
              >
                <p className="text-sm font-medium">
                  {`${ticket.name} — ${formatNaira(ticket.price)}`}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {`${ticket.quantity.toLocaleString("en-GB")} tickets × ${ticket.guestsPerTicket} guest${
                    ticket.guestsPerTicket === 1 ? "" : "s"
                  } · ${ticket.description}`}
                </p>
              </li>
            ))}
          </ul>

          <button
            type="button"
            aria-disabled="true"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-xs font-semibold"
          >
            <span aria-hidden>+</span>
            Add ticket type
          </button>

          <div>
            <p className="text-sm">
              Total guest capacity · {capacity.total.toLocaleString("en-GB")} places
            </p>
            <p className="mt-1 text-[11px] text-muted">{capacity.breakdown}</p>
          </div>

          <div className="rounded-2xl bg-surface-2 px-4 py-4">
            <p className="text-[11px] text-muted">Sales close · {draft.timezone}</p>
            <p className="mt-1 text-sm">{draft.salesCloseLabel}</p>
          </div>

          <div>
            <p className="text-sm">
              Refund policy ·{" "}
              <span className="text-muted">Edit</span>
            </p>
            <p className="mt-1 text-[11px] text-muted">{draft.refundPolicy}</p>
          </div>
        </div>
      </Card>
    </SetupShell>
  );
}
