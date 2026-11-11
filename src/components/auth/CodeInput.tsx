"use client";

import {
  useEffect,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

type CodeInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  invalid?: boolean;
};

export function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  invalid = false,
}: CodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);

  // Focus moves after the parent has re-rendered with the new value.
  useEffect(() => {
    if (pendingFocus.current === null) return;
    refs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  }, [value]);

  function commit(next: string, focusIndex: number) {
    const target = Math.min(focusIndex, length - 1);
    if (next === value) {
      refs.current[target]?.focus();
    } else {
      pendingFocus.current = target;
      onChange(next);
    }
    if (next.length === length && next !== value) onComplete?.(next);
  }

  function insert(index: number, digits: string) {
    const next = (value.slice(0, index) + digits).slice(0, length);
    commit(next, next.length);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const next = value.slice(0, index) + event.key + value.slice(index + 1);
      commit(next.slice(0, length), index + 1);
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      if (index < value.length) {
        commit(value.slice(0, index) + value.slice(index + 1), index);
      } else if (index > 0) {
        commit(value.slice(0, index - 1), index - 1);
      }
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
      return;
    }
    if (event.key === "ArrowRight" && index < Math.min(value.length, length - 1)) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
      return;
    }
    // Ignore any other printable key so letters never reach the box.
    if (event.key.length === 1) event.preventDefault();
  }

  // Autofill and some mobile keyboards deliver digits through change events.
  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "");
    if (digits) insert(index, digits);
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (digits) insert(index, digits);
  }

  return (
    <div role="group" aria-label={`${length}-digit code`} className="flex gap-2">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={value[index] ?? ""}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onChange={(event) => handleChange(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => {
            if (index > value.length) refs.current[value.length]?.focus();
            else event.target.select();
          }}
          className={`size-12 rounded-2xl border bg-surface text-center text-base font-semibold text-fg outline-none transition-colors focus:border-accent ${
            invalid ? "border-danger" : "border-transparent"
          }`}
        />
      ))}
    </div>
  );
}
