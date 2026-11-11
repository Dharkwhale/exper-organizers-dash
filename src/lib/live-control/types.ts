export type LiveMetric = {
  label: string;
  value: string;
  detail: string;
};

export type LiveResponse = {
  id: string;
  text: string;
  author: string;
  time: string;
  laughs: number;
  flagged?: boolean;
};

export type QueueItem = {
  id: string;
  title: string;
  status: string;
  detail: string;
};

export type PollOption = {
  label: string;
  percent: number;
  votes: number;
  emphasize?: boolean;
};

export type Arrival = {
  name: string;
  code: string;
  status: string;
  meta: string;
};

export type Reminder = {
  id: string;
  text: string;
  meta: string;
};

export type Incident = {
  id: string;
  title: string;
  action: string;
  meta: string;
  detail: string;
};

export type LeaderboardEntry = {
  name: string;
  points: number;
};

export type SquadScore = {
  name: string;
  points: number;
  detail: string;
};

export type LiveControlData = {
  eventTitle: string;
  eventMeta: string;
  syncLabel: string;
  metrics: LiveMetric[];
  livePrompt: {
    indexLabel: string;
    title: string;
    detail: string;
    remaining: string;
    totalLabel: string;
    answered: number;
    active: number;
    answeredPercent: string;
    remainingToAnswer: number;
    footerNote: string;
    sendNextNote: string;
  };
  responses: LiveResponse[];
  queue: QueueItem[];
  poll: {
    title: string;
    closedLabel: string;
    respondents: number;
    options: PollOption[];
  };
  photo: {
    pending: number;
    title: string;
    author: string;
    consent: string;
    imageUrl: string;
    approved: number;
    pendingCount: number;
    rejected: number;
    submitted: number;
  };
  participation: {
    active: number;
    checkedIn: number;
    activePercent: string;
    inactiveCheckedIn: number;
    registered: number;
    pendingArrival: number;
    promptRespondents: number;
    quizCorrectPercent: string;
    quizDetail: string;
  };
  roomFeel: {
    people: number;
    series: { label: string; value: number }[];
    moods: { label: string; count: number }[];
  };
  leaderboard: LeaderboardEntry[];
  squads: SquadScore[];
  arrivals: {
    checkedIn: number;
    checkedInPercent: string;
    registered: number;
    pending: number;
    recent: Arrival[];
  };
  reminders: Reminder[];
  incidents: Incident[];
};
