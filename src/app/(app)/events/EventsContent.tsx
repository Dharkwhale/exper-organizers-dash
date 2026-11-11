import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonClasses } from "@/components/auth/Button";
import { EventsBrowser } from "@/components/events/EventsBrowser";
import { Card } from "@/components/overview/Card";
import { designEventsData } from "@/lib/events/mock";
import { getEvents } from "@/lib/server/events";

export async function EventsContent() {
  const result = await getEvents();

  if (!result.ok) {
    if (result.reason === "unauthorized") redirect("/sign-in");
    if (result.reason === "forbidden") {
      return (
        <Card className="mx-auto max-w-xl">
          <p role="alert" className="text-sm">
            This account isn&apos;t an organizer.
          </p>
        </Card>
      );
    }
    return (
      <Card className="mx-auto flex max-w-xl flex-col gap-4">
        <p role="alert" className="text-sm">
          {result.message}
        </p>
        <div>
          <Link href="/events" className={buttonClasses("secondary")}>
            Try again
          </Link>
        </div>
      </Card>
    );
  }

  // Design phase: when the API has nothing yet, show the Figma populated list.
  const data =
    result.data.events.length > 0 ? result.data : designEventsData();

  return <EventsBrowser {...data} />;
}
