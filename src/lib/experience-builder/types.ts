export type PromptStatus = "sent" | "ready" | "selected";

export type PromptKind = "poll" | "text" | "photo" | "squad";

export type BuilderPrompt = {
  id: string;
  title: string;
  time: string;
  kind: PromptKind;
  kindLabel: string;
  durationLabel: string;
  status: PromptStatus;
  statusLabel: string;
  format: string;
  supportingText: string;
  audience: string;
  duration: string;
  responseLimit: string;
  moderation: string;
  scoring: string;
  ctaLabel: string;
  answerPlaceholder: string;
};

export type ExperienceBuilderData = {
  eventTitle: string;
  meta: string;
  prompts: BuilderPrompt[];
  disclaimer: string;
};
