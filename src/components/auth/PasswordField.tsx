"use client";

import { useState } from "react";
import { Field, type FieldProps } from "./Field";

export function PasswordField(props: Omit<FieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="rounded px-1 text-[11px] text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
        >
          {visible ? "Hide" : "Show"}
        </button>
      }
    />
  );
}
