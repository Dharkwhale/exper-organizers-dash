import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { CodeInput } from "./CodeInput";

function Harness({
  onChange = () => {},
  onComplete,
  invalid,
}: {
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  invalid?: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <CodeInput
      value={value}
      invalid={invalid}
      onComplete={onComplete}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

const box = (n: number) => screen.getByLabelText(`Digit ${n} of 6`);

describe("CodeInput", () => {
  test("typing a digit reports it and moves focus to the next box", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.click(box(1));
    await user.keyboard("4");
    expect(onChange).toHaveBeenLastCalledWith("4");
    expect(box(2)).toHaveFocus();
  });

  test("backspace on an empty box clears the previous digit and focuses it", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.click(box(1));
    await user.keyboard("4");
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(box(1)).toHaveFocus();
  });

  test("pasting a full code fills every box and completes", async () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} onComplete={onComplete} />);
    await user.click(box(1));
    await user.paste("482913");
    expect(onChange).toHaveBeenLastCalledWith("482913");
    expect(onComplete).toHaveBeenCalledWith("482913");
  });

  test("pasting junk keeps only the first six digits", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.click(box(1));
    await user.paste("48-29 13xx");
    expect(onChange).toHaveBeenLastCalledWith("482913");
  });

  test("ignores non-digit keys", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.click(box(1));
    await user.keyboard("a");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("marks every box invalid when invalid is set", () => {
    render(<Harness invalid />);
    for (let n = 1; n <= 6; n++) {
      expect(box(n)).toHaveAttribute("aria-invalid", "true");
    }
  });
});
