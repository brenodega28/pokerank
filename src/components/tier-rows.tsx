import { GameTile, tileListClass } from "@/components/game-tile";
import { Panel } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { TIERS, type TierLetter } from "@/data/tiers";
import { tierBoard, tierRange, type Scores, type ScoringMode } from "@/lib/scores";

type TierRowsProps = {
  scores: Scores;
  mode: ScoringMode;
  label: string;
  selectedId?: string | null;
  highlightTier?: TierLetter | null;
  onPick?: (gameId: string) => void;
};

export function TierRows({ scores, mode, label, selectedId = null, highlightTier = null, onPick }: TierRowsProps) {
  const board = tierBoard(scores, mode);
  return (
    <Panel as="section" aria-label={label} className="flex flex-col gap-2.5 p-[clamp(8px,1.5vw,14px)]">
      {TIERS.map((tier) => {
        const entries = board[tier.letter];
        return (
          <div key={tier.letter} className="flex min-h-[152px] gap-2.5">
            <div
              className="flex w-[clamp(44px,8vw,100px)] flex-none flex-col items-center justify-center gap-3 border-3 border-ink text-ink shadow-tier-label"
              style={{ background: tier.color }}
            >
              <span className="font-display text-[clamp(18px,3vw,36px)] leading-none text-shadow-tier">{tier.letter}</span>
              <span className="font-display text-[10px] leading-none">{tierRange(tier, mode)}</span>
            </div>
            <div
              className={`${tileListClass} min-w-0 flex-auto border-3 border-ink p-2.5 shadow-well ${
                highlightTier === tier.letter ? "bg-track-active" : "bg-track"
              }`}
            >
              {entries.map(({ game, score }) => (
                <GameTile
                  key={game.id}
                  game={game}
                  score={score}
                  mode={mode}
                  selected={selectedId === game.id}
                  onPick={onPick && (() => onPick(game.id))}
                />
              ))}
              {entries.length === 0 && (
                <span className="col-span-full self-center px-1.5 text-base text-muted">No games score here yet</span>
              )}
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

export function ScoringSummary({ mode, switchHint = false }: { mode: ScoringMode; switchHint?: boolean }) {
  if (mode === "simple") {
    return (
      <span className="text-base text-muted">
        One score from 1 to 5 per game.{switchHint && " Switch to Advanced to score each category."}
      </span>
    );
  }
  return (
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
  );
}
