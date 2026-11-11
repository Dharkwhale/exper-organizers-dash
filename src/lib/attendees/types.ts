export type AttendeeMetric = {
  label: string;
  value: string;
  detail: string;
};

export type GuestStatus = "checked-in" | "pending";

export type Guest = {
  id: string;
  name: string;
  status: GuestStatus;
  checkedInAt?: string;
  ticket: string;
};

export type AttendeesData = {
  eventMeta: string;
  metrics: AttendeeMetric[];
  totals: {
    all: number;
    pending: number;
    checkedIn: number;
  };
  guests: Guest[];
  page: number;
  pageCount: number;
  showing: number;
  footnote: string;
};
