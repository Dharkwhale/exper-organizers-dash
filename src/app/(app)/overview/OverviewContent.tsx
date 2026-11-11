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
import {
  designComingUp,
  designOverviewHero,
} from "@/lib/overview/mock";
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

  const { hero: apiHero, comingUp: apiComingUp, mock } = result.data;

  // Design phase: when the API has nothing live yet, show the Figma populated state.
  const hero = apiHero ?? designOverviewHero();
  const comingUp =
    apiComingUp.total > 0 ? apiComingUp : designComingUp();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeading now={new Date()} />

      <LiveEventCard hero={hero} activeNow={mock.activeNow} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <ComingUp items={comingUp.items} total={comingUp.total} />
          <AttentionList items={mock.attention} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <RoomPulse room={mock.room} />
          <TeamActivity items={mock.team} />
        </div>
      </div>
    </div>
  );
}
