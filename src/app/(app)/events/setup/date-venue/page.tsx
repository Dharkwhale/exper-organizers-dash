import type { Metadata } from "next";
import { DateVenueStep } from "@/components/event-setup/steps/DateVenueStep";

export const metadata: Metadata = { title: "Event setup / Date / Venue · EXPER" };

export default function DateVenuePage() {
  return <DateVenueStep />;
}
