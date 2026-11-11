"use client";

import { useLinkStatus } from "next/link";

/**
 * A small dot beside a link's label that lights up while the page it points at
 * is loading. It is always rendered, so showing it never shifts the layout, and
 * it waits 100ms before appearing so quick navigations show nothing at all.
 * It must sit inside a `<Link>`.
 */
export function PendingDot() {
  const { pending } = useLinkStatus();
  return (
    <span
      data-pending-dot
      data-pending={pending ? "true" : undefined}
      aria-hidden="true"
      className="ml-2 inline-block size-1.5 rounded-full bg-accent opacity-0 transition-opacity delay-100 duration-150 data-pending:animate-pulse data-pending:opacity-100"
    />
  );
}
