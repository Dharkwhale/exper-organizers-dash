import type { PayoutsData } from "./types";

/** Figma Payouts state for Afterhours studio (NGN ledger). */
export function designPayouts(): PayoutsData {
  return {
    eventMeta:
      "Balances are separated by currency. No conversion or mixed-currency totals.",
    currencies: ["NGN", "GBP", "GHS", "KES", "USD", "EUR"],
    activeCurrency: "NGN",
    eventFilter: "All NGN events",
    dateFilter: "01–25 Oct 2026",
    metrics: [
      {
        label: "Available NGN",
        value: "₦8,275,000",
        detail: "eligible for transfer",
      },
      {
        label: "Pending settlement",
        value: "₦25,553,750",
        detail: "Neon Solstice · 28 Oct",
      },
      {
        label: "Transferred in October",
        value: "₦12,640,000",
        detail: "3 completed transfers",
      },
    ],
    transfer: {
      fromBalance: "NGN — Available ₦8,275,000",
      bankAccount: "Afterhours Studio Ltd · GTBank · •••• 4829",
      amount: "₦8,275,000",
      footnote:
        "Estimated arrival: 28 Oct 2026. No FX conversion. A transfer confirmation is required before funds leave this balance.",
    },
    history: [
      {
        id: "h1",
        primary: "NGN-0823 · Completed",
        amount: "₦5,815,000",
        detail: "21 Oct 2026 · GTBank •••• 4829",
      },
      {
        id: "h2",
        primary: "NGN-0814 · Completed",
        amount: "₦4,260,000",
        detail: "14 Oct 2026 · GTBank •••• 4829",
      },
      {
        id: "h3",
        primary: "NGN-0802 · Completed",
        amount: "₦2,565,000",
        detail: "03 Oct 2026 · GTBank •••• 4829",
      },
    ],
    balances: [
      {
        id: "b1",
        flag: "🇳🇬",
        code: "NGN",
        country: "Nigeria",
        amount: "₦8,275,000",
        detail: "GTBank · Verified",
      },
      {
        id: "b2",
        flag: "🇬🇧",
        code: "GBP",
        country: "United Kingdom",
        amount: "£4,287.35",
        detail: "Monzo Business · Verified",
      },
      {
        id: "b3",
        flag: "🇬🇭",
        code: "GHS",
        country: "Ghana",
        amount: "GH₵12,684",
        detail: "Bank verification needed",
        needsAttention: true,
      },
      {
        id: "b4",
        flag: "🇰🇪",
        code: "KES",
        country: "Kenya",
        amount: "KSh184,750",
        detail: "KCB · Verified",
      },
      {
        id: "b5",
        flag: "🇺🇸",
        code: "USD",
        country: "United States",
        amount: "$2,368.42",
        detail: "Mercury · Verified",
      },
      {
        id: "b6",
        flag: "🇩🇪",
        code: "EUR",
        country: "Germany",
        amount: "€0.00",
        detail: "No settled sales yet",
      },
    ],
  };
}
