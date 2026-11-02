# EXPER Auth Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the seven EXPER auth screens as working routes backed by a mocked, swappable auth layer.

**Architecture:** One route per screen under a `(auth)` route group, each page rendering a shared `AuthShell` and a small set of form primitives in `src/components/auth/`. Pure rules live in `src/lib/auth/validation.ts`; all "server" behaviour lives in `src/lib/auth/mock-auth.ts` so a real provider replaces one file. Form pages are client components; static chrome stays server-rendered where possible.

**Tech Stack:** Next 16.4.3, React 19.3, Tailwind v4, TypeScript 5.9, Geist fonts, Vitest + React Testing Library + jsdom (new dev deps).

**Spec:** `docs/superpowers/specs/2026-11-01-auth-screens-design.md`

## Global Constraints

- Next 16 has breaking changes: before writing routes/forms, read the relevant guide in `node_modules/next/dist/docs/01-app/` (AGENTS.md). `next.config.ts` has `cacheComponents: true` — code reading `searchParams`, `usePathname` or `sessionStorage` must sit in client components inside `<Suspense>` boundaries.
- Dark-only theme; remove the scaffold's `prefers-color-scheme` light/dark switch and the `Arial` body font (use Geist).
- Tokens in `globals.css` under `@theme`: near-black background, card surface ~`#1c1c1e`, lime accent ~`#d8f56b`, red for errors, muted gray secondary text.
- Layout: two columns on desktop (headline left, card right), stacked on mobile; no horizontal scroll at 375px.
- Headlines exactly: "Doors open.", "Start here.", "Almost in.", "Locked out?", "Check your inbox.", "New password."
- Routes exactly: `/sign-in`, `/sign-up`, `/verify`, `/forgot-password`, `/check-inbox`, `/reset-password`. The wrong-password screen is a state of `/sign-in`.
- Password rule copy: "At least 10 characters, with a number and a symbol."
- Mock outcomes: valid sign-in password `exper-demo-1!`; 3 attempts then lockout (copy: "N attempts left before sign-in pauses for 15 minutes."); valid code `482913`; ~600 ms latency; nothing persisted.
- Google/SSO buttons render but are inert. Out of scope: sessions/cookies, DB, email, middleware, rate limiting.
- Accessibility: labelled inputs, `aria-invalid` + `aria-describedby` on errors, visible focus ring, keyboard-operable code boxes.
- This directory is not a git repo. "Checkpoint" below means: run `npm test` and `npx tsc --noEmit`; if the user has run `git init`, also commit.

## Review Focus

1. Pasting non-digits or more than 6 characters into the code input — expect only the first 6 digits kept, junk ignored.
2. Double-clicking a submit button while a request is pending — expect one request, button disabled with busy state.
3. Email with surrounding whitespace or uppercase — expect trimmed and treated as valid; lockout counter keyed case-insensitively.
4. Opening `/verify`, `/check-inbox` or `/reset-password` directly with no email in state — expect a graceful fallback ("your email" copy), never a crash or "undefined".
5. Password containing emoji/multi-byte characters — expect length counted by characters the user sees, no crash in the strength meter.

---

### Task 1: Tooling, theme and root layout

**Files:**
- Modify: `package.json` (devDependencies + `"test": "vitest run"`), `src/app/globals.css`, `src/app/layout.tsx`
- Create: `vitest.config.ts`, `vitest.setup.ts`

**Interfaces:**
- Produces: Tailwind theme tokens `--color-bg`, `--color-surface`, `--color-accent`, `--color-danger`, `--color-muted`, usable as `bg-bg`, `bg-surface`, `text-accent`, `text-danger`, `text-muted`; `npm test` runs Vitest with jsdom and `@testing-library/jest-dom` matchers.

- [ ] **Step 1: Install** `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` as dev dependencies.
- [ ] **Step 2: Write `vitest.config.ts`** (react plugin, `environment: "jsdom"`, `setupFiles: ["./vitest.setup.ts"]`, `@/` alias matching `tsconfig.json` paths) and `vitest.setup.ts` importing `@testing-library/jest-dom/vitest`.
- [ ] **Step 3: Verify toolchain:** create a throwaway `src/smoke.test.ts` asserting `1 + 1` equals `2`, run `npm test`; expected PASS; delete the file.
- [ ] **Step 4: Rewrite `globals.css`:** keep `@import "tailwindcss"`; `@theme` defines the tokens above and `--font-sans`/`--font-mono` from Geist; `body` takes background/color from tokens; remove the media query and `Arial`.
- [ ] **Step 5: Update `layout.tsx`:** metadata title "EXPER", description "People first. Aggregate by design."; keep Geist font variables.
- [ ] **Step 6: Verify:** `npx tsc --noEmit` clean and `npm run build` succeeds (an earlier build failed on stale `.next` output; if it recurs, move `.next` aside and rebuild).

### Task 2: Validation rules

**Files:**
- Create: `src/lib/auth/validation.ts`
- Test: `src/lib/auth/validation.test.ts`

**Interfaces:**
- Produces:
  - `isEmail(value: string): boolean` — trims first.
  - `normalizeEmail(value: string): string` — trim + lowercase.
  - `type PasswordChecks = { length: boolean; number: boolean; symbol: boolean }`
  - `passwordChecks(password: string): PasswordChecks` — length counted in user-visible characters (`Array.from(password).length >= 10`).
  - `type PasswordStrength = "empty" | "weak" | "okay" | "strong"`
  - `passwordStrength(password: string): PasswordStrength` — `empty` for `""`; `strong` when all three checks pass and length ≥ 12; `okay` when all three pass; otherwise `weak`.

- [ ] **Step 1: Write failing tests:** `isEmail(" Tope@AfterHours.studio ")` is true; `isEmail("tope@")` and `isEmail("")` are false; `normalizeEmail(" Tope@AfterHours.studio ")` equals `"tope@afterhours.studio"`; `passwordChecks("abc")` all false; `passwordChecks("abcdefghi1!")` all true; `passwordChecks("😀".repeat(9) + "1!").length` is true (Review Focus 5); `passwordStrength` returns `"empty"` for `""`, `"weak"` for `"abcdefghij"`, `"okay"` for `"abcdefghi1!"`, `"strong"` for `"abcdefghijk1!"`.
- [ ] **Step 2: Run** `npx vitest run src/lib/auth/validation.test.ts`; expected FAIL (module missing).
- [ ] **Step 3: Implement** the functions above (symbol = any character that is not a letter, digit or whitespace).
- [ ] **Step 4: Run** the same command; expected PASS. Checkpoint.

### Task 3: Mock auth layer

**Files:**
- Create: `src/lib/auth/mock-auth.ts`
- Test: `src/lib/auth/mock-auth.test.ts`

**Interfaces:**
- Consumes: `normalizeEmail` (Task 2).
- Produces:
  - `type AuthResult = { ok: true } | { ok: false; code: "wrong_password" | "locked" | "bad_code" | "reused"; message: string; attemptsLeft?: number }`
  - `const VALID_PASSWORD = "exper-demo-1!"`, `const VALID_CODE = "482913"`, `const MAX_ATTEMPTS = 3`
  - `signIn(email: string, password: string): Promise<AuthResult>` — wrong password returns `wrong_password` with `attemptsLeft` (2, then 1); the third failure returns `locked`; success resets the counter; counter keyed by `normalizeEmail(email)`.
  - `signUp(input: { name: string; email: string; workspace: string; password: string }): Promise<AuthResult>` — always ok.
  - `verifyCode(code: string): Promise<AuthResult>` — ok iff `code === VALID_CODE`, else `bad_code`.
  - `requestReset(email: string): Promise<AuthResult>` — always ok.
  - `setPassword(password: string): Promise<AuthResult>` — `reused` if `password === VALID_PASSWORD`, else ok.
  - `resetMockState(): void` — clears attempt counters (tests only).
  - Latency `LATENCY_MS = 600`, skipped when `process.env.NODE_ENV === "test"`.

- [ ] **Step 1: Write failing tests:** two wrong passwords give `attemptsLeft` 2 then 1; a third gives `code: "locked"`; `"TOPE@x.io"` and `"tope@x.io"` share one counter (Review Focus 3); the correct password after one failure is ok and resets the counter; `verifyCode("482913")` ok and `verifyCode("000000")` gives `bad_code`; `setPassword(VALID_PASSWORD)` gives `reused`.
- [ ] **Step 2: Run** `npx vitest run src/lib/auth/mock-auth.test.ts`; expected FAIL.
- [ ] **Step 3: Implement** per Interfaces with a module-level `Map<string, number>` for failures. `wrong_password` message: "Wrong password for this email. Try again or reset it." (pages append the attempts line from `attemptsLeft`).
- [ ] **Step 4: Run** the same command; expected PASS. Checkpoint.

### Task 4: Form primitives

**Files:**
- Create: `src/components/auth/Button.tsx`, `Field.tsx`, `PasswordField.tsx`, `Checkbox.tsx`, `StrengthMeter.tsx`
- Test: `src/components/auth/PasswordField.test.tsx`

**Interfaces:**
- Consumes: `PasswordStrength` (Task 2).
- Produces:
  - `Button({ variant: "primary" | "secondary" | "pill"; busy?: boolean } & ButtonHTMLAttributes)` — `busy` sets `disabled` and `aria-busy`.
  - `Field({ label: string; error?: string; hint?: string } & InputHTMLAttributes)` — wires `id`, `aria-invalid`, `aria-describedby`.
  - `PasswordField(props: Omit<FieldProps, "type">)` — "Show"/"Hide" toggle button (`aria-pressed`) flipping input `type`.
  - `Checkbox({ label: ReactNode } & InputHTMLAttributes)` with lime check.
  - `StrengthMeter({ strength: PasswordStrength })` — 3-segment bar, label "Weak"/"Okay"/"Strong", `role="status"`.

- [ ] **Step 1: Write failing tests (PasswordField):** input starts `type="password"`; clicking "Show" makes it `type="text"` and the button reads "Hide"; an `error` prop sets `aria-invalid="true"` and links the message via `aria-describedby`.
- [ ] **Step 2: Run** `npx vitest run src/components/auth/PasswordField.test.tsx`; expected FAIL.
- [ ] **Step 3: Implement** the five components (client where stateful); lime focus ring on inputs, red border + helper text on error.
- [ ] **Step 4: Run** the same command; expected PASS. Checkpoint.

### Task 5: CodeInput

**Files:**
- Create: `src/components/auth/CodeInput.tsx`
- Test: `src/components/auth/CodeInput.test.tsx`

**Interfaces:**
- Produces: `CodeInput({ length?: number /* default 6 */; value: string; onChange: (value: string) => void; onComplete?: (value: string) => void; invalid?: boolean })` — controlled; renders `length` single-digit inputs labelled `aria-label="Digit N of 6"`.

- [ ] **Step 1: Write failing tests:** typing `"4"` focuses the next box and calls `onChange("4")`; backspace on an empty box moves focus to the previous box; pasting `"482913"` calls `onChange("482913")` and `onComplete("482913")`; pasting `"48-29 13xx"` keeps only `"482913"` (Review Focus 1); typing a letter is ignored; `invalid` sets `aria-invalid` on the boxes.
- [ ] **Step 2: Run** `npx vitest run src/components/auth/CodeInput.test.tsx`; expected FAIL.
- [ ] **Step 3: Implement** with a ref per box, `inputMode="numeric"`, `autoComplete="one-time-code"` on the first box; strip non-digits and truncate to `length`.
- [ ] **Step 4: Run** the same command; expected PASS. Checkpoint.

### Task 6: AuthShell, card, social buttons, email state

**Files:**
- Create: `src/components/auth/AuthShell.tsx`, `AuthCard.tsx`, `SocialButtons.tsx`, `src/lib/auth/email-state.ts`
- Test: `src/lib/auth/email-state.test.ts`
- Modify: `src/app/page.tsx` (replace scaffold with `redirect("/sign-in")`)

**Interfaces:**
- Produces:
  - `AuthShell({ headline: ReactNode; subtext?: ReactNode; children: ReactNode })` — logo "EXPER", top-right pill, footer ("People first. Aggregate by design." + Help/Privacy/Terms). The pill is "New to EXPER? Create account" → `/sign-up`, or "Have an account? Sign in" → `/sign-in` when the path is `/sign-up` or `/verify` (via `usePathname` in a small client child inside `<Suspense>`).
  - `AuthCard({ title: string; step?: string; children })` — dark rounded card; `step` renders top-right ("Step 1 of 2").
  - `SocialButtons({ verb: "Sign in" | "Sign up" })` — Google button always; SSO button only for "Sign in"; both inert.
  - `readEmail(): string` / `writeEmail(email: string): void` — `sessionStorage` key `exper.email`, wrapped in try/catch, `readEmail` returns `""` when unavailable.
- Each page renders its own `<AuthShell headline=...>`; no `(auth)/layout.tsx` is needed.

- [ ] **Step 1: Write failing tests (email-state):** round-trips an email; returns `""` when empty; returns `""` without throwing when `sessionStorage.getItem` throws.
- [ ] **Step 2: Run** `npx vitest run src/lib/auth/email-state.test.ts`; expected FAIL. **Step 3:** implement `email-state.ts`. **Step 4:** run; expected PASS.
- [ ] **Step 5: Implement** the shell, card and social buttons; replace the root `page.tsx` scaffold with the redirect.
- [ ] **Step 6: Verify:** `npx tsc --noEmit` clean. Checkpoint. (`/` redirects to `/sign-in`, which exists after Task 7.)

### Task 7: Sign in

**Files:**
- Create: `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/sign-in/SignInForm.tsx` (client)
- Test: `src/app/(auth)/sign-in/SignInForm.test.tsx`

**Interfaces:**
- Consumes: `signIn`, `MAX_ATTEMPTS` (Task 3); primitives and shell (Tasks 4, 6); `writeEmail`; `isEmail`, `normalizeEmail`.
- Produces: `/sign-in`, headline "Doors open.", subtext "Sign in to run your events and see how each night went.", email placeholder `tope@afterhours.studio`. On success it shows an inline lime "Signed in (demo)" notice (no destination route exists yet). `?reset=1` shows "Password updated. Sign in with your new one." Third failed attempt navigates to `/forgot-password`.

- [ ] **Step 1: Write failing tests (mock `next/navigation`):** an invalid email blocks submit with an error and never calls `signIn`; a wrong password shows "Wrong password for this email. Try again or reset it." plus "2 attempts left before sign-in pauses for 15 minutes." and marks the password field `aria-invalid`; the third failure navigates to `/forgot-password`; double-clicking "Sign in" calls `signIn` once (Review Focus 2); `" Tope@X.io "` reaches `signIn` trimmed (Review Focus 3).
- [ ] **Step 2: Run** `npx vitest run "src/app/(auth)/sign-in"`; expected FAIL.
- [ ] **Step 3: Implement** the form; the page wraps it in `<Suspense>` for `useSearchParams`.
- [ ] **Step 4: Run** tests; expected PASS. **Step 5:** load `/sign-in` and the wrong-password state in `npm run dev` and compare with the mockup. Checkpoint.

### Task 8: Sign up and verify

**Files:**
- Create: `src/app/(auth)/sign-up/page.tsx`, `SignUpForm.tsx`, `src/app/(auth)/verify/page.tsx`, `VerifyForm.tsx`
- Test: `SignUpForm.test.tsx`, `VerifyForm.test.tsx` beside each form

**Interfaces:**
- Consumes: `signUp`, `verifyCode` (Task 3); `passwordChecks`, `passwordStrength`, `isEmail`, `normalizeEmail` (Task 2); `StrengthMeter`, `CodeInput`, `Checkbox`; `writeEmail`/`readEmail`.
- Produces: `/sign-up` ("Start here.", "Create an organiser account. Your workspace is ready in about a minute.", step "Step 1 of 2"; fields Full name, Work email, Workspace name, Password; hint "At least 10 characters, with a number and a symbol."; checkbox "I agree to the Terms and Privacy Policy"; buttons "Create account" and "Sign up with Google") and `/verify` ("Almost in.", "We sent a 6-digit code to your email. Enter it to finish setting up your workspace.", step "Step 2 of 2", "Sent to {email}" or "Sent to your email" when none (Review Focus 4), button "Verify email", "Use a different email" → `/sign-up`).

- [ ] **Step 1: Write failing tests (sign-up):** submit is blocked until name, valid email, workspace, password rule and Terms are all satisfied; typing `"abcdefghijk1!"` shows "Strong"; success stores the normalized email and navigates to `/verify`.
- [ ] **Step 2: Write failing tests (verify):** entering `482913` calls `verifyCode` and shows a lime "Verified (demo)" notice; entering `000000` marks the boxes invalid with "That code isn't right. Try again."; with fake timers the label "Resend code in 0:52" counts down and becomes an enabled "Resend code" button at 0:00.
- [ ] **Step 3: Run** `npx vitest run "src/app/(auth)/sign-up" "src/app/(auth)/verify"`; expected FAIL.
- [ ] **Step 4: Implement** both pages (forms in `<Suspense>` where `useSearchParams` is used).
- [ ] **Step 5: Run** tests; expected PASS. Compare with the mockup. Checkpoint.

### Task 9: Forgot password and check inbox

**Files:**
- Create: `src/app/(auth)/forgot-password/page.tsx`, `ForgotForm.tsx`, `src/app/(auth)/check-inbox/page.tsx`, `CheckInbox.tsx`
- Test: `ForgotForm.test.tsx`, `CheckInbox.test.tsx`

**Interfaces:**
- Consumes: `requestReset` (Task 3), `readEmail`/`writeEmail`, `isEmail`, `normalizeEmail`, `Button`, `AuthCard`.
- Produces: `/forgot-password` ("Locked out?", "It happens. We'll email you a link to set a new password.", card "Reset password", buttons "Send reset link" and "Back to sign in", footnote "No longer have access to that inbox? Ask your workspace owner to change your email from Team settings.") and `/check-inbox` ("Check your inbox.", "We sent a reset link to {email}. It works once and expires in 30 minutes.", card "Didn't get it?" with tips "Check spam or promotions", "Check the address", "Wait a minute", buttons "Resend link" and "Back to sign in").

- [ ] **Step 1: Write failing tests:** an invalid email blocks `requestReset`; a valid email stores it and navigates to `/check-inbox`; `/check-inbox` with empty storage renders "your email" and never "undefined" (Review Focus 4); "Resend link" calls `requestReset` once and shows a lime "Link sent again." notice.
- [ ] **Step 2: Run** `npx vitest run "src/app/(auth)/forgot-password" "src/app/(auth)/check-inbox"`; expected FAIL.
- [ ] **Step 3: Implement** both pages. **Step 4:** run; expected PASS. Compare with the mockup. Checkpoint.

### Task 10: Set a new password

**Files:**
- Create: `src/app/(auth)/reset-password/page.tsx`, `ResetForm.tsx`
- Test: `src/app/(auth)/reset-password/ResetForm.test.tsx`

**Interfaces:**
- Consumes: `setPassword` (Task 3), `passwordChecks` (Task 2), `PasswordField`, `Checkbox`, `Button`.
- Produces: `/reset-password` ("New password.", "Choose one you haven't used on EXPER before. We'll sign you in when you're done.", card "Set a new password"). Checklist rows: "10+ characters", "A number", "A symbol", "Not used before" (turns red when `setPassword` returns `reused`). Fields: new password, "Confirm password". Checked checkbox "Sign out of other devices". Button "Update password". Success navigates to `/sign-in?reset=1`.

- [ ] **Step 1: Write failing tests:** checklist rows turn lime as `"abcdefghi1!"` is typed; a mismatched confirm shows "Passwords don't match." and blocks submit; submitting `exper-demo-1!` marks "Not used before" failed and does not navigate; a valid new password navigates to `/sign-in?reset=1`.
- [ ] **Step 2: Run** `npx vitest run "src/app/(auth)/reset-password"`; expected FAIL.
- [ ] **Step 3: Implement. Step 4:** run; expected PASS. Compare with the mockup. Checkpoint.

### Task 11: Final verification

**Files:** none (fix defects only where found).

- [ ] **Step 1:** `npm test` all pass; `npx tsc --noEmit` clean; `npm run lint` clean.
- [ ] **Step 2:** `npm run build` succeeds and lists all six routes.
- [ ] **Step 3:** In `npm run dev`, walk every flow at 1440px and 375px: sign-in success; sign-in wrong password ×3 → forgot-password; sign-up → verify (wrong code, then `482913`); forgot → check-inbox → resend; reset-password (reused, mismatch, success → `/sign-in?reset=1`). Confirm each screen against the mockup, no horizontal scroll at 375px, and keyboard-only completion of sign-in and verify.
- [ ] **Step 4:** Report any deviation from the mockup honestly, naming the screen.
