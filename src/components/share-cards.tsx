"use client";

import { useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { Cartridge } from "@/components/cartridge";
import { OverallBadge, ScoreMeter } from "@/components/score-bar";
import { ProgressBar } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { GAMES, gameMetaLine, gameShortMetaLine, type Game } from "@/data/games";
import { TIERS } from "@/data/tiers";
import { averageScore, formatAverage, tierBoard, unratedGames, type Scores } from "@/lib/scores";
import { SITE_DOMAIN, cleanName } from "@/lib/share-link";

export const SHARE_CARD_SIZES = {
  board: { width: 1080, height: 1350 },
  game: { width: 1080, height: 1080 },
} as const;

function CardFrame({ children, className = "", fill = false }: { children: ReactNode; className?: string; fill?: boolean }) {
  return (
    <div
      className={`box-border rounded-[6px] border-6 border-card-edge bg-card-body py-[9px] pr-[51px] pl-[18px] shadow-card-poster ${
        fill ? "flex min-h-0 flex-auto flex-col" : ""
      } ${className}`}
    >
      <div className={`rounded-[3px] bg-paper ${fill ? "min-h-0 flex-auto" : ""}`}>{children}</div>
    </div>
  );
}

function CardLogo() {
  return <span className="font-display text-2xl leading-[1.2] text-shadow-logo-card">PokéRanked</span>;
}

function CardFooter({ name }: { name: string }) {
  const handle = cleanName(name);
  return (
    <CardFrame>
      <div className="flex justify-between gap-6 px-[22px] py-4 font-display text-sm leading-[1.3]">
        <span>{handle ? `@${handle}` : ""}</span>
        <span className="text-muted">{SITE_DOMAIN.toUpperCase()}</span>
      </div>
    </CardFrame>
  );
}

function CardShell({
  size,
  padding,
  cardRef,
  children,
}: {
  size: keyof typeof SHARE_CARD_SIZES;
  padding: string;
  cardRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  const { width, height } = SHARE_CARD_SIZES[size];
  return (
    <div
      ref={cardRef}
      className="bg-grass-tiles relative overflow-hidden font-body text-ink"
      style={{ width, height }}
    >
      <div className={`relative box-border flex h-full flex-col gap-[22px] ${padding}`}>{children}</div>
    </div>
  );
}

type ShareBoardCardProps = { scores: Scores; name: string; cardRef?: Ref<HTMLDivElement> };

const BOARD_ZOOM_STEPS = [1, 0.85, 0.72, 0.6];

function useFitZoom(signature: string) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ signature, step: 0 });
  const step = fit.signature === signature ? fit.step : 0;
  if (fit.signature !== signature) setFit({ signature, step: 0 });

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const rows = rowsRef.current;
    if (!body || !rows) return;
    const shrinkIfOverflowing = () => {
      if (body.clientHeight === 0 || rows.offsetHeight <= body.clientHeight + 1) return;
      setFit((current) =>
        current.signature === signature && current.step < BOARD_ZOOM_STEPS.length - 1
          ? { signature, step: current.step + 1 }
          : current,
      );
    };
    shrinkIfOverflowing();
    const observer = new ResizeObserver(shrinkIfOverflowing);
    observer.observe(body);
    observer.observe(rows);
    return () => observer.disconnect();
  }, [signature, step]);

  return { bodyRef, rowsRef, zoom: BOARD_ZOOM_STEPS[step] };
}

export function ShareBoardCard({ scores, name, cardRef }: ShareBoardCardProps) {
  const board = tierBoard(scores);
  const { bodyRef, rowsRef, zoom } = useFitZoom(JSON.stringify(scores));
  const rated = GAMES.length - unratedGames(scores).length;
  const criteria = CATEGORIES.map((category) => category.label.toUpperCase()).join(" · ");

  return (
    <CardShell size="board" padding="p-10" cardRef={cardRef}>
      <CardFrame>
        <div className="flex items-start justify-between gap-6 px-6 py-5">
          <div className="flex min-w-0 flex-col gap-3.5">
            <span className="font-display text-lg leading-[1.3] text-muted">MY POKÉMON GAMES,</span>
            <span className="font-display text-[56px] leading-[1.1]">RANKED</span>
            <span className="font-display text-xs leading-[1.5] text-muted">SCORED ON {criteria}</span>
          </div>
          <div className="flex w-60 flex-none flex-col items-end gap-3.5">
            <CardLogo />
            <span className="font-display text-[13px] leading-[1.3] text-muted">
              {rated}/{GAMES.length} RATED
            </span>
            <div className="w-full">
              <ProgressBar value={rated} max={GAMES.length} label="Games rated" />
            </div>
          </div>
        </div>
      </CardFrame>

      <CardFrame fill>
        <div ref={bodyRef} className="h-full overflow-hidden">
          <div ref={rowsRef} className="box-border flex min-h-full flex-col gap-2.5 p-2.5">
            {TIERS.map((tier) => (
              <div key={tier.letter} className="flex flex-1 gap-2.5">
                <div
                  className="flex w-24 flex-none flex-col items-center justify-center gap-3.5 border-3 border-ink text-ink shadow-tier-label-poster"
                  style={{ background: tier.color }}
                >
                  <span className="font-display text-[40px] leading-none text-shadow-tier-poster">{tier.letter}</span>
                  <span className="font-display text-xs leading-none">{tier.range}</span>
                </div>
                <div className="flex min-w-0 flex-auto flex-wrap content-start items-stretch gap-2 border-3 border-ink bg-track p-2.5 shadow-well">
                  {board[tier.letter].map(({ game, average }) => (
                    <div key={game.id} className="flex w-[110px] flex-none flex-col gap-1.5 text-center" style={{ zoom }}>
                      <Cartridge game={game} size="card" scoreText={formatAverage(average)} />
                      <span className="text-xs leading-[1.15]">{game.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardFrame>

      <CardFooter name={name} />
    </CardShell>
  );
}

type ShareGameCardProps = { game: Game; scores: Scores; name: string; cardRef?: Ref<HTMLDivElement> };

export function ShareGameCard({ game, scores, name, cardRef }: ShareGameCardProps) {
  const average = averageScore(scores, game.id);

  return (
    <CardShell size="game" padding="p-12" cardRef={cardRef}>
      <CardFrame>
        <div className="flex items-center justify-between gap-6 px-[22px] py-[18px]">
          <CardLogo />
          <span className="font-display text-sm leading-[1.3] text-muted">MY RATING</span>
        </div>
      </CardFrame>

      <div className="flex min-h-0 flex-auto items-center">
        <CardFrame className="w-full">
          <div className="flex items-center gap-9 p-7">
            <Cartridge game={game} size="poster" footer={gameShortMetaLine(game)} />
            <div className="flex min-w-0 flex-auto flex-col gap-[22px]">
              <div className="flex flex-col gap-3.5">
                <span className="font-display text-xs leading-[1.4] text-muted">{gameMetaLine(game)}</span>
                <span className="font-display text-2xl leading-[1.4] uppercase">{game.name}</span>
              </div>

              <div className="flex items-center gap-[18px] border-3 border-ink bg-track p-3 shadow-well">
                <OverallBadge average={average} size="poster" />
                <div className="flex flex-col gap-3">
                  <span className="font-display text-xs leading-[1.2] text-muted">OVERALL</span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-[32px] leading-none">{formatAverage(average)}</span>
                    <span className="font-display text-sm leading-none text-muted">/10</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {CATEGORIES.map((category) => {
                  const value = scores[game.id]?.[category.id];
                  return (
                    <div key={category.id} className="flex items-center gap-3">
                      <span className="w-[140px] flex-none font-display text-[11px] leading-[1.2] uppercase">
                        {category.label}
                      </span>
                      <ScoreMeter value={value} size="card" />
                      <span className="w-[34px] flex-none text-right font-display text-[15px] leading-none">
                        {value ?? "–"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardFrame>
      </div>

      <CardFooter name={name} />
    </CardShell>
  );
}
