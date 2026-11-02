"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button, buttonClasses } from "@/components/auth/Button";
import { friendlyMessage, requestReset } from "@/lib/auth/api";
import { useStoredEmail } from "@/lib/auth/email-state";

const TIPS = [
  {
    title: "Check spam or promotions",
    body: "Recent emails sometimes land there first.",
  },
  {
    title: "Check the address",
    body: "Use the email you signed up with.",
  },
  {
    title: "Wait a minute",
    body: "Delivery can take up to 60 seconds.",
  },
];

export function InboxMessage() {
  const email = useStoredEmail();
  return (
    <>{`We sent a reset link to ${email || "your email"}. It works once and expires in 30 minutes.`}</>
  );
}

export function CheckInbox() {
  const email = useStoredEmail();
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string>();
  const sending = useRef(false);

  async function resend() {
    if (sending.current) return;
    setResent(false);
    if (!email) {
      setError("We don't have your email. Go back and enter it again.");
      return;
    }
    setError(undefined);
    sending.current = true;
    setBusy(true);
    const result = await requestReset(email);
    sending.current = false;
    setBusy(false);
    if (result.ok) setResent(true);
    else setError(friendlyMessage(result));
  }

  return (
    <AuthCard title="Didn't get it?">
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {TIPS.map((tip) => (
            <li key={tip.title} className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold">{tip.title}</span>
              <span className="text-[11px] text-muted">{tip.body}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-2">
          <Button busy={busy} onClick={resend}>
            Resend link
          </Button>
          <Link href="/sign-in" className={buttonClasses("secondary")}>
            Back to sign in
          </Link>
        </div>
        {resent ? (
          <p role="status" className="text-xs text-accent">
            Link sent again.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-[11px] text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </AuthCard>
  );
}
