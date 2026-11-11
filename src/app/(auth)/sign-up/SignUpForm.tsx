"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/auth/Button";
import { Checkbox } from "@/components/auth/Checkbox";
import { Field } from "@/components/auth/Field";
import { PasswordField } from "@/components/auth/PasswordField";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { StrengthMeter } from "@/components/auth/StrengthMeter";
import {
  friendlyMessage,
  signUp,
  signUpWithGoogle,
  type GoogleCredential,
} from "@/lib/auth/api";
import { useOnShow } from "@/lib/use-on-show";
import { writeEmail } from "@/lib/auth/email-state";
import {
  isEmail,
  normalizeEmail,
  passwordChecks,
  passwordStrength,
} from "@/lib/auth/validation";

type Errors = Partial<
  Record<"name" | "email" | "workspace" | "password" | "terms", string>
>;

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  // Coming back to this page: not stuck busy, and no old password.
  useOnShow(() => {
    submitting.current = false;
    setBusy(false);
    setPassword("");
  });

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your full name.";
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (!workspace.trim()) next.workspace = "Name your workspace.";
    const checks = passwordChecks(password);
    if (!(checks.length && checks.number && checks.symbol)) {
      next.password = "Use at least 10 characters, with a number and a symbol.";
    }
    if (!agreed) next.terms = "Agree to the Terms to continue.";
    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;

    setFormError(undefined);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    submitting.current = true;
    setBusy(true);
    const clean = normalizeEmail(email);
    const result = await signUp({
      fullName: name.trim(),
      email: clean,
      workspaceName: workspace.trim(),
      password,
      acceptedTerms: agreed,
    });
    // On success the button stays busy until the next page arrives.
    if (!result.ok) {
      submitting.current = false;
      setBusy(false);
    }

    if (result.ok) {
      writeEmail(clean);
      router.push("/verify");
    } else if (result.code === "email_taken") {
      setErrors({ email: result.message });
    } else {
      setFormError(friendlyMessage(result));
    }
  }

  // Google signs the person up on its own, so the two things it needs from the
  // form (a workspace name and the Terms) have to be in before it can be used.
  const googleReady = workspace.trim().length >= 2 && agreed;

  async function handleGoogle(credential: GoogleCredential) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setFormError(undefined);

    const result = await signUpWithGoogle({
      ...credential,
      workspaceName: workspace.trim(),
      acceptedTerms: agreed,
    });
    // Google has verified the email, so there is no code step: straight in.
    if (result.ok) {
      router.push("/overview");
      return;
    }
    submitting.current = false;
    setBusy(false);
    setFormError(friendlyMessage(result));
  }

  return (
    <AuthCard title="Create account" step="Step 1 of 2">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Tope Adewale"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <Field
          label="Work email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@yourstudio.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Field
          label="Workspace name"
          name="workspace"
          autoComplete="organization"
          placeholder="e.g. Afterhours studio"
          hint="Usually your company or collective. You can change it later."
          value={workspace}
          onChange={(event) => setWorkspace(event.target.value)}
          error={errors.workspace}
        />
        <div className="flex flex-col gap-2">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            hint="At least 10 characters, with a number and a symbol."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          <StrengthMeter strength={passwordStrength(password)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Checkbox
            name="terms"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            aria-invalid={errors.terms ? true : undefined}
            label={
              <>
                I agree to the{" "}
                <Link href="#" className="underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline">
                  Privacy Policy
                </Link>
              </>
            }
          />
          {errors.terms ? (
            <p role="alert" className="text-[11px] text-danger">
              {errors.terms}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p role="alert" className="text-[11px] text-danger">
            {formError}
          </p>
        ) : null}

        <div>
          <Button type="submit" busy={busy} className="w-full py-3.5">
            Create account
          </Button>
        </div>
        <SocialButtons
          verb="Sign up"
          onGoogle={handleGoogle}
          googleDisabled={!googleReady}
          googleHint="Add your workspace name and agree to the Terms first."
        />
      </form>
    </AuthCard>
  );
}
