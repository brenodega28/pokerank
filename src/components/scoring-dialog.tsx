"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { Cartridge } from "@/components/cartridge";
import { OverallBadge, ScoreBar } from "@/components/score-bar";
import { Panel, pixelButtonClass } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { gameShortMetaLine, type Game } from "@/data/games";
import {
  MAX_SCORE,
  clearScores,
  formatScore,
  toggleCategoryScore,
  toggleSimpleScore,
  type Scores,
  type ScoringMode,
} from "@/lib/scores";
import { updateScores } from "@/lib/score-store";

const CARD_MOTION = { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" };
const INSERT_DURATION = 760;
const INSERT_DIP = 0.12;
const INSERT_REST_LIFT = 0.25;
const INSERT_FLIGHT_START = 0.5;
const CARD_RETURN_MOTION = { duration: 260, easing: "cubic-bezier(0.4, 0, 0.6, 1)" };
const FADE_MOTION = { duration: 220, easing: "ease-out" };
const REDUCED_FADE_MOTION = { duration: 120, easing: "linear" };

export function tileCartridgeAttributes(gameId: string) {
  return { "data-tile-cartridge": gameId };
}

function findTileCartridge(gameId: string) {
  return document.querySelector<HTMLElement>(`[data-tile-cartridge="${CSS.escape(gameId)}"]`);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function transformFromTile(card: HTMLElement, tile: HTMLElement | null, verticalShift = 0): string {
  if (!tile) return "scale(0.6)";
  const from = tile.getBoundingClientRect();
  const to = card.getBoundingClientRect();
  const shiftY = verticalShift * from.height;
  return `translate(${from.left - to.left}px, ${from.top - to.top + shiftY}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}

function insertThenFlyKeyframes(card: HTMLElement, tile: HTMLElement | null): Keyframe[] {
  const atTile = (verticalShift: number) => transformFromTile(card, tile, verticalShift);
  return [
    { transform: atTile(0), easing: "cubic-bezier(0.5, 0, 0.75, 0)" },
    { transform: atTile(INSERT_DIP), offset: 0.13, easing: "cubic-bezier(0.25, 1.6, 0.5, 1)" },
    { transform: atTile(-INSERT_REST_LIFT), offset: 0.42 },
    { transform: atTile(-INSERT_REST_LIFT), offset: INSERT_FLIGHT_START, easing: CARD_MOTION.easing },
    { transform: "none" },
  ];
}

type ScoringDialogProps = {
  game: Game;
  scores: Scores;
  mode: ScoringMode;
  score: number | null;
  onShare: (gameId: string) => void;
  onClosed: () => void;
};

export function ScoringDialog({ game, scores, mode, score, onShare, onClosed }: ScoringDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const overlay = overlayRef.current;
    const card = cardRef.current;
    const panel = panelRef.current;
    if (!dialog || !overlay || !card || !panel) return;
    if (!dialog.open) dialog.showModal();
    for (const element of [overlay, card, panel]) {
      for (const animation of element.getAnimations()) animation.cancel();
    }

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    if (prefersReducedMotion()) {
      for (const element of [overlay, card, panel]) element.animate([{ opacity: 0 }, { opacity: 1 }], REDUCED_FADE_MOTION);
    } else {
      const flightDelay = INSERT_DURATION * INSERT_FLIGHT_START;
      card.animate(insertThenFlyKeyframes(card, findTileCartridge(game.id)), { duration: INSERT_DURATION });
      overlay.animate([{ opacity: 0 }, { opacity: 1 }], { ...FADE_MOTION, delay: flightDelay, fill: "backwards" });
      panel.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], {
        ...CARD_MOTION,
        delay: flightDelay + 80,
        fill: "backwards",
      });
    }

    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [game.id]);

  const close = async (afterClose?: () => void) => {
    const overlay = overlayRef.current;
    const card = cardRef.current;
    const panel = panelRef.current;
    if (closingRef.current || !overlay || !card || !panel) return;
    closingRef.current = true;

    const animations = prefersReducedMotion()
      ? [overlay, card, panel].map((element) =>
          element.animate([{ opacity: 1 }, { opacity: 0 }], { ...REDUCED_FADE_MOTION, fill: "forwards" }),
        )
      : [
          overlay.animate([{ opacity: 1 }, { opacity: 0 }], { ...CARD_RETURN_MOTION, fill: "forwards" }),
          panel.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(16px)" }], {
            ...FADE_MOTION,
            duration: 160,
            fill: "forwards",
          }),
          card.animate([{ transform: "none" }, { transform: transformFromTile(card, findTileCartridge(game.id)) }], {
            ...CARD_RETURN_MOTION,
            fill: "forwards",
          }),
        ];
    await Promise.allSettled(animations.map((animation) => animation.finished));
    dialogRef.current?.close();
    onClosed();
    if (afterClose) afterClose();
    else findTileCartridge(game.id)?.closest("button")?.focus({ preventScroll: true });
  };

  const scored = score !== null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="scoring-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={() => {
        if (!closingRef.current) onClosed();
      }}
      className="m-0 box-border size-full max-h-none max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 backdrop:bg-transparent"
    >
      <div
        ref={overlayRef}
        aria-hidden="true"
        onClick={() => close()}
        className="fixed inset-0 bg-ink/35 backdrop-blur-[3px]"
      />
      <div className="pointer-events-none relative mx-auto box-border flex min-h-full w-full max-w-[860px] flex-col items-center justify-center gap-6 px-3 py-6 sm:px-6">
        <div ref={cardRef} className="pointer-events-auto origin-top-left">
          <Cartridge game={game} size="page" footer={gameShortMetaLine(game)} />
        </div>

        <div ref={panelRef} className="pointer-events-auto w-full">
          <Panel className="box-border flex flex-col gap-4 py-3.5 pr-4 pl-5">
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
              <div className="flex min-w-0 flex-[1_1_260px] items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => close()}
                  aria-label="Close"
                  className="flex size-11 flex-none items-center justify-center border-3 border-ink bg-cream p-0 font-display text-sm leading-none text-ink shadow-raised"
                >
                  X
                </button>
                <h2 id="scoring-title" className="m-0 min-w-0 text-[19px] leading-[1.35] font-normal">
                  How good is <strong className="font-bold text-accent">{game.name}</strong>?
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2.5 pr-2">
                  <span className="font-display text-[10px] leading-[1.2] text-muted">OVERALL</span>
                  <OverallBadge score={score} size="small" />
                  <span className="font-display text-sm leading-none">
                    {score === null ? "–" : `${formatScore(score, mode)}/${MAX_SCORE}`}
                  </span>
                </div>
                <Link href={`/games/${game.id}`} className={pixelButtonClass()}>
                  GAME PAGE
                </Link>
                {scored && <ShareGameButton onClick={() => close(() => onShare(game.id))} className="max-sm:hidden" />}
                <DoneButton onClick={() => close()} className="max-sm:hidden" />
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))] gap-x-7 gap-y-3.5">
              {mode === "simple" ? (
                <ScoreRow
                  label="Score"
                  value={scores.simple[game.id]}
                  numbered
                  onPick={(picked) => updateScores((all) => toggleSimpleScore(all, game.id, picked))}
                />
              ) : (
                CATEGORIES.map((category) => (
                  <ScoreRow
                    key={category.id}
                    label={category.label}
                    value={scores.advanced[game.id]?.[category.id]}
                    onPick={(picked) => updateScores((all) => toggleCategoryScore(all, game.id, category.id, picked))}
                  />
                ))
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span className="text-[15px] text-muted">
                {mode === "simple"
                  ? "Its tier comes straight from this score. Tap a box again to clear it."
                  : "Overall is the average of the scores you set. Tap a box again to clear it."}
              </span>
              {scored && (
                <div className="flex gap-2.5 max-sm:w-full">
                  <button
                    type="button"
                    onClick={() => {
                      updateScores((all) => clearScores(all, mode, game.id));
                      requestAnimationFrame(() => close());
                    }}
                    className={`${pixelButtonClass()} max-sm:flex-1`}
                  >
                    CLEAR SCORE
                  </button>
                  <ShareGameButton onClick={() => close(() => onShare(game.id))} className="flex-1 sm:hidden" />
                </div>
              )}
              <DoneButton onClick={() => close()} className="w-full sm:hidden" />
            </div>
          </Panel>
        </div>
      </div>
    </dialog>
  );
}

type ActionButtonProps = { onClick: () => void; className: string };

function ShareGameButton({ onClick, className }: ActionButtonProps) {
  return (
    <button type="button" onClick={onClick} className={`${pixelButtonClass("accent")} ${className}`}>
      SHARE GAME
    </button>
  );
}

function DoneButton({ onClick, className }: ActionButtonProps) {
  return (
    <button type="button" onClick={onClick} className={`${pixelButtonClass("highlight")} ${className}`}>
      DONE
    </button>
  );
}

type ScoreRowProps = {
  label: string;
  value: number | undefined;
  numbered?: boolean;
  onPick: (value: number) => void;
};

function ScoreRow({ label, value, numbered, onPick }: ScoreRowProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex justify-between gap-3 font-display text-[10px] leading-[1.3]">
        <span className="uppercase">{label}</span>
        <span>
          {value ?? "–"}/{MAX_SCORE}
        </span>
      </div>
      <ScoreBar label={label} value={value} numbered={numbered} onPick={onPick} />
    </div>
  );
}
