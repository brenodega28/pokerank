"use client";

import Link from "next/link";
import { useState } from "react";
import { GameTile } from "@/components/game-tile";
import { OverallBadge, ScoreBar } from "@/components/score-bar";
import { Panel, ProgressBar, SectionLabel, pixelButtonClass } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { GAMES, findGame, type Game } from "@/data/games";
import { MAX_SCORE, averageScore, clearScores, formatAverage, tierBoard, toggleScore, unratedGames, type Scores } from "@/lib/scores";
import { updateScores, useScores } from "@/lib/score-store";
import { TIERS, tierForScore } from "@/data/tiers";

export function TierBoard() {
  const scores = useScores();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const board = tierBoard(scores);
  const unrated = unratedGames(scores);
  const ratedCount = GAMES.length - unrated.length;
  const selectedGame = selectedId ? findGame(selectedId) ?? null : null;
  const selectedAverage = selectedId ? averageScore(scores, selectedId) : null;
  const selectedTier = selectedAverage === null ? null : tierForScore(selectedAverage).letter;

  const renderTile = (game: Game, average: number | null) => (
    <GameTile
      key={game.id}
      game={game}
      average={average}
      selected={selectedId === game.id}
      onPick={() => setSelectedId((current) => (current === game.id ? null : game.id))}
    />
  );

  return (
    <>
      <Panel className="flex flex-wrap items-center justify-between gap-x-8 gap-y-[18px] px-[22px] py-[18px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <SectionLabel>MY TIER BOARD</SectionLabel>
          <h1 className="m-0 font-display text-[clamp(18px,2.6vw,30px)] leading-[1.35] font-normal">OVERALL RANKING</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base text-muted">Scored on</span>
            {CATEGORIES.map((category) => (
              <span
                key={category.id}
                className="box-border inline-flex min-h-[30px] items-center border-3 border-ink bg-track px-2 font-display text-[10px] leading-[1.2] uppercase"
              >
                {category.label}
              </span>
            ))}
          </div>
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
        onDone={() => setSelectedId(null)}
      />

      <Panel as="section" aria-label="Tier board" className="flex flex-col gap-2.5 p-[clamp(8px,1.5vw,14px)]">
        {TIERS.map((tier) => {
          const entries = board[tier.letter];
          return (
            <div key={tier.letter} className="flex min-h-[152px] gap-2.5">
              <div
                className="flex w-[clamp(44px,8vw,100px)] flex-none flex-col items-center justify-center gap-3 border-3 border-ink text-ink shadow-tier-label"
                style={{ background: tier.color }}
              >
                <span className="font-display text-[clamp(18px,3vw,36px)] leading-none text-shadow-tier">{tier.letter}</span>
                <span className="font-display text-[10px] leading-none">{tier.range}</span>
              </div>
              <div
                className={`flex min-w-0 flex-auto flex-wrap content-start items-stretch gap-x-2.5 gap-y-2 border-3 border-ink p-2.5 shadow-well ${
                  selectedTier === tier.letter ? "bg-track-active" : "bg-track"
                }`}
              >
                {entries.map((entry) => renderTile(entry.game, entry.average))}
                {entries.length === 0 && (
                  <span className="self-center px-1.5 text-base text-muted">No games score here yet</span>
                )}
              </div>
            </div>
          );
        })}
      </Panel>

      <Panel as="section" aria-labelledby="unrated-title" className="flex flex-col gap-3.5 px-[clamp(8px,1.5vw,14px)] pt-4 pb-[clamp(8px,1.5vw,14px)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-1">
          <h2 id="unrated-title" className="m-0 font-display text-[15px] leading-[1.3] font-normal">
            NOT RATED YET
          </h2>
          <SectionLabel>{unrated.length} LEFT</SectionLabel>
        </div>
        <div className="flex min-h-[72px] flex-wrap items-stretch gap-x-2.5 gap-y-2 border-3 border-ink bg-track p-3 shadow-well">
          {unrated.map((game) => renderTile(game, null))}
          {unrated.length === 0 && <span className="self-center text-muted">Every game has a score!</span>}
        </div>
      </Panel>
    </>
  );
}

type ScoringPanelProps = {
  game: Game | null;
  scores: Scores;
  average: number | null;
  onDone: () => void;
};

function ScoringPanel({ game, scores, average, onDone }: ScoringPanelProps) {
  return (
    <Panel
      frameClassName="sticky top-3 z-[5]"
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
