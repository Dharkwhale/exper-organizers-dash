import { Button } from "./Button";

// Provider sign-in is not wired up yet; the buttons render but do nothing.
export function SocialButtons({ verb }: { verb: "Sign in" | "Sign up" }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" aria-disabled="true">
        {verb} with Google
      </Button>
      {verb === "Sign in" ? (
        <Button variant="secondary" aria-disabled="true">
          {verb} with SSO
        </Button>
      ) : null}
    </div>
  );
}
