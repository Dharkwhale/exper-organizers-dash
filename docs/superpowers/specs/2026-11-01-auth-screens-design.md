# EXPER Auth Screens — Design

Date: 2026-11-01
Status: Awaiting spec review

## Goal

Build the seven EXPER authentication screens from the provided mockup as working pages in this Next.js app (Next 16.4.3, React 19, Tailwind v4), backed by a **mocked** auth flow. Success: every screen and state in the mockup is reachable by navigating the app, matches the mockup visually at desktop and phone widths, and the mock layer can later be replaced by a real provider without touching UI code.

## Scope

In scope:
- Screens: Sign in, Sign in (wrong-password error state), Create account (step 1 of 2), Enter code (step 2 of 2), Reset password (also covers the "locked out" state), Check your inbox, Set a new password.
- Form validation, show/hide password, strength meter, 6-box code input, resend countdown.
- A stub auth layer with deterministic outcomes.

Out of scope: real sessions/cookies, database, email delivery, Google/SSO (buttons render but are inert), route protection/middleware, rate limiting.

## Approach

One route per screen, shared components. The sign-in error is a state of `/sign-in`, not a route. Rejected: a single `/auth` page with a client state machine (no deep links, no back button, reset links can't land on a page) and parallel/intercepting routes (overkill).

## Structure

```
src/app/(auth)/
  layout.tsx              AuthShell: logo, top-right switch pill, footer links
  sign-in/page.tsx
  sign-up/page.tsx        step 1 of 2
  verify/page.tsx         step 2 of 2
  forgot-password/page.tsx
  check-inbox/page.tsx
  reset-password/page.tsx
src/components/auth/      AuthCard, Field, PasswordField, StrengthMeter,
                          CodeInput, Button, Checkbox, SocialButtons
src/lib/auth/
  validation.ts           pure rules (strength score, password checklist, email)
  mock-auth.ts            stub async API
```

The shell's top-right pill is "Create account" on sign-in-side pages and "Sign in" on sign-up-side pages. Headline and subtext are per-page props: "Doors open.", "Start here.", "Almost in.", "Locked out?", "Check your inbox.", "New password."

## Visual system

Tokens in `globals.css` under `@theme`: near-black background, card surface ~`#1c1c1e`, lime accent ~`#d8f56b` (primary buttons, focus rings, success checks), red for errors, muted gray secondary text. Dark-only; the scaffold's light/dark switch is removed. Geist bold, tight tracking, large `clamp()` headline. Two columns on desktop (headline left, card right); stacked on mobile. The `Arial` body font in the scaffold is replaced by Geist.

## Mocked flow (`mock-auth.ts`)

Async functions `signIn`, `signUp`, `verifyCode`, `requestReset`, `setPassword`, each with ~600 ms latency and deterministic results:
- `signIn`: a fixed valid password succeeds; any other fails with "Wrong password for this email. Try again or reset it. N attempts left before sign-in pauses for 15 minutes." The third failure routes to the locked state (`/forgot-password`).
- `verifyCode`: `482913` succeeds; anything else fails.
- Nothing is persisted. The email is carried between steps via query param or `sessionStorage`.

Replacing the provider means replacing only this file; UI depends on its function signatures.

## Behaviour per screen

- **Sign in:** email, password (show/hide), "Keep me signed in", "Forgot password?", Google/SSO buttons (inert).
- **Sign up:** full name, work email, workspace name, password with live strength meter and the "at least 10 characters, with a number and a symbol" rule; Terms/Privacy checkbox required; continues to `/verify`.
- **Verify:** 6 single-digit boxes, auto-advance, backspace, full-code paste; "Resend code in 0:52" countdown; "Use a different email".
- **Forgot password / Check inbox:** email → "Didn't get it?" tips card with Resend and Back.
- **Reset password:** live checklist (10+ characters, a number, a symbol, not used before), confirm field, "Sign out of other devices"; on success to `/sign-in` with a success note.
- **Accessibility:** labelled inputs, `aria-invalid` and `aria-describedby` for errors, visible focus ring, keyboard-operable code boxes.

## Testing

Add Vitest + React Testing Library (dev dependencies). Unit tests: `validation.ts` (strength score, password rules), `mock-auth.ts` (attempt counting, lockout, code check). Component tests: `CodeInput` (paste, backspace, auto-advance), `PasswordField` (toggle). Manual pass of all seven screens against the mockup at desktop and phone widths.

## Open notes

- Project is not a git repository, so this spec is saved but not committed.
- Next 16 has breaking changes; implementation must consult `node_modules/next/dist/docs/` (per AGENTS.md) before writing routes and forms.
