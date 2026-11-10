# Overview dashboard (home) — design

Date: 2026-11-02. Builds the signed-in "Overview" page from the mockup. Hybrid data: real backend where an endpoint exists, typed mock elsewhere.

## Goal and success criteria

After sign-in the organiser lands on `/overview` and sees their workspace, their real events, and the live (or next) event, in the same dark visual language as the auth screens. Done when:

- Signing in goes to `/overview`; `/` redirects there; no session cookie → `/sign-in`.
- Workspace name, user name, events, hero event details and the check-in count come from the backend.
- Reactions sparkline, "active in last 5 minutes", the attention queue and team activity come from one clearly marked mock module.
- Empty, loading and error states exist; all tests, tsc and lint pass.

## Out of scope

Every other sidebar page, Create event / Open Live Control / Check in guests destinations, token refresh, sign-out, Google sign-in, per-event sold counts, team features.

## Architecture

```
browser → /overview (server components)
            └─ getOverview() ─ backendFetch(bearer from exper_at) ─ BACKEND_URL/api/v1/organizer/…
                             └─ mockOverview() (marked mock)
```

Server components call the backend directly with the httpOnly `exper_at` cookie, so tokens never reach the browser and no new route handlers are needed. This is the same BFF boundary as auth.

### Real endpoints used

| Need | Endpoint |
| --- | --- |
| User, roles, workspace, event list | `GET /organizer/me` |
| Hero event: cover, address, timezone, capacity | `GET /organizer/experiences/:id` |
| Checked-in count and attendee total | `GET /organizer/experiences/:id/guests` (count `checkedInAt`, `total` from the page envelope) |

### Mock (single module `src/lib/overview/mock.ts`, each field commented `MOCK: no endpoint`)

Tonight's room series and mood label, reaction count, "active in the last 5 minutes", attention items, team activity, the role line "Owner · All events".

### Selection rules (pure functions, unit-tested)

- **Hero**: a published event with `startsAt <= now < endsAt` (earliest start if several). Otherwise the next upcoming published event, shown with an "UP NEXT" badge instead of "LIVE NOW". Otherwise an empty state.
- **Coming up**: published events with `startsAt > now`, excluding the hero, ascending, first 4; header shows the count. Each row: title, `date · time · venue · city`. The "places sold / capacity" part of the mockup is omitted: it needs a per-event sold count that no endpoint gives.
- Draft events appear nowhere in "Coming up". Drafts are surfaced only in the attention queue, and that queue is mock for now.
- Times are formatted in the event's own `timezone`.

### Auth guard

`src/proxy.ts` (Next 16) redirects `/overview` to `/sign-in` when `exper_at` is absent. A backend 401 during `getOverview()` also redirects to `/sign-in` (the token expired and refresh is not built). A 403 ("not an organizer") shows an error card, not a redirect loop.

## UI structure

- Route group `src/app/(app)/` with `layout.tsx` (shell) and `overview/page.tsx`.
- `AppShell`: left sidebar plus top bar with the breadcrumb `workspace / Overview · user`. Sidebar: logo, workspace block, nav (Overview active; the rest rendered as `aria-disabled` items, not links), user block, "Help & support". Below `lg` the sidebar collapses to a top bar with a menu button.
- Content components in `src/components/overview/`: `PageHeading`, `LiveEventCard`, `ComingUp`, `RoomPulse` (inline-SVG sparkline, no chart library), `AttentionList`, `TeamActivity`. Shared `Card` surface.
- Create event, Open Live Control, Check in guests render as `aria-disabled` buttons until their routes exist.
- Date line "Sunday, 25 October 2026" is today's date. The mockup's strapline is kept verbatim.
- Data loads in a server component inside `<Suspense>` (cacheComponents); the fallback is skeleton cards. A failed fetch shows an inline error card with a retry link, and the shell still renders.

## Testing

TDD. Unit: selection rules (live / upcoming / empty, ordering, the 4-row cap, timezone formatting), `getOverview()` against a stubbed `fetch` (success, 401 → redirect signal, 403, network failure, check-in counting across pages), sparkline path builder. Component tests: each card in populated and empty states, nav disabled semantics. Sign-in success now navigates to `/overview` (update the existing SignInForm test).

## Risks and flags

- Check-in count pages through `/guests`; the plan must read the backend's page-size cap and bound the number of pages (large events). If capped, show "1,216+" rather than a wrong number.
- Backend `GET /organizer/me` returns up to 200 events, with no event-level capacity; hero capacity needs the detail call (one extra request).
- `Africa/Lagos` formats as "GMT+1" with `Intl`; the mockup says "WAT". Use a small zone-label map for the zones in the mockup, falling back to Intl.
