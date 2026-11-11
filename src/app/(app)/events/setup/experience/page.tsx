import type { Metadata } from "next";
import { ExperienceStep } from "@/components/event-setup/steps/ExperienceStep";

export const metadata: Metadata = { title: "Event setup / Experience · EXPER" };

export default function ExperiencePage() {
  return <ExperienceStep />;
}
