"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { signOut } from "@/lib/auth/api";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const working = useRef(false);

  async function handleClick() {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setFailed(false);

    const result = await signOut();
    if (result.ok) {
      // Stay busy: the page is on its way out.
      router.replace("/sign-in");
      return;
    }
    working.current = false;
    setBusy(false);
    setFailed(true);
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleClick}
        aria-busy={busy || undefined}
        className="rounded text-[11px] text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-accent aria-busy:opacity-60"
      >
        Sign out
      </button>
      {failed ? (
        <p role="alert" className="mt-2 text-[11px] text-danger">
          Couldn&apos;t sign out. Try again.
        </p>
      ) : null}
    </div>
  );
}
