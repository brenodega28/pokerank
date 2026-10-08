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
