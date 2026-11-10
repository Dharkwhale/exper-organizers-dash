# Overview Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the signed-in `/overview` page (app shell + live-event hero, Coming up, Tonight's room, Your attention, Team activity) with real backend data where endpoints exist and one marked mock module for the rest.

**Architecture:** Server components call the backend directly through the existing `backendFetch` with the httpOnly `exper_at` cookie. One server function, `getOverview()`, returns a typed `Overview`; pure selection/format functions decide hero and "Coming up". A `proxy.ts` redirects cookie-less requests to `/sign-in`.

**Tech Stack:** Next 16.4.3 (App Router, `cacheComponents`), React 19, Tailwind v4 tokens already in `globals.css`, Vitest 5 + RTL + jsdom.

**Spec:** `docs/superpowers/specs/2026-11-02-overview-dashboard-design.md`

## Global Constraints

- Tokens only (`bg-surface`, `text-muted`, `text-accent`, `border-border`, …); dark-only; Geist fonts. No new runtime dependencies; no chart library (inline SVG).
- Tokens never reach the browser: backend calls happen in server code with `bearer` from the `exper_at` cookie (`COOKIE.access` in `src/lib/server/session.ts`).
- Backend paths go through `backendFetch(path, { bearer })`, which prefixes `/api/v1`. Paths: `/organizer/me`, `/organizer/experiences/:id`, `/organizer/experiences/:id/guests?page=N&limit=50`. Guests page limit max is **50**; envelope is `{ data, page, limit, total, hasMore }`; each guest has `checkedInAt: string | null`.
- Event shape from `/organizer/me`: `data[]` of `{ id, title, status, startsAt, endsAt, venue: { name, city } }`, alongside `user`, `roles`, `workspace: { id, name } | null`. Detail adds `coverImageUrl, timezone, capacity: number | null, venue.address`. "Live" and "upcoming" count only `status === "published"`.
- Server components that read cookies or `new Date()` sit inside `<Suspense>` (cacheComponents). Client code reading `usePathname`/`useSearchParams` is wrapped in `<Suspense>`.
- Every mock value lives in `src/lib/overview/mock.ts`, each commented `MOCK: no endpoint`.
- Run tests with `npx vitest run <path>`; the task-final run is `npx vitest run && npx tsc --noEmit`.
- Copy that the mockup fixes: heading "The night, in view."; strapline "Your events, from first idea to last memory."; section titles "Coming up", "Tonight's room", "Your attention, in order", "Team activity"; buttons "Create event", "Open Live Control", "Check in guests".
- The project is not a git repository: skip commit steps and record progress in the ledger instead.

## Review Focus

- An event with `venue.name` or `venue.city` null renders without "null"/stray separators.
- A `timezone` string `Intl` rejects must not crash the page (falls back to UTC).
- Zero events, or a user with no workspace, renders empty states, not a crash.
- A hero with `capacity: null`, or zero attendees, shows `0` / omits the total, never `NaN`.
- An event spanning midnight (starts 25 Oct, ends 26 Oct) shows both dates.
- More guests than 40 pages × 50 shows "2,000+" rather than a wrong exact count.

---

### Task 1: Overview domain — types, selection rules, formatting, mock, sparkline

**Files:**
- Create: `src/lib/overview/types.ts`, `src/lib/overview/select.ts`, `src/lib/overview/format.ts`, `src/lib/overview/sparkline.ts`, `src/lib/overview/mock.ts`
- Test: `src/lib/overview/select.test.ts`, `src/lib/overview/format.test.ts`, `src/lib/overview/sparkline.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  ```ts
  export type EventSummary = { id: string; title: string; status: string; startsAt: string; endsAt: string; venue: { name: string | null; city: string | null } };
  export type EventDetail = EventSummary & { coverImageUrl: string | null; timezone: string; capacity: number | null; venue: EventSummary["venue"] & { address: string | null } };
  export type Hero = { mode: "live" | "upcoming"; event: EventSummary };
  export type MockOverview = { room: { mood: string; reactions: number; series: { label: string; value: number }[] }; activeNow: number; attention: { title: string; detail: string; action: string }[]; team: { text: string; meta: string }[]; roleLine: string };
  export type Overview = { user: { fullName: string | null; email: string | null }; workspaceName: string | null; hero: (Hero & { detail: EventDetail; checkedIn: number; attendees: number; checkedInCapped: boolean }) | null; comingUp: { items: EventSummary[]; total: number }; mock: MockOverview };
  ```
- Produces (`select.ts`): `selectHero(events: EventSummary[], now: Date): Hero | null`; `selectComingUp(events: EventSummary[], heroId: string | null, now: Date, limit?: number): { items: EventSummary[]; total: number }` (limit default 4).
- Produces (`format.ts`): `zoneLabel(timeZone: string, at: Date): string`; `formatEventWindow(startsAt: string, endsAt: string, timeZone: string): string`; `formatEventLine(event: { startsAt: string; venue: { name: string | null; city: string | null } }, timeZone: string): string`; `formatLongDate(now: Date): string`.
- Produces (`sparkline.ts`): `sparklinePath(values: number[], width: number, height: number): string` (SVG `d`; `""` for fewer than 2 values; a flat series draws a centred line, no `NaN`).
- Produces (`mock.ts`): `mockOverview(): MockOverview` using the mockup's values (mood "High energy", 312 reactions, five series points 20:45…21:41, activeNow 876, three attention items, three team items, roleLine "Owner · All events").

- [ ] **Step 1: Write failing tests**
  - `select.test.ts`: `selectHero` returns `{mode:"live"}` for a published event with `startsAt <= now < endsAt`; earliest start wins between two live events; with none live it returns `{mode:"upcoming"}` for the soonest future published event; it ignores `draft` events entirely; returns `null` for `[]`. `selectComingUp` excludes the hero id, drafts and past events, sorts ascending, and caps at 4 while `total` reports the uncapped count (6 events → items 4, total 6).
  - `format.test.ts`: `zoneLabel("Africa/Lagos", d)` → `"WAT"`; `"Africa/Nairobi"` → `"EAT"`; `"Africa/Accra"` → `"GMT"`; `"Europe/London"` → `"GMT"` in November and `"BST"` in July; an unknown zone (`"Mars/Base"`) falls back to `"UTC"` without throwing. `formatEventWindow("2026-10-25T19:00:00Z","2026-10-26T02:30:00Z","Africa/Lagos")` → `"25 Oct, 20:00 → 26 Oct, 03:30 WAT"`. `formatEventLine` → date · time + zone label · venue name · city (e.g. `"31 Oct · 19:00 WAT · Lagos"` when venue name is null), skipping null parts with no stray `·`. `formatLongDate(new Date("2026-10-25T12:00:00Z"))` → `"Sunday, 25 October 2026"`.
  - `sparkline.test.ts`: two values give a path starting at x=0 and ending at x=width; flat `[5,5,5]` contains no `NaN`; `[]` and `[3]` return `""`; a higher value yields a smaller y.
- [ ] **Step 2: Run to verify RED** — `npx vitest run src/lib/overview` — Expected: FAIL, modules not found.
- [ ] **Step 3: Implement** the files above. Format with `Intl.DateTimeFormat("en-GB", { timeZone, … })`; catch `RangeError` and retry with `"UTC"`. `zoneLabel` uses a lookup `{ "Africa/Lagos": "WAT", "Africa/Accra": "GMT", "Africa/Nairobi": "EAT" }`, and for any other zone falls back to `Intl` `timeZoneName: "short"` (this gives London's GMT/BST and UTC for the fallback).
- [ ] **Step 4: Run to verify GREEN** — `npx vitest run src/lib/overview` — Expected: PASS.

### Task 2: `getOverview()` data layer

**Files:**
- Create: `src/lib/server/overview.ts`
- Test: `src/lib/server/overview.test.ts`

**Interfaces:**
- Consumes: `backendFetch`, `COOKIE` (existing), Task 1 types, `selectHero`, `selectComingUp`, `mockOverview`.
- Produces: `getOverview(now?: Date): Promise<{ ok: true; data: Overview } | { ok: false; reason: "unauthorized" | "forbidden" | "error"; message: string }>`; `getShellIdentity(): Promise<{ ok: true; data: { workspaceName: string | null; userName: string | null } } | { ok: false; reason: "unauthorized" | "forbidden" | "error"; message: string }>` (used by the layout in Task 4); `countCheckIns(experienceId: string, bearer: string): Promise<{ checkedIn: number; attendees: number; capped: boolean }>` (exported for tests).

- [ ] **Step 1: Write failing tests** (mock `next/headers` `cookies()` with a map; stub global `fetch` by URL):
  - no `exper_at` cookie → `{ ok:false, reason:"unauthorized" }` and `fetch` not called.
  - happy path: `/organizer/me` returns user, workspace `{ name: "Afterhours studio" }`, one live event and two upcoming; result has `workspaceName`, `hero.mode === "live"`, `hero.detail.timezone`, `comingUp.total === 2`, `mock` present; the `authorization` header is `Bearer <token>`.
  - `/me` 401 → `unauthorized`; 403 → `forbidden`; 500/502 → `error` carrying the backend message.
  - `countCheckIns`: total 120 at limit 50 → fetches pages 1–3 and returns the exact count of non-null `checkedInAt` across them with `capped:false`; total 3000 → fetches only 40 pages, `capped:true`.
  - no live and no upcoming events → `hero: null`, and no detail or guests request is made.
  - detail or guests request failing does not fail the page: the hero keeps its summary event, with `detail` falling back to the summary plus `timezone: "UTC"`, `capacity: null`, `coverImageUrl: null`, and `checkedIn: 0`.
  - `getShellIdentity`: `unauthorized` with no cookie; on success returns `workspaceName` and `userName` from `/organizer/me`.
- [ ] **Step 2: Run to verify RED** — `npx vitest run src/lib/server/overview.test.ts` — Expected: FAIL, module not found.
- [ ] **Step 3: Implement.** Read `/organizer/me` first; select hero; then fetch detail and guests page 1 in parallel; pages 2..min(pages, 40) in parallel with `Promise.all`. `MAX_PAGES = 40` and `PAGE_SIZE = 50` as named constants. Status mapping: 401 → unauthorized, 403 → forbidden, anything else → error.
- [ ] **Step 4: Run to verify GREEN** — `npx vitest run src/lib/server/overview.test.ts` — Expected: PASS.

### Task 3: Route guard, `/` redirect, sign-in and verify land on `/overview`

**Files:**
- Create: `src/proxy.ts`, `src/proxy.test.ts`
- Modify: `src/app/page.tsx`; `src/app/(auth)/sign-in/SignInForm.tsx` (success branch, ~line 62); `src/app/(auth)/verify/VerifyForm.tsx` (success branch, ~line 52); their `.test.tsx` files.

**Interfaces:**
- Produces: `proxy(request: NextRequest): NextResponse` and `config = { matcher: ["/overview/:path*"] }` in `src/proxy.ts`.

- [ ] **Step 1: Write failing tests.** `proxy.test.ts`: a request to `/overview` without `exper_at` redirects to `/sign-in`; with the cookie it passes through (`NextResponse.next()`, no `location` header). In `SignInForm.test.tsx` replace "confirms a successful sign-in with the workspace name" with: on success `push` is called with `"/overview"`. In `VerifyForm.test.tsx` the same for a verified code (its `useRouter` mock must expose a shared `push` spy).
- [ ] **Step 2: Run to verify RED** — `npx vitest run src/proxy.test.ts "src/app/(auth)"` — Expected: the new assertions FAIL.
- [ ] **Step 3: Implement.** `proxy.ts` per the interface. `page.tsx` → `redirect("/overview")`. In both forms, on success keep `writeEmail`, then `router.push("/overview")`; delete the now-dead `signedInTo` / `verifiedAs` state and their "Signed in…" status paragraphs, and any test that asserted them.
- [ ] **Step 4: Run to verify GREEN** — `npx vitest run src/proxy.test.ts "src/app/(auth)"` — Expected: PASS.

### Task 4: App shell

**Files:**
- Create: `src/app/(app)/layout.tsx`, `src/components/app/AppShell.tsx`, `src/components/app/Sidebar.tsx`, `src/components/app/NavItem.tsx`, `src/components/overview/Card.tsx`
- Test: `src/components/app/AppShell.test.tsx`

**Interfaces:**
- Consumes: `getShellIdentity` (Task 2); the logo at `/exper-logo.png` as in `AuthShell`; `mockOverview().roleLine`.
- Produces: `AppShell({ workspaceName, userName, roleLine, children })`, with the client-only mobile-menu toggle isolated in `Sidebar`; `Card({ title?, aside?, children, className? })`. The `(app)` layout awaits `getShellIdentity` inside `<Suspense>` with a skeleton shell fallback, redirects to `/sign-in` on `unauthorized`, and renders an identity-less shell on other failures.

- [ ] **Step 1: Write failing tests** (render `AppShell` with props): shows the workspace name and "Organiser workspace"; breadcrumb text `Afterhours studio / Overview · Tope Adewale`; the "Overview" nav item has `aria-current="page"`; "Events", "Experience Builder", "Live Control", "Attendees", "Sales", "Moments", "Reports", "Payouts", "Team / Roles", "Settings" render with `aria-disabled="true"` and are not links; the user block shows the name and `roleLine`; the menu button toggles the sidebar (`aria-expanded`); a null `workspaceName` shows "Your workspace" instead of "null".
- [ ] **Step 2: Run to verify RED** — `npx vitest run src/components/app` — Expected: FAIL.
- [ ] **Step 3: Implement** to the mockup (fixed ~200px sidebar at `lg`, collapsible below; top bar with the breadcrumb and a bottom hairline `border-border`).
- [ ] **Step 4: Run to verify GREEN** — `npx vitest run src/components/app` — Expected: PASS.

### Task 5: Overview content cards

**Files:**
- Create: `src/components/overview/{PageHeading,LiveEventCard,ComingUp,RoomPulse,AttentionList,TeamActivity,ActionButton}.tsx`
- Test: `src/components/overview/overview-cards.test.tsx`

**Interfaces:**
- Consumes: Task 1 types and formatters, `Card` (Task 4), `buttonClasses` from `src/components/auth/Button.tsx` for the lime/secondary styles.
- Produces: `PageHeading({ now: Date })`; `LiveEventCard({ hero: NonNullable<Overview["hero"]>; activeNow: number })`; `ComingUp({ items, total })`; `RoomPulse({ room })`; `AttentionList({ items })`; `TeamActivity({ items })`; `ActionButton({ children, variant: "primary" | "secondary", icon? })` rendering an `aria-disabled` `<button type="button">` with no handler.

- [ ] **Step 1: Write failing tests.** `PageHeading`: heading "The night, in view."; text `"Sunday, 25 October 2026 · Your events, from first idea to last memory."`; "Create event" is an `aria-disabled` button. `LiveEventCard` live: badge `LIVE NOW · Africa/Lagos · UTC+01:00`; title; window text from `formatEventWindow`; `"1,216"` with `checked in / 1,240 attendees`; `"876"` with `active in the last 5 minutes`; venue caption; "Open Live Control" and "Check in guests" disabled. Upcoming mode: badge starts `UP NEXT` and the "active" stat is hidden. Zero attendees shows `0`, never `NaN`; `checkedInCapped` shows `2,000+`. A null cover image renders a neutral placeholder block, no broken `<img>`. `ComingUp`: header `4 events` (singular `1 event`), rows from `formatEventLine`; empty shows "No upcoming events yet." `RoomPulse`: an SVG `path` whose `d` equals `sparklinePath` output, the mood, `312 reactions`, x-axis labels, and the footnote "Electric is the most selected feeling. Based on 312 attendees, not the full room." with only the number dynamic. `AttentionList` and `TeamActivity` render each item; empty lists show "Nothing needs you right now." / "No activity yet."
- [ ] **Step 2: Run to verify RED** — `npx vitest run src/components/overview` — Expected: FAIL.
- [ ] **Step 3: Implement** to the mockup (cards `bg-surface rounded-3xl`, accent badge dot, large stat numerals, thousands separators via `toLocaleString("en-GB")`). Cover image as a plain `<img alt="">` (decorative: the title names the card), so `next.config.ts` needs no remote-host allowlist.
- [ ] **Step 4: Run to verify GREEN** — `npx vitest run src/components/overview` — Expected: PASS.

### Task 6: `/overview` page, states and end-to-end check

**Files:**
- Create: `src/app/(app)/overview/page.tsx`, `src/app/(app)/overview/OverviewContent.tsx`, `src/app/(app)/overview/OverviewSkeleton.tsx`
- Test: `src/app/(app)/overview/OverviewContent.test.tsx`

**Interfaces:**
- Consumes: `getOverview`, all Task 5 components, `redirect` from `next/navigation`.
- Produces: async server component `OverviewContent()`; the page wraps it in `<Suspense fallback={<OverviewSkeleton />}>`; metadata title `"Overview · EXPER"`.

- [ ] **Step 1: Write failing tests** (mock `@/lib/server/overview` and `next/navigation`; `render(await OverviewContent())`): success renders the heading, hero title, a coming-up row, the room card, and the attention and team lists; `unauthorized` calls `redirect("/sign-in")`; `forbidden` renders "This account isn't an organizer." in a `role="alert"` card; `error` renders the message plus a "Try again" link to `/overview`; `hero: null` renders a "No live or upcoming events" empty card while the Coming up empty state remains.
- [ ] **Step 2: Run to verify RED** — `npx vitest run "src/app/(app)"` — Expected: FAIL.
- [ ] **Step 3: Implement.** Grid per the mockup: hero full width; a row with `ComingUp` and `AttentionList` stacked on the left (2fr) and `RoomPulse` and `TeamActivity` on the right (1fr) at `lg`, a single column below. Skeleton = four pulsing `bg-surface` cards.
- [ ] **Step 4: Run to verify GREEN** — `npx vitest run "src/app/(app)"` — Expected: PASS.
- [ ] **Step 5: Full verification** — `npx vitest run && npx tsc --noEmit && npm run lint` — Expected: all green, no warnings. Then `npm run build` once — Expected: build succeeds and `/overview` is listed as dynamic.
- [ ] **Step 6: Browser check** on the user's running dev server (port 3000; do not start another): sign in with a real account, confirm `/overview` renders against the real backend with a clean console, and compare screenshots to the mockup at 1280px and 390px width. Report any differences. If no organizer account is available, request `/overview` unauthenticated, confirm the redirect to `/sign-in`, and say plainly that the signed-in view was not seen.
