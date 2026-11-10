"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/auth/Button";
import { Checkbox } from "@/components/auth/Checkbox";
import { Field } from "@/components/auth/Field";
import { PasswordField } from "@/components/auth/PasswordField";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { friendlyMessage, signIn } from "@/lib/auth/api";
import { writeEmail } from "@/lib/auth/email-state";
import { isEmail, normalizeEmail } from "@/lib/auth/validation";

export function SignInForm() {
  const router = useRouter();
  const justReset = useSearchParams().get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const submitting = useRef(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;

    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);

    if (!isEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setPasswordError("Enter your password.");
      return;
    }

    submitting.current = true;
    setBusy(true);
    const clean = normalizeEmail(email);
    const result = await signIn(clean, password);
    submitting.current = false;
    setBusy(false);

    if (result.ok) {
      writeEmail(clean);
      router.push("/overview");
      return;
    }
    switch (result.code) {
      case "invalid_credentials":
        setPasswordError(`${result.message}. Try again or reset it.`);
        break;
      case "not_verified":
        writeEmail(clean);
        router.push("/verify");
        break;
      case "rate_limited":
        setPasswordError(friendlyMessage(result));
        break;
      default:
        setFormError(friendlyMessage(result));
    }
  }

  return (
    <AuthCard title="Sign in">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {justReset ? (
          <p role="status" className="text-xs text-accent">
            Password updated. Sign in with your new one.
          </p>
        ) : null}

        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="tope@afterhours.studio"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError}
          labelAside={
            <Link
              href="/forgot-password"
              className="text-[11px] text-muted hover:text-fg"
            >
              Forgot password?
            </Link>
          }
        />

        <Checkbox
          name="keep"
          defaultChecked
          label="Keep me signed in on this device"
        />

        <div>
          <Button type="submit" busy={busy}>
            Sign in
          </Button>
        </div>
        {formError ? (
          <p role="alert" className="text-[11px] text-danger">
            {formError}
          </p>
        ) : null}

        <div className="pt-1">
          <SocialButtons verb="Sign in" />
        </div>
      </form>
    </AuthCard>
  );
}
