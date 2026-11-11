export type PayoutMetric = {
  label: string;
  value: string;
  detail: string;
};

export type TransferHistoryItem = {
  id: string;
  primary: string;
  amount: string;
  detail: string;
};

export type CurrencyBalance = {
  id: string;
  flag: string;
  code: string;
  country: string;
  amount: string;
  detail: string;
  needsAttention?: boolean;
};

export type PayoutsData = {
  eventMeta: string;
  currencies: string[];
  activeCurrency: string;
  eventFilter: string;
  dateFilter: string;
  metrics: PayoutMetric[];
  transfer: {
    fromBalance: string;
    bankAccount: string;
    amount: string;
    footnote: string;
  };
  history: TransferHistoryItem[];
  balances: CurrencyBalance[];
};
