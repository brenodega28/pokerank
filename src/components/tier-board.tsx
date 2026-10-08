"use client";

import Link from "next/link";
import { useState } from "react";
import { GameTile } from "@/components/game-tile";
import { OverallBadge, ScoreBar } from "@/components/score-bar";
import { ShareDialog, type ShareDialogState } from "@/components/share-dialog";
import { SiteHeader } from "@/components/site-header";
import { SupportPanel } from "@/components/support-panel";
import { CategoryChips, TierRows } from "@/components/tier-rows";
import { Panel, ProgressBar, SectionLabel, pixelButtonClass } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { GAMES, findGame, type Game } from "@/data/games";
import { tierForScore } from "@/data/tiers";
import { MAX_SCORE, averageScore, clearScores, formatAverage, toggleScore, unratedGames, type Scores } from "@/lib/scores";
import { updateScores, useScores } from "@/lib/score-store";

export function TierBoard() {
  const scores = useScores();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [share, setShare] = useState<ShareDialogState | null>(null);

  const unrated = unratedGames(scores);
  const ratedCount = GAMES.length - unrated.length;
  const selectedGame = selectedId ? findGame(selectedId) ?? null : null;
  const selectedAverage = selectedId ? averageScore(scores, selectedId) : null;
  const selectedTier = selectedAverage === null ? null : tierForScore(selectedAverage).letter;
  const togglePick = (gameId: string) => setSelectedId((current) => (current === gameId ? null : gameId));

  return (
    <>
      <SiteHeader>
        <button type="button" onClick={() => setShare({ kind: "board" })} className={headerShareClass}>
          SHARE BOARD
        </button>
      </SiteHeader>
      <main className="mx-auto flex max-w-[1240px] flex-col gap-5 px-[clamp(16px,4vw,40px)] pt-7 pb-16">
        <Panel className="flex flex-wrap items-center justify-between gap-x-8 gap-y-[18px] px-[22px] py-[18px]">
          <div className="flex min-w-0 flex-col gap-3.5">
            <SectionLabel>MY TIER BOARD</SectionLabel>
            <h1 className="m-0 font-display text-[clamp(18px,2.6vw,30px)] leading-[1.35] font-normal">OVERALL RANKING</h1>
            <CategoryChips />
          </div>
          <div className="flex w-[260px] max-w-full flex-col gap-2">
            <div className="flex justify-between gap-3 font-display text-[11px] leading-[1.3]">
              <span>RATED</span>
              <span>
                {ratedCount}/{GAMES.length}
              </span>
            </div>
            <ProgressBar value={ratedCount} max={GAMES.length} label="Games rated" />
          </div>
        </Panel>

        <ScoringPanel
          game={selectedGame}
          scores={scores}
          average={selectedAverage}
          onShare={(gameId) => setShare({ kind: "game", gameId })}
          onDone={() => setSelectedId(null)}
        />

        <TierRows
          scores={scores}
          label="Tier board"
          selectedId={selectedId}
          highlightTier={selectedTier}
          onPick={togglePick}
        />

        <Panel
          as="section"
          aria-labelledby="unrated-title"
          className="flex flex-col gap-3.5 px-[clamp(8px,1.5vw,14px)] pt-4 pb-[clamp(8px,1.5vw,14px)]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-1">
            <h2 id="unrated-title" className="m-0 font-display text-[15px] leading-[1.3] font-normal">
              NOT RATED YET
            </h2>
            <SectionLabel>{unrated.length} LEFT</SectionLabel>
          </div>
          <div className="flex min-h-[72px] flex-wrap items-stretch gap-x-2.5 gap-y-2 border-3 border-ink bg-track p-3 shadow-well">
            {unrated.map((game) => (
              <GameTile
                key={game.id}
                game={game}
                average={null}
                selected={selectedId === game.id}
                onPick={() => togglePick(game.id)}
              />
            ))}
            {unrated.length === 0 && <span className="self-center text-muted">Every game has a score!</span>}
          </div>
        </Panel>
        <SupportPanel />
      </main>
      <ShareDialog state={share} scores={scores} onChange={setShare} onClose={() => setShare(null)} />
    </>
  );
}

const headerShareClass =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border-3 border-ink-deep bg-accent px-[18px] font-display text-xs leading-[1.2] text-white shadow-raised-accent-strong text-shadow-on-accent";

type ScoringPanelProps = {
  game: Game | null;
  scores: Scores;
  average: number | null;
  onShare: (gameId: string) => void;
  onDone: () => void;
};

function ScoringPanel({ game, scores, average, onShare, onDone }: ScoringPanelProps) {
  return (
    <Panel
      frameClassName="sticky top-3 z-[5] max-h-[calc(100dvh-24px)] overflow-y-auto overscroll-contain"
      className="box-border flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 py-3.5 pr-4 pl-5"
    >
      {game ? (
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
            <span className="min-w-0 flex-[1_1_260px] text-[19px] leading-[1.35]">
              How good is <strong className="font-bold text-accent">{game.name}</strong>?
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2.5 pr-2">
                <span className="font-display text-[10px] leading-[1.2] text-muted">OVERALL</span>
                <OverallBadge average={average} size="small" />
                <span className="font-display text-sm leading-none">{formatAverage(average)}</span>
              </div>
              <Link href={`/games/${game.id}`} className={pixelButtonClass()}>
                GAME PAGE
              </Link>
              <button type="button" onClick={() => onShare(game.id)} className={pixelButtonClass("accent")}>
                SHARE GAME
              </button>
              <button type="button" onClick={onDone} className={pixelButtonClass("highlight")}>
                DONE
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-x-7 gap-y-3.5">
            {CATEGORIES.map((category) => {
              const value = scores[game.id]?.[category.id];
              return (
                <div key={category.id} className="flex min-w-0 flex-col gap-2">
                  <div className="flex justify-between gap-3 font-display text-[10px] leading-[1.3]">
                    <span className="uppercase">{category.label}</span>
                    <span>
                      {value ?? "–"}/{MAX_SCORE}
                    </span>
                  </div>
                  <ScoreBar
                    label={category.label}
                    value={value}
                    onPick={(picked) => updateScores((all) => toggleScore(all, game.id, category.id, picked))}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span className="text-[15px] text-muted">
              Overall is the average of the scores you set. Tap a box again to clear it.
            </span>
            <button
              type="button"
              onClick={() => updateScores((all) => clearScores(all, game.id))}
              className={pixelButtonClass()}
            >
              CLEAR SCORES
            </button>
          </div>
        </div>
      ) : (
        <span className="flex items-center gap-3 text-[19px] leading-[1.35]">
          <span>Tap a game to score it. It moves to its tier automatically.</span>
          <svg
            className="flex-none text-accent motion-safe:animate-blink"
            width="14"
            height="8"
            viewBox="0 0 7 4"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <path fill="currentColor" d="M0 0h7v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1H0z" />
          </svg>
        </span>
      )}
    </Panel>
  );
}
