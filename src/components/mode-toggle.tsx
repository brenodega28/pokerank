"use client";

import { PixelCaret, pixelButtonClass } from "@/components/ui";
import { SCORING_MODES } from "@/lib/scores";
import { setScoringMode, useScoringMode } from "@/lib/score-store";

export function ModeToggle() {
  const current = useScoringMode();
  return (
    <div role="group" aria-label="Scoring mode" className="flex flex-wrap items-center gap-2">
      <span className="pr-1 font-display text-[10px] leading-[1.2] text-muted">MODE</span>
      {SCORING_MODES.map((mode) => {
        const pressed = mode === current;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={pressed}
            onClick={() => setScoringMode(mode)}
            className={pixelButtonClass(pressed ? "selected" : "light")}
          >
            {pressed && <PixelCaret />}
            <span>{mode.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
