"use client";

import { useRef } from "react";
import { Cartridge } from "@/components/cartridge";
import { ModeToggle } from "@/components/mode-toggle";
import { OverallBadge, ScoreBar, ScoreMeter } from "@/components/score-bar";
import { ShareActions, ShareCardPreview, ShareNameField } from "@/components/share";
import { SupportPanel } from "@/components/support-panel";
import { Panel } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { findGame, gameMetaLine, gameShortMetaLine, type Game } from "@/data/games";
import {
  MAX_SCORE,
  formatScore,
  overallScore,
  scoredCategoryCount,
  toggleCategoryScore,
  toggleSimpleScore,
  type Scores,
  type ScoringMode,
} from "@/lib/scores";
import { updateScores, useScores, useScoringMode } from "@/lib/score-store";
import { useShareName } from "@/lib/share-name-store";

const chipClass =
  "box-border inline-flex min-h-[34px] items-center border-3 border-ink px-2.5 font-display text-[10px] leading-[1.2]";

export function GameHero({ game, scores, mode }: { game: Game; scores: Scores; mode: ScoringMode }) {
  const score = overallScore(scores, mode, game.id);
  const scoredText =
    mode === "simple"
      ? score === null
        ? "NOT SCORED"
        : "SCORED"
      : `${scoredCategoryCount(scores, game.id)}/${CATEGORIES.length} SCORED`;
  return (
    <Panel className="flex flex-wrap items-center gap-x-8 gap-y-6 p-[22px]">
      <Cartridge game={game} size="page" footer={gameShortMetaLine(game)} />
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
        <span className="font-display text-[11px] leading-[1.4] text-muted">{gameMetaLine(game)}</span>
        <h1 className="m-0 font-display text-[clamp(20px,2.8vw,32px)] leading-[1.4] font-normal uppercase">
          {game.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3">
          <div className="flex items-center gap-3">
            <OverallBadge score={score} size="large" />
            <div className="flex flex-col gap-2">
              <span className="font-display text-[10px] leading-[1.2] text-muted">OVERALL</span>
              <span className="font-display text-lg leading-none">
                {score === null ? "–" : `${formatScore(score, mode)}/${MAX_SCORE}`}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`${chipClass} bg-cream uppercase`}>{game.region}</span>
            <span className={`${chipClass} bg-night text-cream`}>{scoredText}</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

type ScoreRowData = {
  key: string;
  label: string;
  hint: string;
  value: number | undefined;
  pick: (value: number) => void;
};

function scoreRows(game: Game, scores: Scores, mode: ScoringMode): ScoreRowData[] {
  if (mode === "simple") {
    return [
      {
        key: "score",
        label: "Score",
        hint: "Your one overall score for this game",
        value: scores.simple[game.id],
        pick: (value) => updateScores((all) => toggleSimpleScore(all, game.id, value)),
      },
    ];
  }
  return CATEGORIES.map((category) => ({
    key: category.id,
    label: category.label,
    hint: category.hint,
    value: scores.advanced[game.id]?.[category.id],
    pick: (value) => updateScores((all) => toggleCategoryScore(all, game.id, category.id, value)),
  }));
}

type GameScoresPanelProps = {
  game: Game;
  scores: Scores;
  mode: ScoringMode;
  heading: string;
  subtitle: string;
  editable?: boolean;
};

export function GameScoresPanel({ game, scores, mode, heading, subtitle, editable = false }: GameScoresPanelProps) {
  return (
    <Panel as="section" aria-labelledby="scores-title" className="flex flex-col p-2">
      <div className="flex flex-col gap-3.5 px-3.5 pt-3.5 pb-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2 id="scores-title" className="m-0 font-display text-[15px] leading-[1.3] font-normal">
            {heading}
          </h2>
          <span className="text-base text-muted">{subtitle}</span>
        </div>
        {editable && <ModeToggle />}
      </div>
      {scoreRows(game, scores, mode).map((row) => (
        <div key={row.key} className="flex flex-col gap-2.5 border-t-3 border-divider p-3.5">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="flex flex-col gap-1.5">
              <span className="font-display text-xs leading-[1.3] uppercase">{row.label}</span>
              <span className="text-base text-muted">{row.hint}</span>
            </div>
            <span className="font-display text-sm leading-none">
              {row.value ?? "–"}/{MAX_SCORE}
            </span>
          </div>
          {editable ? (
            <ScoreBar label={row.label} value={row.value} numbered={mode === "simple"} onPick={row.pick} />
          ) : (
            <ScoreMeter value={row.value} size="page" />
          )}
        </div>
      ))}
    </Panel>
  );
}

function GameSharePanel({ game, scores, mode }: { game: Game; scores: Scores; mode: ScoringMode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const name = useShareName();
  const target = { kind: "game", game } as const;
  return (
    <Panel
      as="aside"
      aria-labelledby="share-title"
      frameClassName="min-w-0 flex-[1_1_340px]"
      className="flex flex-col gap-4 px-[18px] pt-5 pb-[18px]"
    >
      <div className="flex flex-col gap-2.5">
        <h2 id="share-title" className="m-0 font-display text-sm leading-[1.3] font-normal">
          SHARE THIS GAME
        </h2>
        <span className="text-base text-muted">A 1080 × 1080 picture of your scores.</span>
      </div>
      <div className="flex justify-center border-3 border-ink bg-well-dark p-3 shadow-well-dark">
        <ShareCardPreview target={target} scores={scores} mode={mode} name={name} maxWidth={297} cardRef={cardRef} />
      </div>
      <ShareNameField />
      <ShareActions target={target} scores={scores} mode={mode} cardRef={cardRef} />
    </Panel>
  );
}

export function GameDetail({ gameId }: { gameId: string }) {
  const scores = useScores();
  const mode = useScoringMode();
  const game = findGame(gameId);
  if (!game) return null;
  return (
    <main className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-7 px-[clamp(16px,4vw,40px)] pt-8 pb-16">
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
        <GameHero game={game} scores={scores} mode={mode} />
        <GameScoresPanel
          game={game}
          scores={scores}
          mode={mode}
          heading="YOUR SCORES"
          subtitle={
            mode === "simple"
              ? "One score from 1 to 5. It sets the tier directly."
              : "Score each from 1 to 5. The average sets its tier."
          }
          editable
        />
      </div>
      <GameSharePanel game={game} scores={scores} mode={mode} />
      <SupportPanel frameClassName="min-w-0 flex-[1_1_100%]" />
    </main>
  );
}
