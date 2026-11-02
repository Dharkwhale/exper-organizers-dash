import { useSyncExternalStore } from "react";

const KEY = "exper.email";

// Carries the email between auth steps. Storage can be blocked (private
// windows, disabled site data), so every access is guarded.
export function readEmail(): string {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

const noopSubscribe = () => () => {};

// Hydration-safe read: "" on the server and during hydration, then the stored value.
export function useStoredEmail(): string {
  return useSyncExternalStore(noopSubscribe, readEmail, () => "");
}

export function writeEmail(email: string): void {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    // Nothing to do: the next step falls back to generic "your email" copy.
  }
}
