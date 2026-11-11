"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button, buttonClasses } from "@/components/auth/Button";
import { Field } from "@/components/auth/Field";
import { friendlyMessage, requestReset } from "@/lib/auth/api";
import { writeEmail } from "@/lib/auth/email-state";
import { isEmail, normalizeEmail } from "@/lib/auth/validation";
import { useOnShow } from "@/lib/use-on-show";

export function ForgotForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  // Coming back to this page: not stuck busy.
  useOnShow(() => {
    submitting.current = false;
    setBusy(false);
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;

    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);

    submitting.current = true;
    setBusy(true);
    const clean = normalizeEmail(email);
    const result = await requestReset(clean);
    if (!result.ok) {
      submitting.current = false;
      setBusy(false);
      setError(friendlyMessage(result));
      return;
    }
    // Stay busy until the next page arrives.
    writeEmail(clean);
    router.push("/check-inbox");
  }

  return (
    <AuthCard title="Reset password">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="tope@afterhours.studio"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" busy={busy}>
            Send reset link
          </Button>
          <Link href="/sign-in" className={buttonClasses("secondary")}>
            Back to sign in
          </Link>
        </div>
        <p className="text-[11px] leading-relaxed text-muted">
          No longer have access to that inbox? Ask your workspace owner to
          change your email from Team settings.
        </p>
      </form>
    </AuthCard>
  );
}
