import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "New password · EXPER" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      headline={
        <>
          New
          <br />
          password.
        </>
      }
      subtext="Choose one you haven't used on EXPER before. We'll sign you in when you're done."
    >
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
