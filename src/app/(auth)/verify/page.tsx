import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyForm } from "./VerifyForm";

export const metadata: Metadata = { title: "Verify email · EXPER" };

export default function VerifyPage() {
  return (
    <AuthShell
      headline={
        <>
          Almost
          <br />
          in.
        </>
      }
      subtext="We sent a 6-digit code to your email. Enter it to finish setting up your workspace."
    >
      <VerifyForm />
    </AuthShell>
  );
}
