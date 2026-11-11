import type { Metadata } from "next";
import { AccessStep } from "@/components/event-setup/steps/AccessStep";

export const metadata: Metadata = { title: "Event setup / Access · EXPER" };

export default function AccessPage() {
  return <AccessStep />;
}
