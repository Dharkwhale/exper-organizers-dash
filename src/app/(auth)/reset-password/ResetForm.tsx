"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button, buttonClasses } from "@/components/auth/Button";
import { Checkbox } from "@/components/auth/Checkbox";
import { PasswordField } from "@/components/auth/PasswordField";
import { checkResetLink, friendlyMessage, setPassword } from "@/lib/auth/api";
import { passwordChecks } from "@/lib/auth/validation";

const LINK_EXPIRED = "This reset link has expired or was already used.";
const SESSION_EXPIRED = "Your reset session expired. Request a new link.";

type LinkState =
  | { status: "checking" }
  | { status: "ready"; email: string }
  | { status: "expired"; message: string };

type RuleState = "met" | "unmet" | "failed";

function Rule({ label, state }: { label: string; state: RuleState }) {
  const color =
    state === "met"
      ? "text-accent"
      : state === "failed"
        ? "text-danger"
        : "text-muted";
  return (
    <li data-state={state} className={`flex items-center gap-2 text-[11px] ${color}`}>
      <span
        aria-hidden
        className={`flex size-3.5 items-center justify-center rounded-full border text-[9px] leading-none ${
          state === "met"
            ? "border-accent bg-accent text-accent-fg"
            : state === "failed"
              ? "border-danger"
              : "border-border"
        }`}
      >
        {state === "met" ? "✓" : state === "failed" ? "✕" : ""}
      </span>
      {label}
    </li>
  );
}

function ExpiredCard({ message }: { message: string }) {
  return (
    <AuthCard title="Reset link">
      <div className="flex flex-col gap-4">
        <p role="alert" className="text-xs text-muted">
          {message}
        </p>
        <div>
          <Link href="/forgot-password" className={buttonClasses("primary")}>
            Request a new link
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

export function ResetForm() {
  const tokenHash = useSearchParams().get("token_hash");
  const [link, setLink] = useState<LinkState>(
    tokenHash
      ? { status: "checking" }
      : { status: "expired", message: LINK_EXPIRED },
  );
  // The link is single-use, so it is checked once even if effects run twice in dev.
  const checkedHash = useRef<string | null>(null);

  useEffect(() => {
    if (!tokenHash || checkedHash.current === tokenHash) return;
    checkedHash.current = tokenHash;
    checkResetLink(tokenHash).then((result) => {
      if (result.ok) {
        setLink({ status: "ready", email: result.data.email });
      } else {
        setLink({
          status: "expired",
          message:
            result.code === "link_expired" ? LINK_EXPIRED : friendlyMessage(result),
        });
      }
    });
  }, [tokenHash]);

  if (link.status === "checking") {
    return (
      <AuthCard title="Reset link">
        <p role="status" className="text-xs text-muted">
          Checking your link…
        </p>
      </AuthCard>
    );
  }
  if (link.status === "expired") return <ExpiredCard message={link.message} />;

  return (
    <NewPasswordForm
      email={link.email}
      onSessionExpired={() =>
        setLink({ status: "expired", message: SESSION_EXPIRED })
      }
    />
  );
}

function NewPasswordForm({
  email,
  onSessionExpired,
}: {
  email: string;
  onSessionExpired: () => void;
}) {
  const router = useRouter();
  const [password, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [rejected, setRejected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  const checks = passwordChecks(password);
  const rulesMet = checks.length && checks.number && checks.symbol;
  const state = (met: boolean): RuleState => (met ? "met" : "unmet");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;

    setPasswordError(undefined);
    setConfirmError(undefined);
    setFormError(undefined);
    if (!rulesMet) {
      setPasswordError("Use at least 10 characters, with a number and a symbol.");
      return;
    }
    if (confirm !== password) {
      setConfirmError("Passwords don't match.");
      return;
    }

    submitting.current = true;
    setBusy(true);
    const result = await setPassword(password, signOutOthers);
    submitting.current = false;
    setBusy(false);

    if (result.ok) {
      router.push("/sign-in?reset=1");
    } else if (result.code === "password_refused") {
      setRejected(password);
      setPasswordError(result.message);
    } else if (result.code === "session_expired") {
      onSessionExpired();
    } else {
      setFormError(friendlyMessage(result));
    }
  }

  return (
    <AuthCard title="Set a new password">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <p className="text-[11px] text-muted">
          {`Resetting the password for ${email}`}
        </p>
        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setNewPassword(event.target.value)}
          error={passwordError}
        />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2" aria-label="Password rules">
          <Rule label="10+ characters" state={state(checks.length)} />
          <Rule label="A number" state={state(checks.number)} />
          <Rule label="A symbol" state={state(checks.symbol)} />
          <Rule
            label="Not used before"
            state={rejected !== null && rejected === password ? "failed" : "unmet"}
          />
        </ul>
        <PasswordField
          label="Confirm password"
          name="confirm"
          autoComplete="new-password"
          placeholder="Type it again"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={confirmError}
        />
        <Checkbox
          name="signOutOthers"
          checked={signOutOthers}
          onChange={(event) => setSignOutOthers(event.target.checked)}
          label="Sign out of other devices"
        />
        {formError ? (
          <p role="alert" className="text-[11px] text-danger">
            {formError}
          </p>
        ) : null}
        <div>
          <Button type="submit" busy={busy}>
            Update password
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
