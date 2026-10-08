import type { Game } from "@/data/games";

const SIZES = {
  small: {
    stripeBand: "h-7 border-b-3",
    stripes: "inset-x-2 top-[7px] h-3 [--stripe:3px]",
    label: "m-1 gap-[5px] border-2 px-[5px] py-1.5",
    code: "text-xs leading-[1.2]",
    name: "text-[13px] leading-[1.15]",
  },
  large: {
    stripeBand: "h-[72px] border-b-4",
    stripes: "inset-x-3.5 top-4 h-9 [--stripe:4px]",
    label: "m-2 gap-2.5 border-3 p-3",
    code: "text-[26px] leading-[1.1]",
    name: "text-base leading-[1.2]",
  },
} as const;

export function CartridgeArt({ game, size }: { game: Game; size: keyof typeof SIZES }) {
  const sizing = SIZES[size];
  return (
    <>
      <span className={`relative flex flex-none border-ink ${sizing.stripeBand}`}>
        <span className="flex-1" style={{ background: game.c1 }} />
        <span className="flex-1" style={{ background: game.c2 }} />
        <span className={`stripes absolute ${sizing.stripes}`} />
      </span>
      <span className={`flex flex-auto flex-col border-label-border bg-paper ${sizing.label}`}>
        <span className={`font-display ${sizing.code}`}>{game.code}</span>
        <span className={`text-subtle ${sizing.name}`}>{game.name}</span>
      </span>
    </>
  );
}

export function LargeCartridge({ game }: { game: Game }) {
  return (
    <div aria-hidden="true" className="flex w-[200px] flex-none flex-col border-4 border-ink bg-cream shadow-[6px_6px_0_rgb(16_16_32/0.35)]">
      <CartridgeArt game={game} size="large" />
    </div>
  );
}
