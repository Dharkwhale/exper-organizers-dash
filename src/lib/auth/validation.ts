export type PasswordChecks = {
  length: boolean;
  number: boolean;
  symbol: boolean;
};

export type PasswordStrength = "empty" | "weak" | "okay" | "strong";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

// Length is counted in characters the user sees, so emoji count once.
function visibleLength(password: string): number {
  return Array.from(password).length;
}

export function passwordChecks(password: string): PasswordChecks {
  return {
    length: visibleLength(password) >= 10,
    number: /\d/.test(password),
    symbol: /[^\p{L}\p{N}\s]/u.test(password),
  };
}

export function passwordStrength(password: string): PasswordStrength {
  if (password === "") return "empty";
  const { length, number, symbol } = passwordChecks(password);
  if (!(length && number && symbol)) return "weak";
  return visibleLength(password) >= 12 ? "strong" : "okay";
}
