import type { Game } from "@/data/games";

function CartridgeArt({ game, scanClass }: { game: Game; scanClass: string }) {
  return (
    <>
      <span
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${game.c1} 0 50%, ${game.c2} 50% 100%)` }}
      />
      <span className={`scanlines absolute inset-0 ${scanClass}`} />
    </>
  );
}

export function SmallCartridge({ game, scoreText, selected }: { game: Game; scoreText?: string; selected: boolean }) {
  return (
    <span
      className={`relative box-border block h-[116px] w-[108px] flex-none rounded-[4px_4px_4px_12px] border-2 border-cart-edge bg-cart-shell ${
        selected ? "shadow-cart-small-selected" : "shadow-cart-small"
      }`}
    >
      <span className="absolute top-1 right-2 bottom-[13px] left-2 flex flex-col overflow-hidden rounded-[2px_2px_2px_5px] bg-cart-label shadow-cart-label-small">
        <span className="box-border h-[15px] flex-none px-1 pt-[3px] text-left font-display text-[9px] leading-none">
          {game.code}
        </span>
        <span className="relative block flex-auto">
          <CartridgeArt game={game} scanClass="[--scan:2px]" />
          {scoreText && (
            <span className="absolute right-[3px] bottom-[3px] bg-ink px-[3px] pt-[3px] pb-0.5 font-display text-[9px] leading-none text-cream">
              {scoreText}
            </span>
          )}
        </span>
        <span className="h-3 flex-none" />
      </span>
    </span>
  );
}

export function LargeCartridge({ game, footer }: { game: Game; footer: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative box-border h-[214px] w-[200px] flex-none rounded-[6px_6px_6px_20px] border-3 border-cart-edge bg-cart-shell shadow-cart-large"
    >
      <div className="absolute top-[9px] right-4 bottom-6 left-4 flex flex-col overflow-hidden rounded-[3px_3px_3px_8px] bg-cart-label shadow-cart-label-large">
        <span className="box-border h-7 flex-none px-2 pt-[7px] font-display text-sm leading-none">{game.code}</span>
        <div className="relative flex-auto">
          <CartridgeArt game={game} scanClass="[--scan:3px]" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink/78 px-2 py-1.5 font-display text-[9px] leading-none whitespace-nowrap text-cream">
            COVER ART
          </span>
        </div>
        <span className="box-border h-[21px] flex-none px-2 pt-1.5 text-right font-display text-[8px] leading-none text-cart-meta">
          {footer}
        </span>
      </div>
    </div>
  );
}
