import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LargeCartridge } from "@/components/cartridge";
import { GameScoreSummary, GameScores } from "@/components/game-scores";
import { SiteHeader } from "@/components/site-header";
import { Panel, PixelBackArrow } from "@/components/ui";
import { GAMES, findGame, gameMetaLine } from "@/data/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ id: game.id }));
}

export async function generateMetadata({ params }: PageProps<"/games/[id]">): Promise<Metadata> {
  const game = findGame((await params).id);
  return game ? { title: game.name } : {};
}

export default async function GamePage({ params }: PageProps<"/games/[id]">) {
  const game = findGame((await params).id);
  if (!game) notFound();

  return (
    <>
      <SiteHeader>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2.5 border-3 border-ink-deep bg-cream px-4 font-display text-[11px] leading-[1.2] text-ink no-underline shadow-[inset_3px_3px_0_rgb(255_255_255/0.7),inset_-3px_-3px_0_rgb(0_0_0/0.16),4px_4px_0_var(--color-ink-deep)]"
        >
          <PixelBackArrow />
          <span>MY TIER BOARD</span>
        </Link>
      </SiteHeader>
      <main className="mx-auto flex max-w-[1240px] flex-col gap-6 px-[clamp(16px,4vw,40px)] pt-8 pb-16">
        <Panel className="flex flex-wrap items-center gap-x-8 gap-y-6 p-6">
          <LargeCartridge game={game} />
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
            <span className="font-display text-[11px] leading-[1.4] text-muted">{gameMetaLine(game)}</span>
            <h1 className="m-0 font-display text-[clamp(20px,2.8vw,32px)] leading-[1.4] font-normal uppercase">
              {game.name}
            </h1>
            <GameScoreSummary gameId={game.id} region={game.region} />
          </div>
        </Panel>
        <GameScores gameId={game.id} />
      </main>
    </>
  );
}
