import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Sign in · EXPER" };

export default function SignInPage() {
  return (
    <AuthShell
      headline={
        <>
          Doors
          <br />
          open<span className="text-accent">.</span>
        </>
      }
      subtext="Sign in to run your events and see how each night went, prompt by prompt."
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
