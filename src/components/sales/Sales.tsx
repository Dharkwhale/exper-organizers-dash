"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/auth/Button";
import { Card } from "@/components/overview/Card";
import { designSales } from "@/lib/sales/mock";

export function Sales() {
  const data = designSales();
  const [currency, setCurrency] = useState(data.activeCurrency);

  const capacityPercent = Math.min(
    (data.capacity.registered / data.capacity.capacity) * 100,
    100,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-5">
        <div>
          <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
            Sales
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
        aria-label="Sales metrics"
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
          <Card title="Access sold" aside={`/ ${data.accessSold.guestPlaces}`}>
            <ul className="mt-5 flex flex-col">
              {data.accessSold.rows.map((row) => (
                <li
                  key={row.id}
                  className="border-b border-border/50 py-4 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="min-w-0 text-sm font-medium">{row.title}</p>
                    <p className="shrink-0 text-sm">{row.amount}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{row.detail}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] leading-relaxed text-muted">
              {data.accessSold.footer}
            </p>
          </Card>

          <Card
            title="Recent orders"
            aside={`/ ${data.recentOrders.paidCount}`}
          >
            <ul className="mt-5 flex flex-col">
              {data.recentOrders.orders.map((order) => (
                <li
                  key={order.id}
                  className="border-b border-border/50 py-4 last:border-b-0"
                >
                  <p className="text-sm">{order.primary}</p>
                  <p className="mt-1 text-[11px] text-muted">{order.detail}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card title="Guest capacity">
            <div className="mt-4 flex items-end justify-between gap-3 text-[11px] text-muted">
              <span>Registered / capacity</span>
              <span className="shrink-0 text-fg">
                {`${data.capacity.registered.toLocaleString("en-GB")} / ${data.capacity.capacity.toLocaleString("en-GB")}`}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {data.capacity.note}
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {data.capacity.stats.map((stat) => (
                <li
                  key={stat.label}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span>{stat.label}</span>
                  <span className="shrink-0">{stat.value}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Other event ledgers">
            <ul className="mt-5 flex flex-col gap-4">
              {data.ledgers.map((ledger) => (
                <li key={ledger.id}>
                  <p className="text-sm">{ledger.primary}</p>
                  <p className="mt-1 text-[11px] text-muted">{ledger.event}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
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
