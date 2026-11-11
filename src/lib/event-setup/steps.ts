import type { SetupStepId } from "./types";

export type SetupStep = {
  id: SetupStepId;
  label: string;
  title: string;
  href: string;
  nextHref: string | null;
  nextLabel: string;
  prevHref: string | null;
};

export const SETUP_STEPS: SetupStep[] = [
  {
    id: "basics",
    label: "Basics",
    title: "Event setup / Basics",
    href: "/events/setup/basics",
    nextHref: "/events/setup/date-venue",
    nextLabel: "Next: Date / Venue",
    prevHref: null,
  },
  {
    id: "date-venue",
    label: "Date / Venue",
    title: "Event setup / Date / Venue",
    href: "/events/setup/date-venue",
    nextHref: "/events/setup/access",
    nextLabel: "Next: Access",
    prevHref: "/events/setup/basics",
  },
  {
    id: "access",
    label: "Access",
    title: "Event setup / Access",
    href: "/events/setup/access",
    nextHref: "/events/setup/experience",
    nextLabel: "Next: Experience",
    prevHref: "/events/setup/date-venue",
  },
  {
    id: "experience",
    label: "Experience",
    title: "Event setup / Experience",
    href: "/events/setup/experience",
    nextHref: "/events/setup/review",
    nextLabel: "Next: Review",
    prevHref: "/events/setup/access",
  },
  {
    id: "review",
    label: "Review",
    title: "Event setup / Review",
    href: "/events/setup/review",
    nextHref: "/events",
    nextLabel: "Publish event",
    prevHref: "/events/setup/experience",
  },
];

export function stepById(id: SetupStepId): SetupStep {
  const step = SETUP_STEPS.find((item) => item.id === id);
  if (!step) throw new Error(`Unknown setup step: ${id}`);
  return step;
}
