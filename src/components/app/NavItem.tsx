import Link from "next/link";

const base = "block py-2 text-[13px]";

/** A sidebar entry. Pages that don't exist yet are shown, but not as links. */
export function NavItem({
  label,
  href,
  current = false,
}: {
  label: string;
  href?: string;
  current?: boolean;
}) {
  if (href) {
    return (
      <Link
        href={href}
        aria-current={current ? "page" : undefined}
        className={`${base} ${current ? "font-semibold text-accent" : "text-muted hover:text-fg"}`}
      >
        {label}
      </Link>
    );
  }
  return (
    <span
      aria-disabled="true"
      title="Coming soon"
      className={`${base} cursor-not-allowed text-muted`}
    >
      {label}
    </span>
  );
}
