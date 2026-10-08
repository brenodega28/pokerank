"use client";

import { OverallBadge, ScoreBar } from "@/components/score-bar";
import { Panel } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { MAX_SCORE, averageScore, scoredCategoryCount, toggleScore } from "@/lib/scores";
import { updateScores, useScores } from "@/lib/score-store";

const chipClass =
  "box-border inline-flex min-h-[34px] items-center border-3 border-ink px-2.5 font-display text-[10px] leading-[1.2]";

export function GameScoreSummary({ gameId, region }: { gameId: string; region: string }) {
  const scores = useScores();
  const average = averageScore(scores, gameId);
  return (
    <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3">
      <div className="flex items-center gap-3">
        <OverallBadge average={average} size="large" />
        <div className="flex flex-col gap-2">
          <span className="font-display text-[10px] leading-[1.2] text-muted">OVERALL</span>
          <span className="font-display text-lg leading-none">
            {average === null ? "–" : `${average.toFixed(1)}/${MAX_SCORE}`}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className={`${chipClass} bg-cream uppercase`}>{region}</span>
        <span className={`${chipClass} bg-night text-cream`}>
          {scoredCategoryCount(scores, gameId)}/{CATEGORIES.length} SCORED
        </span>
      </div>
    </div>
  );
}

export function GameScores({ gameId }: { gameId: string }) {
  const scores = useScores();

  return (
    <Panel as="section" aria-labelledby="scores-title" className="flex flex-col p-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-3.5 pt-3.5 pb-3">
        <h2 id="scores-title" className="m-0 font-display text-[15px] leading-[1.3] font-normal">
          YOUR SCORES
        </h2>
        <span className="text-base text-muted">Score each from 1 to 10. The average sets its tier.</span>
      </div>
      {CATEGORIES.map((category) => {
        const value = scores[gameId]?.[category.id];
        return (
          <div key={category.id} className="flex flex-col gap-2.5 border-t-3 border-divider p-3.5">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-xs leading-[1.3] uppercase">{category.label}</span>
                <span className="text-base text-muted">{category.hint}</span>
              </div>
              <span className="font-display text-sm leading-none">
                {value ?? "–"}/{MAX_SCORE}
              </span>
            </div>
            <ScoreBar
              label={category.label}
              value={value}
              onPick={(picked) => updateScores((all) => toggleScore(all, gameId, category.id, picked))}
            />
          </div>
        );
      })}
    </Panel>
  );
}
