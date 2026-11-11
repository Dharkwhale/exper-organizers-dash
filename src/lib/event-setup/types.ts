export type SetupStepId =
  | "basics"
  | "date-venue"
  | "access"
  | "experience"
  | "review";

export type AccessMode = "paid" | "free" | "invite";

export type TicketType = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  guestsPerTicket: number;
  description: string;
};

export type ExperienceToggle = {
  id: string;
  title: string;
  status: string;
  detail: string;
};

export type RunOfShowItem = {
  id: string;
  title: string;
  meta: string;
};

export type EventDraft = {
  title: string;
  description: string;
  category: string;
  slug: string;
  coverImageUrl: string;
  coverMeta: string;
  status: "Draft" | "Published";
  savedAtLabel: string;
  venueName: string;
  address: string;
  city: string;
  country: string;
  startLabel: string;
  endLabel: string;
  endNote: string;
  timezone: string;
  timezoneNote: string;
  showVenueBeforePurchase: boolean;
  currency: string;
  currencyLabel: string;
  accessMode: AccessMode;
  tickets: TicketType[];
  salesCloseLabel: string;
  refundPolicy: string;
  experience: ExperienceToggle[];
  runOfShow: RunOfShowItem[];
  visibility: string;
  checklistNote: string;
};
