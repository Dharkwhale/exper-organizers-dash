"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { GoogleCredential } from "@/lib/auth/api";
import { createNonce, loadGoogleIdentity } from "@/lib/auth/google";
import { Button } from "./Button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.33-1.58-5.04-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

/** The look of the Google button when it can't be used: shown, but disabled. */
export function GooglePlaceholder({ verb }: { verb: "Sign in" | "Sign up" }) {
  return (
    <Button
      variant="secondary"
      aria-disabled="true"
      aria-label={`${verb} with Google`}
      className="w-full gap-2 py-3.5"
    >
      <GoogleIcon />
      Google
    </Button>
  );
}

/**
 * Google's own sign-in button (it has to be: Google only hands an ID token to
 * its button). Without a client ID, while `disabled`, or if Google can't be
 * loaded, the disabled placeholder is shown instead.
 */
export function GoogleButton({
  verb,
  onCredential,
  disabled = false,
  hint,
}: {
  verb: "Sign in" | "Sign up";
  onCredential: (credential: GoogleCredential) => void;
  disabled?: boolean;
  hint?: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const container = useRef<HTMLDivElement>(null);
  const latest = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  // Google keeps the callback it was given, so it always calls the newest one.
  useLayoutEffect(() => {
    latest.current = onCredential;
  });

  useEffect(() => {
    if (!clientId || disabled) return;
    let cancelled = false;

    (async () => {
      try {
        const [google, nonce] = await Promise.all([loadGoogleIdentity(), createNonce()]);
        const parent = container.current;
        if (cancelled || !parent) return;

        google.accounts.id.initialize({
          client_id: clientId,
          nonce: nonce.hashed,
          auto_select: false,
          callback: (response) => {
            if (response.credential) {
              latest.current({ idToken: response.credential, nonce: nonce.raw });
            }
          },
        });
        google.accounts.id.renderButton(parent, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: verb === "Sign in" ? "signin_with" : "signup_with",
          logo_alignment: "center",
          width: Math.min(Math.round(parent.offsetWidth) || 360, 400),
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, disabled, verb]);

  if (!clientId || disabled || failed) {
    return (
      <div>
        <GooglePlaceholder verb={verb} />
        {failed ? (
          <p role="alert" className="mt-2 text-[11px] text-danger">
            Couldn&apos;t load Google sign-in. Try again later.
          </p>
        ) : disabled && hint ? (
          <p className="mt-2 text-[11px] text-muted">{hint}</p>
        ) : null}
      </div>
    );
  }

  return <div ref={container} className="flex min-h-11 justify-center" />;
}
