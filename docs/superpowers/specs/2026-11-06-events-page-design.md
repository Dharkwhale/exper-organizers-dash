# Events page — design

Date: 2026-11-06

## Intent

A signed-in organiser opens `/events` and sees every event they run, filtered by Upcoming / Live / Past / Drafts, searchable by name or city, and filterable by city. It matches the supplied mockup, inside the existing app shell. Data is real wherever the backend supplies it (hybrid approach, as for Overview).

## Scope

In: list, tabs, search, city filter, sidebar link, route guard, skeleton, error/empty states.
Out (disabled placeholders, `aria-disabled`): Create event, Calendar view, Manage event. Pagination beyond 50 events. Token refresh.

## Data (real)

All calls go through `backendFetch` with the httpOnly `exper_at` bearer; tokens never reach the browser.

- `GET /organizer/experiences` → `{data: [...]}`, newest first, up to 200: `id, title, status, startsAt, endsAt, venue{name,city}`.
- `GET /organizer/experiences/:id` → adds `coverImageUrl, timezone, capacity`, `ticketTypes[].price.currency`. Currency = first ticket type's currency.
- `GET /organizer/experiences/:id/guests?page=1&limit=1` → `total` = tickets issued ("sold").

Nothing is mocked except a placeholder tile when an event has no cover image.

## Server: `src/lib/server/events.ts`

`getEvents(now?: Date): Promise<EventsResult>`

- Read token first, then the clock (`now ?? new Date()` after the cookie read — required by `cacheComponents`).
- No token → `unauthorized`. 401 → `unauthorized`, 403 → `forbidden`, other failure of the list call → `error`.
- Per event, in parallel: detail + guest total. If either fails the row is kept with fallbacks: timezone `UTC`, no cover, capacity/sold `null` (rendered "—"), currency omitted.
- Cap of 50 events (the 50 newest, as the backend orders them): data carries `truncated: boolean`; the page says "Showing the 50 most recent events." when true.
- Data also carries `nowIso` (the clock used), so the client classifies tabs with the same instant the server used.

## Pure logic: `src/lib/events/`

- `types.ts`: `EventRow`, `EventTab = "upcoming" | "live" | "past" | "drafts"`, `EventsResult`.
- `classify.ts`: `tabFor(event, now)`: status ≠ `published` → drafts; now < startsAt → upcoming; startsAt ≤ now ≤ endsAt → live; else past. `sortFor(tab, events)`: upcoming soonest first, past most recent first, live/drafts by startsAt.
- `filter.ts`: `filterEvents(events, {tab, query, city}, now)`; query is a case-insensitive substring of title or city; `cities(events)` returns sorted unique city names.
- `format.ts`: `formatEventRange(startsAt, endsAt, timeZone)` → `"31 Oct 2026 · 19:00-23:30"`, with `" (+1 day)"` / `" (+2 days)"` when the end falls on a later local date than the start; invalid zone falls back to UTC. Reuses `utcOffset` from `src/lib/overview/format.ts` for the "Africa/Lagos · UTC+01:00" line.

## UI

- `src/app/(app)/events/page.tsx` (Suspense + `EventsSkeleton`, metadata "Events · EXPER"), `EventsContent.tsx` (async server component: forbidden / error / empty states, passes rows to the client).
- `EventsBrowser.tsx` (client): tab, query and city state; the clock is passed from the server as an ISO string so rendering is deterministic.
- `EventRowItem.tsx`: cover thumbnail, title, "venue · city", date/time line, "zone · UTC±hh:mm", "sold / capacity" with "Event currency · XXX" beneath, disabled "Manage event".
- Header: "Your events", subtitle, disabled "Create event"; tab pills (active one highlighted); search field; "All cities" select; disabled "Calendar view". Section heading "<Tab> events / N events". Footer note: "Timezone changes are saved per event; attendee calendars use the selected IANA timezone."
- States: no events at all; empty tab; no search/city matches; forbidden; error.
- Sidebar: Events becomes a real link (`/events`, `aria-current` when active). Breadcrumb in `AppShell` follows the route. `proxy.ts` matcher also covers `/events/:path*`.

## Testing

- Unit: `tabFor` (before start, exactly at start, exactly at end, after end, draft), `sortFor`, `filterEvents`, `cities`, `getEvents` (token absence, 401/403/other, per-row fallbacks, 50 cap, clock read after cookies).
- Component: tabs switch the list and counts, search narrows, city filter narrows, empty/no-match messages, disabled controls are `aria-disabled`, sidebar link and proxy guard.
- Gates: full Vitest suite, `tsc`, eslint, `npm run build`, then a browser check against the local stand-in backend extended with the list route.

## Caveats

- "Sold" is tickets issued (guest total), not revenue or paid orders only.
- Not verifiable here: the real backend with a real organiser account.
