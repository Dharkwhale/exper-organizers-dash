"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthPreview } from "./AuthPreview";

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

/**
 * Below `lg` the pieces stack: header, headline, form, footer. From `lg` they
 * sit on one grid: a rounded panel on the left (logo, product preview,
 * headline) and the form column on the right (account link, form, footer).
 */
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
    <div className="grid min-h-dvh grid-cols-1 bg-bg px-4 py-5 sm:px-10 sm:py-7 lg:grid-cols-[1.1fr_1fr] lg:grid-rows-[auto_1fr_auto] lg:p-6">
      <div
        aria-hidden="true"
        className="hidden rounded-[2rem] bg-surface/60 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:block"
      />

      <header className="flex items-center justify-between lg:contents">
        <Link
          href="/sign-in"
          className="flex items-center gap-2 text-xs font-semibold tracking-wide lg:col-start-1 lg:row-start-1 lg:self-start lg:justify-self-start lg:px-10 lg:pt-10"
        >
          <Logo />
          EXPER
        </Link>
        <p className="flex items-center gap-3 text-[11px] text-muted lg:col-start-2 lg:row-start-1 lg:self-start lg:justify-self-end lg:px-10 lg:pt-6">
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

      <div className="py-10 lg:col-start-1 lg:row-start-2 lg:flex lg:flex-col lg:justify-between lg:gap-10 lg:px-10 lg:pb-10 lg:pt-8">
        <AuthPreview />
        <div>
          <h1 className="text-[clamp(2.75rem,8vw,5.5rem)] font-bold leading-[0.95] tracking-tight lg:text-[clamp(2.5rem,min(5vw,9vh),4.5rem)]">
            {headline}
          </h1>
          {subtext ? (
            <p className="mt-8 max-w-xs text-xs leading-relaxed text-muted lg:mt-6">
              {subtext}
            </p>
          ) : null}
        </div>
      </div>

      <main className="flex items-center justify-center pb-10 lg:col-start-2 lg:row-start-2 lg:px-10 lg:py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      <footer className="flex items-center justify-between text-[11px] text-muted lg:col-start-2 lg:row-start-3 lg:px-10 lg:pb-4">
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
