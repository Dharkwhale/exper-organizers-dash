import type { SalesData } from "./types";

/** Figma Sales state for Neon Solstice (NGN ledger). */
export function designSales(): SalesData {
  return {
    eventMeta:
      "Neon Solstice · NGN ledger · Orders and guest places are counted separately.",
    currencies: ["NGN", "GBP", "GHS", "KES", "USD", "EUR"],
    activeCurrency: "NGN",
    eventFilter: "Neon Solstice",
    dateFilter: "01–25 Oct 2026",
    metrics: [
      {
        label: "Gross ticket sales",
        value: "₦35,300,000",
        detail: "NGN only · 1,012 orders",
      },
      {
        label: "Refunds",
        value: "₦425,000",
        detail: "17 guest places",
      },
      {
        label: "Net after fees",
        value: "₦33,828,750",
        detail: "₦1,046,250 fees",
      },
    ],
    accessSold: {
      guestPlaces: "1,240 guest places",
      rows: [
        {
          id: "a1",
          title: "General Access",
          amount: "₦18,900,000",
          detail: "₦25,000 x 756 tickets · 756 guests",
        },
        {
          id: "a2",
          title: "VIP - Soundscape",
          amount: "₦11,700,000",
          detail: "₦65,000 x 180 tickets · 180 guests",
        },
        {
          id: "a3",
          title: "Squad Bundle (4x)",
          amount: "₦6,460,000",
          detail: "₦85,000 x 76 orders · 304 guests",
        },
        {
          id: "a4",
          title: "Refunded access",
          amount: "-₦425,000",
          detail: "17 General Access tickets · -17 guests",
        },
        {
          id: "a5",
          title: "Complimentary access",
          amount: "₦0",
          detail: "17 guests · No payment",
        },
      ],
      footer:
        "Gross paid before refunds: ₦37,060,000. Discounts: ₦1,760,000. Gross ticket sales after discounts: ₦35,300,000. Guest places: 756 + 180 + 304 - 17 + 17 = 1,240.",
    },
    capacity: {
      registered: 1240,
      capacity: 1600,
      note: "360 places available. Registration is not the same as check-in.",
      stats: [
        { label: "Paid orders", value: "1,012" },
        { label: "Registered attendees", value: "1,240" },
        { label: "Checked in", value: "1,216" },
      ],
    },
    recentOrders: {
      paidCount: "1,012 paid orders",
      orders: [
        {
          id: "o1",
          primary: "NS-1048 · Tolu James · ₦25,000 · Paid",
          detail: "25 Oct · 21:34 WAT · 1 x General Access",
        },
        {
          id: "o2",
          primary: "NS-1047 · Ife Cole · ₦85,000 · Paid",
          detail: "25 Oct · 21:32 WAT · 1 x Squad Bundle",
        },
        {
          id: "o3",
          primary: "NS-1046 · Ben Ayo · ₦65,000 · Paid",
          detail: "25 Oct · 21:29 WAT · 1 x VIP",
        },
      ],
    },
    ledgers: [
      {
        id: "l1",
        primary: "London · GBP · £6,545",
        event: "Rooftop Sessions",
      },
      {
        id: "l2",
        primary: "Accra · GHS · GH₵73,800",
        event: "Accra After Dark",
      },
      {
        id: "l3",
        primary: "Nairobi · KES · KSh957,000",
        event: "Nairobi Frequency",
      },
      {
        id: "l4",
        primary: "New York · USD · $18,128",
        event: "Midnight Drift",
      },
      {
        id: "l5",
        primary: "Berlin · EUR · €0",
        event: "Art X · Draft",
      },
    ],
  };
}
