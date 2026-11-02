import type { PasswordStrength } from "@/lib/auth/validation";

const LEVEL: Record<PasswordStrength, number> = {
  empty: 0,
  weak: 1,
  okay: 2,
  strong: 3,
};

const LABEL: Record<PasswordStrength, string> = {
  empty: "",
  weak: "Weak",
  okay: "Okay",
  strong: "Strong",
};

const COLOR: Record<PasswordStrength, string> = {
  empty: "bg-border",
  weak: "bg-danger",
  okay: "bg-[#f5c451]",
  strong: "bg-accent",
};

export function StrengthMeter({ strength }: { strength: PasswordStrength }) {
  const level = LEVEL[strength];
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3">
      <div className="flex flex-1 gap-1" aria-hidden>
        {[1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full ${
              segment <= level ? COLOR[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <span className="min-w-10 text-right text-[11px] text-muted">
        {LABEL[strength]}
      </span>
    </div>
  );
}
