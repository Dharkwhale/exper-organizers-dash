export type MomentTab = "pending" | "approved" | "rejected";

export type MomentQueueItem = {
  id: string;
  name: string;
  action: string;
  detail: string;
};

export type MomentsData = {
  eventMeta: string;
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
  current: {
    caption: string;
    authorMeta: string;
    imageUrl: string;
    submitter: string;
    ticketMeta: string;
    consent: string;
    consentNote: string;
    screening: string;
    actionNote: string;
  };
  queue: MomentQueueItem[];
  queueFooter: string;
};
