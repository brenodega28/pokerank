import { coverArtPath, type Game } from "@/data/games";

const SIZES = {
  board: {
    shell: "h-[113px] w-[105px] rounded-[4px_4px_4px_12px] border-2",
    shellShadow: "shadow-cart-small",
    label: "top-1 right-2 bottom-[13px] left-2 rounded-[2px_2px_2px_5px] shadow-cart-label-small",
    code: "h-[15px] px-1 pt-[3px] text-[9px]",
    scan: "[--scan:2px]",
    badge: "right-[3px] bottom-[3px] px-[3px] pt-[3px] pb-0.5 text-[9px]",
    footer: "h-3 px-[3px] pt-[3px] text-[5.5px] tracking-[-0.25px] whitespace-nowrap",
  },
  card: {
    shell: "h-[100px] w-[94px] rounded-[4px_4px_4px_11px] border-2",
    shellShadow: "shadow-cart-small",
    label: "top-1 right-[7px] bottom-[11px] left-[7px] rounded-[2px_2px_2px_5px] shadow-cart-label-small",
    code: "h-3.5 px-1 pt-[3px] text-[8px]",
    scan: "[--scan:2px]",
    badge: "right-[3px] bottom-[3px] px-[3px] pt-[3px] pb-0.5 text-[9px]",
    footer: null,
  },
  page: {
    shell: "h-[209px] w-[196px] rounded-[6px_6px_6px_20px] border-3",
    shellShadow: "shadow-cart-large",
    label: "top-[9px] right-4 bottom-6 left-4 rounded-[3px_3px_3px_8px] shadow-cart-label-large",
    code: "h-7 px-2 pt-[7px] text-sm",
    scan: "[--scan:3px]",
    badge: "",
    footer: "h-[21px] px-2 pt-1.5 text-[8px]",
  },
  poster: {
    shell: "h-[293px] w-[274px] rounded-[8px_8px_8px_28px] border-4",
    shellShadow: "shadow-cart-poster",
    label: "top-3 right-[22px] bottom-[34px] left-[22px] rounded-[4px_4px_4px_12px] shadow-cart-label-poster",
    code: "h-10 px-3 pt-2.5 text-[22px]",
    scan: "[--scan:3px]",
    badge: "",
    footer: "h-[30px] px-3 pt-[9px] text-[11px]",
  },
} as const;

const COVER_CROP_POSITIONS = {
  top: "object-[50%_25%]",
  center: "object-center",
  bottom: "object-[50%_75%]",
} as const;

export type CartridgeSize = keyof typeof SIZES;

type CartridgeProps = {
  game: Game;
  size: CartridgeSize;
  scoreText?: string;
  footer?: string;
  liftOnHover?: boolean;
};

const LIFT_ON_HOVER =
  "motion-safe:transition-[translate,box-shadow] motion-safe:duration-[160ms] motion-safe:ease-out group-hover:-translate-y-[5px] group-hover:shadow-cart-small-lifted group-focus-visible:-translate-y-[5px] group-focus-visible:shadow-cart-small-lifted";

export function Cartridge({ game, size, scoreText, footer, liftOnHover = false }: CartridgeProps) {
  const sizing = SIZES[size];
  return (
    <span
      aria-hidden="true"
      className={`relative box-border block flex-none border-cart-edge bg-cart-shell ${sizing.shell} ${sizing.shellShadow} ${
        liftOnHover ? LIFT_ON_HOVER : ""
      }`}
    >
      <span className={`absolute flex flex-col overflow-hidden bg-cart-label ${sizing.label}`}>
        <span className={`box-border flex-none text-left font-display leading-none ${sizing.code}`}>{game.code}</span>
        <span className="relative block flex-auto">
          <span
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${game.c1} 0 50%, ${game.c2} 50% 100%)` }}
          />
          <img
            src={coverArtPath(game)}
            alt=""
            draggable={false}
            className={`absolute inset-0 size-full object-cover ${COVER_CROP_POSITIONS[game.coverCrop ?? "center"]}`}
          />
          <span className={`scanlines absolute inset-0 ${sizing.scan}`} />
          {scoreText && (
            <span className={`absolute bg-ink font-display leading-none text-cream ${sizing.badge}`}>{scoreText}</span>
          )}
        </span>
        {sizing.footer && footer && (
          <span className={`box-border flex-none text-right font-display leading-none text-cart-meta ${sizing.footer}`}>
            {footer}
          </span>
        )}
      </span>
    </span>
  );
}
