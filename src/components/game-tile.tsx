import { SmallCartridge } from "@/components/cartridge";
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
      className={`flex w-[108px] flex-none flex-col gap-2 border-0 bg-transparent p-0 text-center text-ink transition-transform duration-[120ms] ease-[steps(2)] ${
        selected ? "-translate-x-0.5 -translate-y-1" : ""
      }`}
    >
      <SmallCartridge
        game={game}
        selected={selected}
        scoreText={average === null ? undefined : formatAverage(average)}
      />
      <span className="block px-0.5 text-[13px] leading-[1.15]">{game.name}</span>
    </button>
  );
}
