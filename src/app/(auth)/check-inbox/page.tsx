import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { CheckInbox, InboxMessage } from "./CheckInbox";

export const metadata: Metadata = { title: "Check your inbox · EXPER" };

export default function CheckInboxPage() {
  return (
    <AuthShell
      headline={
        <>
          Check
          <br />
          your inbox.
        </>
      }
      subtext={<InboxMessage />}
    >
      <CheckInbox />
    </AuthShell>
  );
}
