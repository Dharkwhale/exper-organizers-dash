import { cookies } from "next/headers";
import { mockOverview } from "@/lib/overview/mock";
import { selectComingUp, selectHero } from "@/lib/overview/select";
import type {
  ComingUpItem,
  EventDetail,
  EventSummary,
  Hero,
  Overview,
} from "@/lib/overview/types";
import { backendFetch, type BackendFailure } from "./backend";
import { COOKIE } from "./session";

// The guests endpoint caps a page at 50; 40 pages covers 2,000 guests.
const PAGE_SIZE = 50;
const MAX_PAGES = 40;

export type Failure = {
  ok: false;
  reason: "unauthorized" | "forbidden" | "error";
  message: string;
};
export type OverviewResult = { ok: true; data: Overview } | Failure;
export type ShellIdentityResult =
  | { ok: true; data: { workspaceName: string | null; userName: string | null } }
  | Failure;

type MeResponse = {
  user: { fullName: string | null; email: string | null };
  workspace: { id: string; name: string } | null;
  data: EventSummary[];
};

type DetailResponse = {
  coverImageUrl: string | null;
  timezone: string;
  capacity: number | null;
  venue: { name: string | null; address: string | null; city: string | null };
};

type GuestPage = { data: { checkedInAt: string | null }[]; total: number };

const UNAUTHORIZED: Failure = {
  ok: false,
  reason: "unauthorized",
  message: "Sign in to continue.",
};

export function toFailure(failure: BackendFailure): Failure {
  const reason =
    failure.status === 401
      ? "unauthorized"
      : failure.status === 403
        ? "forbidden"
        : "error";
  return { ok: false, reason, message: failure.message };
}

export async function readToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE.access)?.value;
}

const guestsPath = (experienceId: string, page: number) =>
  `/organizer/experiences/${experienceId}/guests?page=${page}&limit=${PAGE_SIZE}`;

const checkedInIn = (rows: GuestPage["data"]) =>
  rows.filter((row) => row.checkedInAt).length;

export async function countCheckIns(
  experienceId: string,
  bearer: string,
): Promise<{ checkedIn: number; attendees: number; capped: boolean }> {
  const first = await backendFetch<GuestPage>(guestsPath(experienceId, 1), { bearer });
  if (!first.ok) throw new Error(first.message);

  const { total } = first.data;
  const pages = Math.ceil(total / PAGE_SIZE);
  const rest = await Promise.all(
    Array.from({ length: Math.max(Math.min(pages, MAX_PAGES) - 1, 0) }, (_, i) =>
      backendFetch<GuestPage>(guestsPath(experienceId, i + 2), { bearer }),
    ),
  );

  let checkedIn = checkedInIn(first.data.data);
  for (const page of rest) {
    if (!page.ok) throw new Error(page.message);
    checkedIn += checkedInIn(page.data.data);
  }
  return { checkedIn, attendees: total, capped: pages > MAX_PAGES };
}

function fallbackDetail(event: EventSummary): EventDetail {
  return {
    ...event,
    coverImageUrl: null,
    timezone: "UTC",
    capacity: null,
    venue: { ...event.venue, address: null },
  };
}

async function loadHero(
  { mode, event }: Hero,
  bearer: string,
): Promise<NonNullable<Overview["hero"]>> {
  const [detailResult, counts] = await Promise.all([
    backendFetch<DetailResponse>(`/organizer/experiences/${event.id}`, { bearer }),
    countCheckIns(event.id, bearer).catch(() => null),
  ]);

  const detail: EventDetail = detailResult.ok
    ? {
        ...event,
        coverImageUrl: detailResult.data.coverImageUrl,
        timezone: detailResult.data.timezone,
        capacity: detailResult.data.capacity,
        venue: {
          name: detailResult.data.venue.name,
          city: detailResult.data.venue.city,
          address: detailResult.data.venue.address,
        },
      }
    : fallbackDetail(event);

  return {
    mode,
    event,
    detail,
    checkedIn: counts?.checkedIn ?? 0,
    attendees: counts?.attendees ?? 0,
    checkedInCapped: counts?.capped ?? false,
  };
}

async function withTimezone(
  event: EventSummary,
  bearer: string,
): Promise<ComingUpItem> {
  const result = await backendFetch<DetailResponse>(
    `/organizer/experiences/${event.id}`,
    { bearer },
  );
  return { ...event, timezone: result.ok ? result.data.timezone : "UTC" };
}

export async function getOverview(now?: Date): Promise<OverviewResult> {
  const bearer = await readToken();
  if (!bearer) return UNAUTHORIZED;
  // The clock is read after the cookie: with cacheComponents, `new Date()`
  // before request-time data is a prerender error.
  const at = now ?? new Date();

  const me = await backendFetch<MeResponse>("/organizer/me", { bearer });
  if (!me.ok) return toFailure(me);

  const { user, workspace, data: events } = me.data;
  const picked = selectHero(events, at);
  const comingUp = selectComingUp(events, picked?.event.id ?? null, at);

  const [hero, items] = await Promise.all([
    picked ? loadHero(picked, bearer) : null,
    Promise.all(comingUp.items.map((event) => withTimezone(event, bearer))),
  ]);

  return {
    ok: true,
    data: {
      user: { fullName: user.fullName ?? null, email: user.email ?? null },
      workspaceName: workspace?.name ?? null,
      hero,
      comingUp: { items, total: comingUp.total },
      mock: mockOverview(),
    },
  };
}

export async function getShellIdentity(): Promise<ShellIdentityResult> {
  const bearer = await readToken();
  if (!bearer) return UNAUTHORIZED;

  const me = await backendFetch<MeResponse>("/organizer/me", { bearer });
  if (!me.ok) return toFailure(me);

  return {
    ok: true,
    data: {
      workspaceName: me.data.workspace?.name ?? null,
      userName: me.data.user.fullName ?? me.data.user.email ?? null,
    },
  };
}
