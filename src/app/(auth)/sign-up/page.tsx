import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = { title: "Create account · EXPER" };

export default function SignUpPage() {
  return (
    <AuthShell
      headline={
        <>
          Start
          <br />
          here.
        </>
      }
      subtext="Create an organiser account. Your workspace is ready in about a minute."
    >
      <SignUpForm />
    </AuthShell>
  );
}
