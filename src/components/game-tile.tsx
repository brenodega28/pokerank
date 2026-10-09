import { Cartridge } from "@/components/cartridge";
import type { Game } from "@/data/games";
import { tierForScore } from "@/data/tiers";
import { formatScore, type ScoringMode } from "@/lib/scores";

export const tileListClass =
  "flex flex-wrap content-start items-stretch gap-x-2.5 gap-y-2 max-sm:grid max-sm:grid-cols-[repeat(auto-fill,105px)] max-sm:justify-between";

type GameTileProps = {
  game: Game;
  score: number | null;
  mode: ScoringMode;
  selected?: boolean;
  onPick?: () => void;
};

export function GameTile({ game, score, mode, selected = false, onPick }: GameTileProps) {
  const description =
    score === null ? "not rated" : `scored ${formatScore(score, mode)}, ${tierForScore(score).letter} tier`;
  const content = (
    <>
      <Cartridge
        game={game}
        size="board"
        selected={selected}
        scoreText={score === null ? undefined : formatScore(score, mode)}
      />
      <span className="block px-0.5 text-[13px] leading-[1.15]">{game.name}</span>
    </>
  );
  const layout = "flex w-[105px] flex-none flex-col gap-2 p-0 text-center text-ink";

  if (!onPick) {
    return (
      <div className={layout}>
        {content}
        <span className="sr-only">, {description}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      aria-label={`${game.name}, ${description}`}
      className={`${layout} border-0 bg-transparent transition-transform duration-[120ms] ease-[steps(2)] ${
        selected ? "-translate-x-0.5 -translate-y-1" : ""
      }`}
    >
      {content}
    </button>
  );
}
