import { CartridgeArt } from "@/components/cartridge";
import type { Game } from "@/data/games";
import { tierForScore } from "@/data/tiers";
import { formatAverage } from "@/lib/scores";

type GameTileProps = {
  game: Game;
  average: number | null;
  selected: boolean;
  onPick: () => void;
};

export function GameTile({ game, average, selected, onPick }: GameTileProps) {
  const description =
    average === null ? "not rated" : `scored ${formatAverage(average)}, ${tierForScore(average).letter} tier`;
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      aria-label={`${game.name}, ${description}`}
      className={`flex w-[108px] flex-none flex-col border-3 border-ink bg-cream p-0 text-left text-ink transition-transform duration-[120ms] ease-[steps(2)] ${
        selected ? "-translate-x-0.5 -translate-y-1 shadow-selected" : "shadow-tile"
      }`}
    >
      <CartridgeArt game={game} size="small" scoreText={average === null ? undefined : formatAverage(average)} />
    </button>
  );
}
