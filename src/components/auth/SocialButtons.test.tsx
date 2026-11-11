import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SocialButtons } from "./SocialButtons";

describe("SocialButtons", () => {
  test.each(["Sign in", "Sign up"] as const)(
    "on %s: an 'or' divider, then a disabled Google placeholder and nothing else",
    (verb) => {
      render(<SocialButtons verb={verb} />);
      expect(screen.getByText("or")).toBeInTheDocument();
      const google = screen.getByRole("button", { name: `${verb} with Google` });
      expect(google).toHaveTextContent("Google");
      expect(google).toHaveAttribute("aria-disabled", "true");
      expect(screen.getAllByRole("button")).toHaveLength(1);
      expect(screen.queryByText("SSO")).not.toBeInTheDocument();
    },
  );

  test("the icon is decorative", () => {
    const { container } = render(<SocialButtons verb="Sign in" />);
    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(1);
    for (const icon of icons) expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});
