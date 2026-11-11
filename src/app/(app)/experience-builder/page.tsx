import type { Metadata } from "next";
import { ExperienceBuilder } from "@/components/experience-builder/ExperienceBuilder";

export const metadata: Metadata = { title: "Experience Builder · EXPER" };

export default function ExperienceBuilderPage() {
  return <ExperienceBuilder />;
}
