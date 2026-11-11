const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type CredentialResponse = { credential?: string };

/** The slice of Google Identity Services this app uses. */
export type GoogleIdentity = {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        nonce: string;
        callback: (response: CredentialResponse) => void;
        auto_select?: boolean;
      }): void;
      renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

let loading: Promise<GoogleIdentity> | null = null;

/** Loads Google's sign-in library once; a failed load can be tried again. */
export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in needs a browser."));
  }
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (loading) return loading;

  loading = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      if (window.google?.accounts?.id) resolve(window.google);
      else {
        loading = null;
        reject(new Error("Google sign-in did not start."));
      }
    });
    script.addEventListener("error", () => {
      script.remove();
      loading = null;
      reject(new Error("Couldn't load Google sign-in."));
    });
    document.head.appendChild(script);
  });
  return loading;
}

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

/**
 * A one-time value that ties a Google ID token to this page. Google gets the
 * SHA-256 hash; the backend gets the raw value and checks it matches.
 */
export async function createNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return { raw, hashed: toHex(new Uint8Array(digest)) };
}
