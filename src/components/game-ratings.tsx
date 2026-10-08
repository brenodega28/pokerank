"use client";

import { Panel } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { TIERS } from "@/data/tiers";
import { updateBoards, useBoards } from "@/lib/board-store";
import { placeGame, tierOf } from "@/lib/boards";

const chipClass =
  "inline-flex min-h-[34px] items-center border-3 border-ink px-2.5 font-display text-[10px] leading-[1.2]";

export function RatedBadge({ gameId }: { gameId: string }) {
  const boards = useBoards();
  const rated = CATEGORIES.filter((category) => tierOf(boards[category.id], gameId) !== null).length;
  return (
    <span className={`${chipClass} bg-night text-cream`}>
      {rated}/{CATEGORIES.length} RATED
    </span>
  );
}

export function GameRatings({ gameId }: { gameId: string }) {
  const boards = useBoards();

  return (
    <Panel as="section" aria-labelledby="ratings-title" className="flex flex-col p-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-3.5 pt-3.5 pb-3">
        <h2 id="ratings-title" className="m-0 font-display text-[15px] leading-[1.3] font-normal">
          YOUR RATINGS
        </h2>
        <span className="text-base text-muted">Picking a tier moves this game on that category’s board.</span>
      </div>
      {CATEGORIES.map((category) => {
        const current = tierOf(boards[category.id], gameId);
        return (
          <div
            key={category.id}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t-3 border-divider p-3.5"
          >
            <div className="flex min-w-[170px] flex-col gap-1.5">
              <span className="font-display text-xs leading-[1.3] uppercase">{category.label}</span>
              <span className="text-base text-muted">{category.hint}</span>
            </div>
            <div role="group" aria-label={`${category.label} tier`} className="flex flex-wrap gap-2">
              {TIERS.map((tier) => {
                const on = current === tier.letter;
                return (
                  <button
                    key={tier.letter}
                    type="button"
                    onClick={() => updateBoards((all) => placeGame(all, category.id, gameId, on ? null : tier.letter))}
                    aria-pressed={on}
                    aria-label={`${category.label}: ${tier.letter} tier`}
                    className={`size-12 border-3 p-0 font-display text-base leading-none ${
                      on
                        ? "border-ink text-ink shadow-[var(--shadow-bevel),var(--shadow-selected)]"
                        : "border-idle-border bg-cream text-muted shadow-[inset_-3px_-3px_0_rgb(0_0_0/0.08)]"
                    }`}
                    style={on ? { background: tier.color } : undefined}
                  >
                    {tier.letter}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </Panel>
  );
}
