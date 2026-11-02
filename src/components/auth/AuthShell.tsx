"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const SIGN_UP_SIDE = ["/sign-up", "/verify"];

function Logo() {
  // Decorative: the "EXPER" wordmark next to it names the link.
  return (
    <Image
      src="/exper-logo.png"
      alt=""
      width={28}
      height={28}
      priority
      className="size-7"
    />
  );
}

export function AuthShell({
  headline,
  subtext,
  children,
}: {
  headline: ReactNode;
  subtext?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const onSignUpSide = SIGN_UP_SIDE.includes(pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-bg px-4 py-5 sm:px-10 sm:py-7">
      <header className="flex items-center justify-between">
        <Link
          href="/sign-in"
          className="flex items-center gap-2 text-xs font-semibold tracking-wide"
        >
          <Logo />
          EXPER
        </Link>
        <p className="flex items-center gap-3 text-[11px] text-muted">
          <span className="hidden sm:inline">
            {onSignUpSide ? "Have an account?" : "New to EXPER?"}
          </span>
          <Link
            href={onSignUpSide ? "/sign-in" : "/sign-up"}
            className="rounded-full bg-surface-2 px-3 py-1.5 text-[11px] font-semibold text-fg hover:bg-border"
          >
            {onSignUpSide ? "Sign in" : "Create account"}
          </Link>
        </p>
      </header>

      <main className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div>
          <h1 className="text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
            {headline}
          </h1>
          {subtext ? (
            <p className="mt-8 max-w-xs text-xs leading-relaxed text-muted lg:mt-14">
              {subtext}
            </p>
          ) : null}
        </div>
        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          {children}
        </div>
      </main>

      <footer className="flex items-center justify-between text-[11px] text-muted">
        <span>People first. Aggregate by design.</span>
        <nav className="flex gap-6" aria-label="Footer">
          <Link href="#" className="hover:text-fg">
            Help
          </Link>
          <Link href="#" className="hover:text-fg">
            Privacy
          </Link>
          <Link href="#" className="hover:text-fg">
            Terms
          </Link>
        </nav>
      </footer>
    </div>
  );
}
