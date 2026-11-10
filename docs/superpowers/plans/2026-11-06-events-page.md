# Events Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A signed-in `/events` page listing the organiser's events with Upcoming / Live / Past / Drafts tabs, search by name or city, and a city filter, using real backend data.

**Architecture:** A server component calls `getEvents()` (list + per-row detail + guest total) and hands plain rows to a client `EventsBrowser` that classifies and filters with pure functions. The shell becomes route-aware so the sidebar and breadcrumb follow the page.

**Tech Stack:** Next 16 (`cacheComponents`), React 19, Tailwind v4, Vitest 5 + RTL.

**Spec:** `docs/superpowers/specs/2026-11-06-events-page-design.md`

> Read the relevant guide in `node_modules/next/dist/docs/` before writing new Next-specific code (AGENTS.md).

## Global Constraints

- Tests first, watched failing, then minimal code (TDD). Existing suite is 212 tests, all green; it must stay green.
- `new Date()` is read only after the cookie read (`cacheComponents`); `npm run build` is the only check that catches a violation.
- Tokens stay server-side; use `backendFetch(path, {bearer})` from `src/lib/server/backend.ts`.
- Reuse `Failure` from `src/lib/server/overview.ts`, `Card` from `src/components/overview/Card.tsx`, `ActionButton` (an `aria-disabled` button) from `src/components/overview/ActionButton.tsx`, `utcOffset` from `src/lib/overview/format.ts`.
- Disabled placeholders use `aria-disabled="true"`: Create event, Calendar view, Manage event.
- Dark-only Tailwind tokens (`bg-surface`, `text-muted`, `text-accent`, `border-border`); no new dependencies.
- No `null` / `undefined` text may ever render.
- Every "Commit" step is skipped unless the user asks for commits: they have not, and the tree already holds many uncommitted changes from earlier work. Leave changes in the working tree.

## Review Focus

- Overnight event: end on a later local date renders "(+1 day)" / "(+2 days)" (pinned in Task 1).
- Event with an invalid IANA timezone: falls back to UTC, never throws (Task 1, Task 2).
- Event with null venue name or city: no "null" text; excluded from the city list, still found by title (Task 1, Task 4).
- Search text with surrounding whitespace, mixed case, or regex characters like `(`: plain trimmed case-insensitive substring match (Task 1).
- A draft whose start date is in the past is a Draft, not Past (Task 1).

---

### Task 1: Pure logic: types, classify, filter, format

**Files:**
- Create: `src/lib/events/types.ts`, `src/lib/events/classify.ts`, `src/lib/events/filter.ts`, `src/lib/events/format.ts`
- Test: `src/lib/events/classify.test.ts`, `src/lib/events/filter.test.ts`, `src/lib/events/format.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  ```ts
  export type EventTab = "upcoming" | "live" | "past" | "drafts";
  export type EventRow = {
    id: string; title: string; status: string; startsAt: string; endsAt: string;
    venue: { name: string | null; city: string | null };
    coverImageUrl: string | null; timezone: string;
    capacity: number | null; sold: number | null; currency: string | null;
  };
  export type EventsData = { events: EventRow[]; truncated: boolean; nowIso: string };
  ```
- Produces: `tabFor(event: Pick<EventRow,"status"|"startsAt"|"endsAt">, now: Date): EventTab`; `sortFor(tab: EventTab, events: EventRow[]): EventRow[]` (new array); `filterEvents(events: EventRow[], q: {tab: EventTab; query: string; city: string | null}, now: Date): EventRow[]` (tab-filtered, searched, city-filtered, sorted); `cities(events: EventRow[]): string[]`; `formatEventRange(startsAt: string, endsAt: string, timeZone: string): string`.

- [ ] **Step 1: Write failing tests**
  - `classify.test.ts`: status `draft` → `drafts` even when `startsAt` is in the past; `published` with now before start → `upcoming`; now exactly `startsAt` → `live`; now exactly `endsAt` → `live`; now after end → `past`. `sortFor`: upcoming soonest first, past most recent start first, live/drafts by `startsAt` ascending.
  - `filter.test.ts`: tab restricts rows; query `"  LAGOS "` matches a row whose city is "Lagos" (trim, case-insensitive) and one whose title contains it; query `"("` matches nothing and does not throw; `city: "Accra"` keeps only Accra rows; a row with `city: null` is kept by an empty city filter, dropped by a named one, still found by title; `cities()` returns sorted unique non-null cities.
  - `format.test.ts`: `formatEventRange("2026-10-31T18:00:00Z","2026-10-31T22:30:00Z","Africa/Lagos")` → `"31 Oct 2026 · 19:00-23:30"`; Accra `2026-11-07T20:00:00Z`→`2026-11-08T02:00:00Z` → `"7 Nov 2026 · 20:00-02:00 (+1 day)"`; a 2-day-later end → `"(+2 days)"`; zone `"Not/AZone"` renders as UTC without throwing. Use en-US month abbreviations and an un-padded day as the existing `dayAndTime` does.
- [ ] **Step 2: Run to verify RED**
  Run: `npx vitest run src/lib/events`
  Expected: FAIL, modules not found.
- [ ] **Step 3: Implement** the four files per the Interfaces block. `formatEventRange` uses `Intl.DateTimeFormat("en-US", {timeZone, ...}).formatToParts`; compute day offset as the difference of `Date.UTC(y, m-1, d)` between the end's and start's local dates. Guard the zone the way `safeZone` in `src/lib/overview/format.ts` does (copy the three-line guard locally or export it from there; if exported, add no new behavior).
- [ ] **Step 4: Run to verify GREEN**
  Run: `npx vitest run src/lib/events`
  Expected: PASS.
- [ ] **Step 5: Commit** `git add src/lib/events src/lib/overview/format.ts && git commit -m "feat(events): classify, filter and format events"`

### Task 2: Server: `getEvents`

**Files:**
- Create: `src/lib/server/events.ts`
- Modify: `src/lib/server/overview.ts` (export `toFailure` and `readToken`; no behavior change)
- Test: `src/lib/server/events.test.ts` (copy the `jar` / `vi.mock("next/headers")` / `stubBackend` harness from `src/lib/server/overview.test.ts`)

**Interfaces:**
- Consumes: `Failure` (exported from `src/lib/server/overview.ts`), `EventRow`, `EventsData` (Task 1), `backendFetch`, `COOKIE`.
- Produces: `export type EventsResult = { ok: true; data: EventsData } | Failure;` and `export async function getEvents(now?: Date): Promise<EventsResult>`; `export const MAX_EVENTS = 50`.
- Backend shapes: list `GET /organizer/experiences` → `{data: {id,title,status,startsAt,endsAt,venue:{name,city}}[]}` (newest first); detail `GET /organizer/experiences/:id` → `{coverImageUrl, timezone, capacity, ticketTypes: {price: {currency}}[]}`; guests `GET /organizer/experiences/:id/guests?page=1&limit=1` → `{total}`.

- [ ] **Step 1: Write failing tests** (route stubs keyed by pathname after `/api/v1`):
  - no cookie → `{ok:false, reason:"unauthorized"}` and zero backend calls.
  - list 401 → `unauthorized`; 403 → `forbidden`; 500 → `error` with the backend message.
  - happy path: each row gets `coverImageUrl`, `timezone`, `capacity`, `currency` from `ticketTypes[0].price.currency`, `sold` from guests `total`; the guests call uses `limit=1`; the Authorization header is `Bearer tok-123` on every call; `nowIso` equals the passed `now` ISO string.
  - detail 500 for one id → that row has `timezone:"UTC"`, `coverImageUrl:null`, `capacity:null`, `currency:null`, while its `sold` is still set; guests 500 → `sold:null` with detail fields intact; other rows unaffected.
  - empty `ticketTypes` → `currency:null`.
  - 55 events in the list → `events.length === 50`, `truncated:true`, and the kept ones are the first 50 of the list; 50 events → `truncated:false`.
  - an event whose detail returns `timezone:"Not/AZone"` is passed through unchanged (formatting guards it, Task 1).
- [ ] **Step 2: RED** Run: `npx vitest run src/lib/server/events.test.ts` Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `getEvents`. Mirror `getOverview`'s order exactly: `readToken()`, return unauthorized if absent, then `const at = now ?? new Date()`. Map list failures with the same 401/403/else rule via the now-exported `toFailure`. Slice to `MAX_EVENTS`; per row `Promise.all` of detail and guests, each failure degrading independently as specified.
- [ ] **Step 4: GREEN** Run: `npx vitest run src/lib/server` Expected: PASS (including the existing overview tests, which must be unaffected by the export change).
- [ ] **Step 5: Commit** `git add src/lib/server && git commit -m "feat(events): load events with detail and ticket counts"`

### Task 3: Route-aware shell and guard

**Files:**
- Modify: `src/components/app/AppShell.tsx`, `src/components/app/Sidebar.tsx`, `src/proxy.ts`
- Test: `src/components/app/AppShell.test.tsx`, `src/proxy.test.ts`

**Interfaces:**
- `AppShell` calls `usePathname()` (from `next/navigation`) and derives `section`: pathname starting with `/events` → `"events"`, otherwise `"overview"`. It passes `section` to `Sidebar` (new required prop `section: "overview" | "events"`) and builds the breadcrumb as `` `${workspace} / ${Overview|Events} · ${user}` ``.
- `Sidebar`: remove "Events" from `SOON`; render `<NavItem label="Overview" href="/overview" current={section === "overview"} />` then `<NavItem label="Events" href="/events" current={section === "events"} />`, then the remaining `SOON` items. Keep the order from the mockup (Overview, Events, Experience Builder, …).
- `proxy.ts`: `config.matcher = ["/overview/:path*", "/events/:path*"]`.

- [ ] **Step 1: Update tests first**: in `AppShell.test.tsx` change the `next/navigation` mock to also provide `usePathname` backed by a `vi.hoisted` variable (default `"/overview"`); drop `"Events"` from `SOON`; add: at `/overview` the Events link exists with `href="/events"` and no `aria-current`, Overview has `aria-current="page"`; at `/events` the Events link has `aria-current="page"`, Overview does not, and the breadcrumb reads `"Afterhours studio / Events · Tope Adewale"`; at `/events/anything` Events is still current. In `proxy.test.ts` change the matcher assertion to the two-entry array and rename the test to "guards the overview and events areas".
- [ ] **Step 2: RED** Run: `npx vitest run src/components/app src/proxy.test.ts` Expected: FAIL.
- [ ] **Step 3: Implement** per the Interfaces block.
- [ ] **Step 4: GREEN** Run: `npx vitest run src/components/app src/proxy.test.ts` Expected: PASS.
- [ ] **Step 5: Commit** `git add src/components/app src/proxy.ts src/proxy.test.ts && git commit -m "feat(events): route-aware sidebar and breadcrumb, guard /events"`

### Task 4: UI components

**Files:**
- Create: `src/components/events/EventRowItem.tsx`, `src/components/events/EventsBrowser.tsx`, `src/components/events/EventsSkeleton.tsx`
- Test: `src/components/events/events-ui.test.tsx`

**Interfaces:**
- Consumes: `EventRow`, `EventsData`, `EventTab`, `filterEvents`, `cities`, `formatEventRange` (Task 1); `utcOffset`; `Card`; `ActionButton`.
- Produces: `EventRowItem({event}: {event: EventRow})`; `EventsBrowser({events, nowIso, truncated}: EventsData)` (a client component); `EventsSkeleton()`.
- Row content: `<img alt="">` cover (placeholder div `data-cover-placeholder` when null, same pattern and eslint-disable as `LiveEventCard`); title; `"<venue> · <city>"` joined with only the non-null parts; `formatEventRange(...)`; `"<timezone> · <utcOffset(timezone, start)>"`; sold/capacity text: `sold === null` → `"—"`, `capacity === null` → `"<sold>"`, else `"<sold> / <capacity>"`, numbers via `toLocaleString("en-GB")`; `"Event currency · <CODE>"` only when `currency` is set; a disabled "Manage event" (`aria-disabled`).
- `EventsBrowser`: header "Your events" and subtitle "From the first idea to the last moment. All dates and times are local to the event."; disabled "Create event"; four tab buttons (`aria-pressed`) Upcoming/Live/Past/Drafts, default Upcoming; search input labelled "Search events" (placeholder "Search by event name or city"); `<select aria-label="City">` with "All cities" + `cities(events)`; disabled "Calendar view"; section heading `"<Tab> events"` with count text `"<N> events"` (`"1 event"` when 1); rows; messages: no events at all → "No events yet. Events you create will show up here."; empty tab → "No <tab> events."; filters match nothing → "No events match your search."; truncated → "Showing the 50 most recent events."; footer "Timezone changes are saved per event; attendee calendars use the selected IANA timezone."

- [ ] **Step 1: Write failing tests** (fixed `nowIso`, rows covering all four tabs, two cities): default shows only upcoming rows soonest first with heading count; clicking Live / Past / Drafts switches rows and sets `aria-pressed`; typing `"accra"` narrows to Accra rows; picking a city narrows; both filters compose; no-match message; empty-tab message; no-events message with zero rows; truncated notice appears only when `truncated`; Create event, Calendar view and Manage event all have `aria-disabled="true"`; a row with null venue/city/capacity/sold/currency renders "—" and no text "null"; the overnight row shows "(+1 day)"; the row shows "Africa/Lagos · UTC+01:00".
- [ ] **Step 2: RED** Run: `npx vitest run src/components/events` Expected: FAIL.
- [ ] **Step 3: Implement** the three components per the Interfaces block (tab/query/city in `useState`, derived list via `filterEvents(events, {tab, query, city}, new Date(nowIso))`). Skeleton mirrors the page shape with `animate-pulse` blocks and `aria-hidden`, like `OverviewSkeleton`.
- [ ] **Step 4: GREEN** Run: `npx vitest run src/components/events` Expected: PASS.
- [ ] **Step 5: Commit** `git add src/components/events && git commit -m "feat(events): events list UI with tabs, search and city filter"`

### Task 5: Page

**Files:**
- Create: `src/app/(app)/events/page.tsx`, `src/app/(app)/events/EventsContent.tsx`
- Test: `src/app/(app)/events/EventsContent.test.tsx` (follow `OverviewContent.test.tsx`: mock `@/lib/server/events` and `next/navigation`'s `redirect`)

**Interfaces:**
- `page.tsx`: `metadata = { title: "Events · EXPER" }`; `<Suspense fallback={<EventsSkeleton />}><EventsContent /></Suspense>`.
- `EventsContent` (async): `const result = await getEvents()`; unauthorized → `redirect("/sign-in")`; forbidden → card with `role="alert"` "This account isn't an organizer."; error → card with the message and a "Try again" link to `/events` (same markup as `OverviewContent`); ok → `<EventsBrowser {...result.data} />` inside `mx-auto max-w-6xl`.

- [ ] **Step 1: Write failing tests**: unauthorized redirects to `/sign-in`; forbidden and error render their alerts (error shows the message and a "Try again" link to `/events`); ok renders the page title "Your events" with the supplied rows.
- [ ] **Step 2: RED** Run: `npx vitest run "src/app/(app)/events"` Expected: FAIL.
- [ ] **Step 3: Implement** per the Interfaces block.
- [ ] **Step 4: GREEN** Run: `npx vitest run "src/app/(app)/events"` Expected: PASS.
- [ ] **Step 5: Commit** `git add "src/app/(app)/events" && git commit -m "feat(events): events page route"`

### Task 6: Verification gates

- [ ] **Step 1:** `npm test` (Vitest). Expected: all green, count above 212.
- [ ] **Step 2:** `npx tsc --noEmit` and `npm run lint`. Expected: no errors.
- [ ] **Step 3:** `npm run build`. Expected: succeeds with `/events` listed; a "Route /events: unstable value `new Date()`" error means the clock was read before the cookie, so fix `getEvents` ordering.
- [ ] **Step 4:** Browser check: extend the scratchpad stand-in (`fake-overview.mjs`, port 4001) with `GET /api/v1/organizer/experiences` returning the four mockup events plus one live, one past and one draft, then run the production build against it with `BACKEND_URL=http://localhost:4001` on a spare port, sign in by setting the `exper_at` cookie, open `/events`, and confirm: rows match the mockup, each tab switches, search and city filters work, Events is highlighted in the sidebar, the breadcrumb reads "… / Events · …", and the console is clean. Stop the test servers afterwards.
- [ ] **Step 5:** Report results, including that the real backend was not exercised.
