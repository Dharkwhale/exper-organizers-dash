import type { Metadata } from "next";
import { BasicsStep } from "@/components/event-setup/steps/BasicsStep";

export const metadata: Metadata = { title: "Event setup / Basics · EXPER" };

export default function BasicsPage() {
  return <BasicsStep />;
}
