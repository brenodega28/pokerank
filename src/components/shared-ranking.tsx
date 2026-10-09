"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { GameHero, GameScoresPanel } from "@/components/game-scores";
import { ScoringSummary, TierRows } from "@/components/tier-rows";
import { Panel, ProgressBar, SectionLabel, pixelButtonClass } from "@/components/ui";
import { GAMES, findGame } from "@/data/games";
import { unratedGames } from "@/lib/scores";
import { parseShareHash } from "@/lib/share-link";

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

function useHash(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => null,
  );
}

function sharedBy(name: string): string {
  return name ? `@${name}'s` : "A shared";
}

export function SharedRanking() {
  const hash = useHash();
  if (hash === null) {
    return (
      <Panel className="px-[22px] py-[18px]">
        <p className="m-0 text-[19px]">Loading the shared ranking…</p>
      </Panel>
    );
  }

  const ranking = parseShareHash(hash);
  if (!ranking) {
    return (
      <Panel className="flex flex-col items-start gap-4 px-[22px] py-[18px]">
        <h1 className="m-0 font-display text-[clamp(16px,2.2vw,24px)] leading-[1.35] font-normal">
          THIS LINK DOESN&apos;T WORK
        </h1>
        <p className="m-0 text-[19px]">The share link is incomplete or was cut off. Ask for it again, or rank the games yourself.</p>
        <Link href="/" className={pixelButtonClass("accent")}>
          MAKE YOUR OWN
        </Link>
      </Panel>
    );
  }

  if (ranking.kind === "game") {
    const game = findGame(ranking.gameId)!;
    return (
      <>
        <SharedNotice>
          {sharedBy(ranking.name)} rating of {game.name}
        </SharedNotice>
        <GameHero game={game} scores={ranking.scores} mode={ranking.mode} />
        <GameScoresPanel
          game={game}
          scores={ranking.scores}
          mode={ranking.mode}
          heading={ranking.mode === "simple" ? "THEIR SCORE" : "THEIR SCORES"}
          subtitle={
            ranking.mode === "simple"
              ? "One score from 1 to 5. It sets the tier directly."
              : "Scored from 1 to 5. The average sets its tier."
          }
        />
      </>
    );
  }

  const rated = GAMES.length - unratedGames(ranking.scores, ranking.mode).length;
  return (
    <>
      <Panel className="flex flex-wrap items-center justify-between gap-x-8 gap-y-[18px] px-[22px] py-[18px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <SectionLabel>SHARED TIER BOARD</SectionLabel>
          <h1 className="m-0 font-display text-[clamp(18px,2.6vw,30px)] leading-[1.35] font-normal">
            {sharedBy(ranking.name).toUpperCase()} RANKING
          </h1>
          <ScoringSummary mode={ranking.mode} />
        </div>
        <div className="flex w-[260px] max-w-full flex-col gap-2">
          <div className="flex justify-between gap-3 font-display text-[11px] leading-[1.3]">
            <span>RATED</span>
            <span>
              {rated}/{GAMES.length}
            </span>
          </div>
          <ProgressBar value={rated} max={GAMES.length} label="Games rated" />
        </div>
      </Panel>
      <TierRows scores={ranking.scores} mode={ranking.mode} label="Shared tier board" />
    </>
  );
}

function SharedNotice({ children }: { children: React.ReactNode }) {
  return (
    <Panel className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-[22px] py-3.5">
      <span className="text-[19px]">{children}. Scores are read-only here.</span>
      <Link href="/" className={pixelButtonClass("accent")}>
        RANK YOUR OWN
      </Link>
    </Panel>
  );
}
