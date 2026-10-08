"use client";

import { useEffect, useRef } from "react";
import {
  ShareActions,
  ShareCardPreview,
  ShareNameField,
  shareFileName,
  shareSizeLabel,
  type ShareTarget,
} from "@/components/share";
import { PixelCaret, pixelButtonClass } from "@/components/ui";
import { GAMES, findGame } from "@/data/games";
import type { Scores } from "@/lib/scores";
import { useShareName } from "@/lib/share-name-store";

export type ShareDialogState = { kind: "board" } | { kind: "game"; gameId: string };

type ShareDialogProps = {
  state: ShareDialogState | null;
  scores: Scores;
  onChange: (state: ShareDialogState) => void;
  onClose: () => void;
};

const legendClass = "mb-3 p-0 font-display text-[11px] leading-[1.3] text-muted";

export function ShareDialog({ state, scores, onChange, onClose }: ShareDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const name = useShareName();
  const open = state !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const game = state?.kind === "game" ? findGame(state.gameId) : undefined;
  const target: ShareTarget | null = state?.kind === "board" ? { kind: "board" } : game ? { kind: "game", game } : null;
  const lastGameId = state?.kind === "game" ? state.gameId : GAMES[0].id;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="share-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto box-border max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-[928px] overflow-y-auto overscroll-contain bg-transparent p-0 pr-2 pb-2 backdrop:bg-ink/60"
    >
      {target && (
        <div className="box-border rounded-[4px] border-4 border-card-edge bg-card-body py-1.5 pr-[clamp(16px,3vw,34px)] pl-3 shadow-[inset_0_-2px_0_var(--color-card-trim-edge),inset_0_0_0_2px_var(--color-card-trim),inset_0_-6px_0_var(--color-card-lip),8px_8px_0_rgb(16_16_32/0.5)]">
          <div className="flex flex-col gap-5 rounded-[2px] bg-paper p-[clamp(16px,3vw,26px)]">
            <div className="flex items-center justify-between gap-3">
              <h2 id="share-title" className="m-0 font-display text-[clamp(14px,2vw,18px)] leading-[1.3] font-normal">
                SHARE A PICTURE
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-11 flex-none items-center justify-center border-3 border-ink bg-cream p-0 font-display text-sm leading-none text-ink shadow-raised"
              >
                X
              </button>
            </div>

            <div className="flex flex-wrap items-start gap-6">
              <div className="flex min-w-0 flex-[1_1_340px] flex-col items-center gap-3 border-3 border-ink bg-well-dark p-4 shadow-well-dark">
                <ShareCardPreview target={target} scores={scores} name={name} maxWidth={324} cardRef={cardRef} />
                <span className="text-[15px] text-well-dark-text">
                  {shareSizeLabel(target)} · {shareFileName(target)}
                </span>
              </div>

              <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend className={legendClass}>PICTURE OF</legend>
                  <div className="flex flex-wrap gap-2">
                    {(["board", "game"] as const).map((kind) => {
                      const pressed = target.kind === kind;
                      return (
                        <button
                          key={kind}
                          type="button"
                          aria-pressed={pressed}
                          onClick={() => onChange(kind === "board" ? { kind } : { kind, gameId: lastGameId })}
                          className={pixelButtonClass(pressed ? "selected" : "light")}
                        >
                          {pressed && <PixelCaret />}
                          <span>{kind === "board" ? "WHOLE BOARD" : "ONE GAME"}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {target.kind === "game" && (
                  <fieldset className="m-0 min-w-0 border-0 p-0">
                    <legend className={legendClass}>GAME</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {GAMES.map((option) => {
                        const pressed = option.id === target.game.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={pressed}
                            aria-label={option.name}
                            onClick={() => onChange({ kind: "game", gameId: option.id })}
                            className={`min-h-11 min-w-[52px] border-3 border-ink px-2 font-display text-[10px] leading-none text-ink shadow-raised-flat ${
                              pressed ? "bg-highlight" : "bg-cream"
                            }`}
                          >
                            {option.code}
                          </button>
                        );
                      })}
                    </div>
                    <p className="m-0 mt-3 text-base text-muted">
                      {target.game.name}: its overall tier and every score
                    </p>
                  </fieldset>
                )}

                <ShareNameField />
                <ShareActions
                  key={target.kind === "board" ? "board" : target.game.id}
                  target={target}
                  scores={scores}
                  cardRef={cardRef}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
