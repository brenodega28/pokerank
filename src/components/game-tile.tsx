import { CartridgeArt } from "@/components/cartridge";
import type { Game } from "@/data/games";
import type { TierLetter } from "@/data/tiers";

type GameTileProps = {
  game: Game;
  tier: TierLetter | null;
  selected: boolean;
  onPick: () => void;
};

export function GameTile({ game, tier, selected, onPick }: GameTileProps) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      aria-label={`${game.name}, ${tier ? `${tier} tier` : "not ranked"}`}
      className={`flex w-[108px] flex-none flex-col border-3 border-ink bg-cream p-0 text-left text-ink transition-transform duration-[120ms] ease-[steps(2)] ${
        selected ? "-translate-x-0.5 -translate-y-1 shadow-selected" : "shadow-tile"
      }`}
    >
      <CartridgeArt game={game} size="small" />
    </button>
  );
}
