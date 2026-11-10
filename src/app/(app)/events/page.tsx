import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsSkeleton } from "@/components/events/EventsSkeleton";
import { EventsContent } from "./EventsContent";

export const metadata: Metadata = { title: "Events · EXPER" };

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsSkeleton />}>
      <EventsContent />
    </Suspense>
  );
}
