import { tierForScore } from "@/data/tiers";
import { MAX_SCORE } from "@/lib/scores";

const SEGMENTS = Array.from({ length: MAX_SCORE }, (_, index) => index + 1);

type ScoreBarProps = {
  label: string;
  value: number | undefined;
  onPick: (value: number) => void;
};

export function ScoreBar({ label, value, onPick }: ScoreBarProps) {
  const fill = value === undefined ? undefined : tierForScore(value).color;
  return (
    <div role="group" aria-label={`${label} score`} className="flex gap-1">
      {SEGMENTS.map((segment) => {
        const filled = value !== undefined && segment <= value;
        return (
          <button
            key={segment}
            type="button"
            onClick={() => onPick(segment)}
            aria-label={`${label}: ${segment} out of ${MAX_SCORE}`}
            aria-pressed={value === segment}
            className={`h-11 min-w-0 flex-1 border-3 border-ink p-0 ${
              filled ? "shadow-bevel" : "bg-track shadow-[inset_3px_3px_0_rgb(16_16_32/0.12)]"
            }`}
            style={filled ? { background: fill } : undefined}
          />
        );
      })}
    </div>
  );
}

const METER_SIZES = {
  page: { row: "gap-1", segment: "h-11" },
  card: { row: "gap-[3px]", segment: "h-6" },
} as const;

export function ScoreMeter({ value, size }: { value: number | undefined; size: keyof typeof METER_SIZES }) {
  const fill = value === undefined ? undefined : tierForScore(value).color;
  return (
    <div aria-hidden="true" className={`flex min-w-0 flex-auto ${METER_SIZES[size].row}`}>
      {SEGMENTS.map((segment) => {
        const filled = value !== undefined && segment <= value;
        return (
          <div
            key={segment}
            className={`box-border min-w-0 flex-1 border-3 border-ink ${METER_SIZES[size].segment} ${
              filled ? "shadow-bevel" : "bg-track shadow-[inset_3px_3px_0_rgb(16_16_32/0.12)]"
            }`}
            style={filled ? { background: fill } : undefined}
          />
        );
      })}
    </div>
  );
}

const BADGE_SIZES = {
  small: "size-11 text-base shadow-bevel",
  large: "size-14 text-[22px] shadow-[inset_4px_4px_0_rgb(255_255_255/0.4),inset_-4px_-4px_0_rgb(0_0_0/0.2)]",
  poster: "size-[72px] text-[30px] shadow-[inset_5px_5px_0_rgb(255_255_255/0.4),inset_-5px_-5px_0_rgb(0_0_0/0.2)]",
} as const;

export function OverallBadge({ average, size }: { average: number | null; size: keyof typeof BADGE_SIZES }) {
  const tier = average === null ? null : tierForScore(average);
  return (
    <span
      className={`box-border flex flex-none items-center justify-center border-3 border-ink font-display leading-none ${BADGE_SIZES[size]} ${
        tier ? "text-ink" : "bg-unrated text-muted"
      }`}
      style={tier ? { background: tier.color } : undefined}
    >
      {tier ? tier.letter : "–"}
    </span>
  );
}
