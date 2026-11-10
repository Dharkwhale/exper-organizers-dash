import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonClasses } from "@/components/auth/Button";
import { AttentionList } from "@/components/overview/AttentionList";
import { Card } from "@/components/overview/Card";
import { ComingUp } from "@/components/overview/ComingUp";
import { LiveEventCard } from "@/components/overview/LiveEventCard";
import { PageHeading } from "@/components/overview/PageHeading";
import { RoomPulse } from "@/components/overview/RoomPulse";
import { TeamActivity } from "@/components/overview/TeamActivity";
import { getOverview } from "@/lib/server/overview";

export async function OverviewContent() {
  const result = await getOverview();

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
          <Link href="/overview" className={buttonClasses("secondary")}>
            Try again
          </Link>
        </div>
      </Card>
    );
  }

  const { hero, comingUp, mock } = result.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeading now={new Date()} />

      {hero ? (
        <LiveEventCard hero={hero} activeNow={mock.activeNow} />
      ) : (
        <Card>
          <p className="text-sm">No live or upcoming events</p>
          <p className="mt-1 text-[11px] text-muted">
            When you publish an event, it will show up here.
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <ComingUp items={comingUp.items} total={comingUp.total} />
          <AttentionList items={mock.attention} />
        </div>
        <div className="flex flex-col gap-6">
          <RoomPulse room={mock.room} />
          <TeamActivity items={mock.team} />
        </div>
      </div>
    </div>
  );
}
