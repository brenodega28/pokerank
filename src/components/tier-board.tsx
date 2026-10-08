"use client";

import Link from "next/link";
import { useState } from "react";
import { GameTile } from "@/components/game-tile";
import { Panel, PixelCaret, ProgressBar, SectionLabel, pixelButtonClass } from "@/components/ui";
import { CATEGORIES, categoryLabel, type CategoryId } from "@/data/categories";
import { GAMES, findGame, type Game } from "@/data/games";
import { TIERS, type TierLetter } from "@/data/tiers";
import { updateBoards, useBoards } from "@/lib/board-store";
import { placeGame, rankedCount, tierOf, unrankedGameIds } from "@/lib/boards";

export function TierBoard() {
  const boards = useBoards();
  const [category, setCategory] = useState<CategoryId>("pokedex");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const board = boards[category];
  const selectedGame = selectedId ? findGame(selectedId) ?? null : null;
  const ranked = rankedCount(board);
  const unranked = unrankedGameIds(board);

  const toggleSelected = (gameId: string) => setSelectedId((current) => (current === gameId ? null : gameId));

  const placeSelected = (tier: TierLetter | null) => {
    if (!selectedId) return;
    updateBoards((current) => placeGame(current, category, selectedId, tier));
    setSelectedId(null);
  };

  const switchCategory = (next: CategoryId) => {
    setCategory(next);
    setSelectedId(null);
  };

  const renderTile = (gameId: string) => {
    const game = findGame(gameId);
    if (!game) return null;
    return (
      <GameTile
        key={game.id}
        game={game}
        tier={tierOf(board, game.id)}
        selected={selectedId === game.id}
        onPick={() => toggleSelected(game.id)}
      />
    );
  };

  return (
    <>
      <Panel className="flex flex-wrap items-center justify-between gap-x-8 gap-y-[18px] px-6 py-5">
        <div className="flex min-w-0 flex-col gap-3">
          <SectionLabel>MY TIER BOARD</SectionLabel>
          <h1 className="m-0 font-display text-[clamp(18px,2.6vw,30px)] leading-[1.35] font-normal uppercase">
            Ranked by {categoryLabel(category)}
          </h1>
        </div>
        <div className="flex w-[260px] max-w-full flex-col gap-2">
          <div className="flex justify-between gap-3 font-display text-[11px] leading-[1.3]">
            <span>RANKED</span>
            <span>
              {ranked}/{GAMES.length}
            </span>
          </div>
          <ProgressBar value={ranked} max={GAMES.length} label="Games ranked" />
        </div>
      </Panel>

      <Panel role="group" aria-label="Rank by" className="flex flex-wrap items-center gap-x-3 gap-y-2.5 px-4 py-3.5">
        <SectionLabel className="pr-1.5 pl-1">RANK BY</SectionLabel>
        {CATEGORIES.map((item) => {
          const active = item.id === category;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => switchCategory(item.id)}
              aria-pressed={active}
              className={`${pixelButtonClass(active ? "selected" : "light", "medium")} uppercase`}
            >
              {active && <PixelCaret />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </Panel>

      <PlacementBar
        selectedGame={selectedGame}
        currentTier={selectedId ? tierOf(board, selectedId) : null}
        onPlace={placeSelected}
      />

      <Panel as="section" aria-label="Tier board" className="flex flex-col gap-2.5 p-4">
        {TIERS.map((tier) => {
          const games = board[tier.letter];
          return (
            <div key={tier.letter} className="flex min-h-[152px] gap-2.5">
              <button
                type="button"
                onClick={() => placeSelected(tier.letter)}
                disabled={!selectedGame}
                aria-label={selectedGame ? `Place ${selectedGame.name} in ${tier.letter} tier` : `${tier.letter} tier`}
                className="flex w-[clamp(56px,8vw,100px)] flex-none items-center justify-center border-3 border-ink p-0 font-display text-[clamp(22px,3vw,36px)] leading-none text-ink shadow-tier-label text-shadow-tier"
                style={{ background: tier.color }}
              >
                {tier.letter}
              </button>
              <div
                className={`flex min-w-0 flex-auto flex-wrap content-start items-stretch gap-2.5 border-3 border-ink p-2.5 shadow-well ${
                  selectedGame ? "bg-track-active" : "bg-track"
                }`}
              >
                {games.map(renderTile)}
                {games.length === 0 && (
                  <span className="self-center px-1.5 text-base text-muted">
                    {selectedGame ? `Tap ${tier.letter} to place it here` : "Nothing here yet"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </Panel>

      <Panel as="section" aria-labelledby="unranked-title" className="flex flex-col gap-3.5 px-4 pt-[18px] pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-1">
          <h2 id="unranked-title" className="m-0 font-display text-[15px] leading-[1.3] font-normal">
            NOT RANKED YET
          </h2>
          <SectionLabel>{unranked.length} LEFT</SectionLabel>
        </div>
        <div className="flex min-h-[72px] flex-wrap items-stretch gap-2.5 border-3 border-ink bg-track p-3 shadow-well">
          {unranked.map(renderTile)}
          {unranked.length === 0 && <span className="self-center text-muted">Every game is on the board!</span>}
        </div>
      </Panel>
    </>
  );
}

type PlacementBarProps = {
  selectedGame: Game | null;
  currentTier: TierLetter | null;
  onPlace: (tier: TierLetter | null) => void;
};

function PlacementBar({ selectedGame, currentTier, onPlace }: PlacementBarProps) {
  return (
    <Panel className="sticky top-3 z-[5] box-border flex min-h-[84px] flex-wrap items-center gap-x-4 gap-y-3 py-4 pr-[18px] pl-[22px]">
      {selectedGame ? (
        <>
          <span className="min-w-0 flex-[1_1_240px] text-[19px] leading-[1.35]">
            Where should <strong className="font-bold text-accent">{selectedGame.name}</strong> go?
          </span>
          <div role="group" aria-label="Place in tier" className="flex flex-wrap gap-1.5">
            {TIERS.map((tier) => {
              const current = currentTier === tier.letter;
              return (
                <button
                  key={tier.letter}
                  type="button"
                  onClick={() => onPlace(tier.letter)}
                  aria-label={`Place in ${tier.letter} tier`}
                  aria-pressed={current}
                  className={`size-11 border-3 border-ink p-0 font-display text-sm leading-none text-ink ${
                    current
                      ? "shadow-[var(--shadow-bevel),var(--shadow-selected)]"
                      : "shadow-[var(--shadow-bevel),3px_3px_0_rgb(16_16_32/0.35)]"
                  }`}
                  style={{ background: tier.color }}
                >
                  {tier.letter}
                </button>
              );
            })}
            <button type="button" onClick={() => onPlace(null)} className={pixelButtonClass()}>
              UNRANK
            </button>
          </div>
          <Link href={`/games/${selectedGame.id}`} className={pixelButtonClass()}>
            GAME PAGE
          </Link>
        </>
      ) : (
        <span className="flex items-center gap-3 text-[19px] leading-[1.35]">
          <span>Tap a game, then tap a tier to place it.</span>
          <svg
            className="text-accent motion-safe:animate-blink"
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
