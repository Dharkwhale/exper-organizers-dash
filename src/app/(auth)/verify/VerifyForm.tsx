"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/auth/Button";
import { CodeInput } from "@/components/auth/CodeInput";
import { friendlyMessage, resendCode, verifyCode } from "@/lib/auth/api";
import { useStoredEmail } from "@/lib/auth/email-state";

const RESEND_SECONDS = 60;
const LOST_EMAIL = "We lost track of your email. Start again from sign up.";

function formatClock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function VerifyForm() {
  const router = useRouter();
  const email = useStoredEmail();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [invalid, setInvalid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);
  const working = useRef(false);

  const counting = seconds > 0;
  useEffect(() => {
    if (!counting) return;
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [counting]);

  async function verify(value: string) {
    if (working.current) return;
    if (value.length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    if (!email) {
      setError(LOST_EMAIL);
      return;
    }
    working.current = true;
    setBusy(true);
    const result = await verifyCode(email, value);
    working.current = false;
    setBusy(false);

    if (result.ok) {
      setError(undefined);
      setInvalid(false);
      router.push("/overview");
    } else if (result.code === "bad_code") {
      setInvalid(true);
      setError("That code isn't right. Try again.");
    } else {
      setError(friendlyMessage(result));
    }
  }

  async function resend() {
    if (working.current) return;
    if (!email) {
      setError(LOST_EMAIL);
      return;
    }
    working.current = true;
    setBusy(true);
    const result = await resendCode(email);
    working.current = false;
    setBusy(false);

    if (result.ok) {
      setSeconds(RESEND_SECONDS);
      setCode("");
      setError(undefined);
      setInvalid(false);
      setResent(true);
    } else {
      setError(friendlyMessage(result));
    }
  }

  return (
    <AuthCard title="Enter your code" step="Step 2 of 2">
      <div className="flex flex-col gap-4">
        <p className="text-[11px] text-muted">{`Sent to ${email || "your email"}`}</p>

        <CodeInput
          value={code}
          invalid={invalid}
          onChange={(next) => {
            setCode(next);
            setError(undefined);
            setInvalid(false);
          }}
          onComplete={verify}
        />

        {error ? (
          <p role="alert" className="text-[11px] text-danger">
            {error}
          </p>
        ) : (
          <p className="text-[11px] text-muted">
            The code expires in 15 minutes.
          </p>
        )}

        <div>
          <Button busy={busy} onClick={() => verify(code)}>
            Verify email
          </Button>
        </div>
        {resent ? (
          <p role="status" className="text-xs text-muted">
            Code sent again.
          </p>
        ) : null}

        <div className="flex items-center justify-between text-[11px] text-muted">
          {seconds > 0 ? (
            <span>{`Resend code in ${formatClock(seconds)}`}</span>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={busy}
              className="rounded text-fg underline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
            >
              Resend code
            </button>
          )}
          <Link href="/sign-up" className="hover:text-fg">
            Use a different email
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
