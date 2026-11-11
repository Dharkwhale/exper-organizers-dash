import type { Metadata } from "next";
import { Attendees } from "@/components/attendees/Attendees";

export const metadata: Metadata = { title: "Attendees · EXPER" };

export default function AttendeesPage() {
  return <Attendees />;
}
