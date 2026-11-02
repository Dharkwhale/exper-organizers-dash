import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Reset password · EXPER" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      headline={
        <>
          Locked
          <br />
          out?
        </>
      }
      subtext="It happens. We'll email you a link to set a new password."
    >
      <ForgotForm />
    </AuthShell>
  );
}
