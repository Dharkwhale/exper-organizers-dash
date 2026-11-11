export type SalesMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AccessSoldRow = {
  id: string;
  title: string;
  amount: string;
  detail: string;
};

export type RecentOrder = {
  id: string;
  primary: string;
  detail: string;
};

export type Ledger = {
  id: string;
  primary: string;
  event: string;
};

export type SalesData = {
  eventMeta: string;
  currencies: string[];
  activeCurrency: string;
  eventFilter: string;
  dateFilter: string;
  metrics: SalesMetric[];
  accessSold: {
    guestPlaces: string;
    rows: AccessSoldRow[];
    footer: string;
  };
  capacity: {
    registered: number;
    capacity: number;
    note: string;
    stats: { label: string; value: string }[];
  };
  recentOrders: {
    paidCount: string;
    orders: RecentOrder[];
  };
  ledgers: Ledger[];
};
