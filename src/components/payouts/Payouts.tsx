"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/auth/Button";
import { Card } from "@/components/overview/Card";
import { designPayouts } from "@/lib/payouts/mock";

export function Payouts() {
  const data = designPayouts();
  const [currency, setCurrency] = useState(data.activeCurrency);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-5">
        <div>
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
            Payouts
          </h1>
          <p className="mt-2 text-[11px] text-muted">{data.eventMeta}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.currencies.map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={currency === code}
              onClick={() => setCurrency(code)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                currency === code
                  ? "bg-accent text-accent-fg"
                  : "bg-surface-2 text-fg hover:bg-border"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
          >
            {data.eventFilter}
            <span aria-hidden className="text-muted">
              ⌄
            </span>
          </button>
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
          >
            {data.dateFilter}
            <span aria-hidden className="text-muted">
              ⌄
            </span>
          </button>
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("secondary", "cursor-not-allowed gap-2")}
          >
            <ExportIcon />
            Export statement
          </button>
        </div>
      </header>

      <section
        aria-label="Payout metrics"
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
            <p className="mt-2 text-[clamp(1.5rem,3vw,2.1rem)] font-medium tracking-tight">
              {metric.value}
            </p>
            <p className="mt-1 text-[11px] text-muted">{metric.detail}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.85fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Transfer funds">
            <div className="mt-5 flex flex-col gap-3">
              <FieldButton
                label="From currency balance"
                value={data.transfer.fromBalance}
              />
              <FieldButton
                label="Verified bank account"
                value={data.transfer.bankAccount}
              />
              <label className="flex min-h-[4.8rem] w-full flex-col justify-center gap-1 rounded-[1.25rem] bg-surface-2 px-5 py-3">
                <span className="text-[10px] text-muted">Amount in NGN</span>
                <span className="text-[clamp(1.35rem,2.5vw,1.75rem)] font-medium tracking-tight">
                  {data.transfer.amount}
                </span>
              </label>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              {data.transfer.footnote}
            </p>

            <button
              type="button"
              aria-disabled="true"
              className={buttonClasses("primary", "mt-5 cursor-not-allowed")}
            >
              Review transfer
            </button>
          </Card>

          <Card title="Transfer history">
            <ul className="mt-5 flex flex-col">
              {data.history.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-border/50 py-4 last:border-b-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-sm">{item.primary}</p>
                    <p className="shrink-0 text-sm">{item.amount}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card title="Balances by currency">
          <ul className="mt-5 flex flex-col gap-4">
            {data.balances.map((balance) => (
              <li key={balance.id} className="flex items-start gap-3">
                <span aria-hidden className="mt-0.5 text-base leading-none">
                  {balance.flag}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-sm">
                      {`${balance.code} · ${balance.country}`}
                    </p>
                    <p className="shrink-0 text-sm">{balance.amount}</p>
                  </div>
                  <p
                    className={`mt-1 text-[11px] ${
                      balance.needsAttention ? "text-[#d6b35c]" : "text-muted"
                    }`}
                  >
                    {balance.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses(
              "secondary",
              "mt-6 w-full cursor-not-allowed",
            )}
          >
            Manage bank accounts
          </button>
        </Card>
      </div>
    </div>
  );
}

function FieldButton({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      aria-disabled="true"
      className="flex min-h-[4.8rem] w-full cursor-not-allowed flex-col justify-center gap-1 rounded-[1.25rem] bg-surface-2 px-5 py-3 text-left"
    >
      <span className="text-[10px] text-muted">{label}</span>
      <span className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0">{value}</span>
        <span aria-hidden className="shrink-0 text-muted">
          ⌄
        </span>
      </span>
    </button>
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
