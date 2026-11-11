import type { GoogleCredential } from "@/lib/auth/api";
import { GoogleButton, GooglePlaceholder } from "./GoogleButton";

/**
 * The "or" divider and the Google button. Pass `onGoogle` to make it work;
 * without it, the button is a disabled placeholder.
 */
export function SocialButtons({
  verb,
  onGoogle,
  googleDisabled,
  googleHint,
}: {
  verb: "Sign in" | "Sign up";
  onGoogle?: (credential: GoogleCredential) => void;
  googleDisabled?: boolean;
  googleHint?: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-3 text-[11px] text-muted">
        <span className="h-px flex-1 bg-border/60" />
        or
        <span className="h-px flex-1 bg-border/60" />
      </p>
      <div className="mt-4">
        {onGoogle ? (
          <GoogleButton
            verb={verb}
            onCredential={onGoogle}
            disabled={googleDisabled}
            hint={googleHint}
          />
        ) : (
          <GooglePlaceholder verb={verb} />
        )}
      </div>
    </div>
  );
}
