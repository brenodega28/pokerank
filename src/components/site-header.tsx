import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b-4 border-ink bg-night shadow-header">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-[clamp(16px,4vw,40px)] py-3.5">
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1.5">
          <Link href="/" className="font-display text-[22px] leading-[1.2] text-cream no-underline text-shadow-logo">
            PokéRanked
          </Link>
          <span className="text-night-text">Rank every main-series Pokémon game</span>
        </div>
        {children}
      </div>
    </header>
  );
}

export function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center gap-2.5 border-3 border-ink-deep bg-cream px-4 font-display text-[11px] leading-[1.2] text-ink no-underline shadow-[inset_3px_3px_0_rgb(255_255_255/0.7),inset_-3px_-3px_0_rgb(0_0_0/0.16),4px_4px_0_var(--color-ink-deep)]"
    >
      {children}
    </Link>
  );
}
