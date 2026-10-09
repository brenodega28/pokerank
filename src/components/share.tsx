"use client";

import { toBlob } from "html-to-image";
import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { SHARE_CARD_SIZES, ShareBoardCard, ShareGameCard } from "@/components/share-cards";
import type { Game } from "@/data/games";
import type { Scores, ScoringMode } from "@/lib/scores";
import { MAX_NAME_LENGTH, shareHash, type SharedRanking } from "@/lib/share-link";
import { setShareName, useShareName } from "@/lib/share-name-store";

export type ShareTarget = { kind: "board" } | { kind: "game"; game: Game };

export function shareFileName(target: ShareTarget): string {
  return target.kind === "board" ? "pokeranked-overall.png" : `pokeranked-${target.game.id}.png`;
}

export function shareSizeLabel(target: ShareTarget): string {
  const { width, height } = SHARE_CARD_SIZES[target.kind];
  return `${width} × ${height} px`;
}

type ShareCardPreviewProps = {
  target: ShareTarget;
  scores: Scores;
  mode: ScoringMode;
  name: string;
  maxWidth: number;
  cardRef: RefObject<HTMLDivElement | null>;
};

const PREVIEW_BORDER = 6;

export function ShareCardPreview({ target, scores, mode, name, maxWidth, cardRef }: ShareCardPreviewProps) {
  const size = SHARE_CARD_SIZES[target.kind];
  const slotRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(maxWidth + PREVIEW_BORDER);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const measure = () => {
      if (slot.clientWidth > 0) setAvailable(slot.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  const width = Math.min(maxWidth, available - PREVIEW_BORDER);
  const scale = width / size.width;
  return (
    <div ref={slotRef} className="flex w-full justify-center">
      <div
        aria-hidden="true"
        className="flex-none overflow-hidden border-3 border-ink-deep"
        style={{ width: width + PREVIEW_BORDER, height: Math.round(size.height * scale) + PREVIEW_BORDER }}
      >
        <div style={{ width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
          {target.kind === "board" ? (
            <ShareBoardCard scores={scores} mode={mode} name={name} cardRef={cardRef} />
          ) : (
            <ShareGameCard game={target.game} scores={scores} mode={mode} name={name} cardRef={cardRef} />
          )}
        </div>
      </div>
    </div>
  );
}

export function ShareNameField() {
  const name = useShareName();
  const inputId = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="font-display text-[11px] leading-[1.3] text-muted">
        YOUR NAME (OPTIONAL)
      </label>
      <input
        id={inputId}
        type="text"
        value={name}
        maxLength={MAX_NAME_LENGTH}
        autoComplete="nickname"
        placeholder="e.g. Ash"
        onChange={(event) => setShareName(event.target.value)}
        className="box-border min-h-11 w-full border-3 border-ink bg-cream px-3 font-body text-[17px] text-ink shadow-[inset_3px_3px_0_rgb(16_16_32/0.12)] placeholder:text-muted"
      />
      <span className="text-[15px] text-muted">Shown as @name on the picture and the link.</span>
    </div>
  );
}

type Status = { message: string; tone: "success" | "error" } | null;

async function capturePng(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const blob = await toBlob(node, {
    pixelRatio: 1,
    width: node.offsetWidth,
    height: node.offsetHeight,
  });
  if (!blob) throw new Error("Capture failed");
  return blob;
}

function shareText(target: ShareTarget): string {
  return target.kind === "board" ? "My Pokémon game tier board" : `My ${target.game.name} scores`;
}

const subscribeToNothing = () => () => {};

function useCanShareNatively(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => typeof navigator.share === "function",
    () => false,
  );
}

function isDomError(error: unknown, name: string): boolean {
  return error instanceof DOMException && error.name === name;
}

type ShareActionsProps = {
  target: ShareTarget;
  scores: Scores;
  mode: ScoringMode;
  cardRef: RefObject<HTMLDivElement | null>;
};

const downloadClass =
  "inline-flex min-h-[50px] items-center justify-center border-3 border-ink bg-accent px-[18px] font-display text-xs leading-[1.2] text-white shadow-raised-accent-strong text-shadow-on-accent disabled:opacity-60";
const secondaryClass =
  "inline-flex min-h-[46px] flex-[1_1_120px] items-center justify-center border-3 border-ink bg-cream px-3 font-display text-[10px] leading-[1.2] whitespace-nowrap text-ink shadow-raised disabled:opacity-60";

export function ShareActions({ target, scores, mode, cardRef }: ShareActionsProps) {
  const name = useShareName();
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const canShareNatively = useCanShareNatively();
  const preparedFile = useRef<{ name: string; file: File } | null>(null);

  const run = async (action: () => Promise<string | null>, failure: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setStatus(null);
    try {
      const message = await action();
      setStatus(message ? { message, tone: "success" } : null);
    } catch {
      setStatus({ message: failure, tone: "error" });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const node = () => {
    if (!cardRef.current) throw new Error("Card not ready");
    return cardRef.current;
  };

  const download = () =>
    run(async () => {
      const fileName = shareFileName(target);
      const url = URL.createObjectURL(await capturePng(node()));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return `Saved ${fileName}!`;
    }, "Couldn't make the picture. Please try again.");

  const copyImage = () =>
    run(async () => {
      const png = capturePng(node());
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      return "Picture copied to clipboard!";
    }, "Couldn't copy the picture. Try Download PNG instead.");

  const shareUrl = () => {
    const ranking: SharedRanking =
      target.kind === "board"
        ? { kind: "board", mode, scores, name }
        : { kind: "game", gameId: target.game.id, mode, scores, name };
    return `${window.location.origin}/share#${shareHash(ranking)}`;
  };

  const copyLink = () =>
    run(async () => {
      await navigator.clipboard.writeText(shareUrl());
      return "Link copied!";
    }, "Couldn't copy the link.");

  const shareNatively = () =>
    run(async () => {
      const prepared = preparedFile.current?.name === name ? preparedFile.current.file : null;
      const file = prepared ?? new File([await capturePng(node())], shareFileName(target), { type: "image/png" });
      const data: ShareData = { title: "PokéRanked", text: shareText(target), url: shareUrl() };
      try {
        await navigator.share(navigator.canShare?.({ files: [file] }) ? { ...data, files: [file] } : data);
        return "Shared!";
      } catch (error) {
        if (isDomError(error, "AbortError")) return null;
        if (!prepared && isDomError(error, "NotAllowedError")) {
          preparedFile.current = { name, file };
          return "Picture ready! Tap SHARE again.";
        }
        throw error;
      }
    }, "Couldn't open the share menu. Try Download PNG instead.");

  return (
    <div className="flex flex-col gap-2.5">
      {canShareNatively ? (
        <button type="button" onClick={shareNatively} disabled={busy} className={downloadClass}>
          SHARE
        </button>
      ) : (
        <button type="button" onClick={download} disabled={busy} className={downloadClass}>
          DOWNLOAD PNG
        </button>
      )}
      <div className="flex flex-wrap gap-2.5">
        {canShareNatively && (
          <button type="button" onClick={download} disabled={busy} className={secondaryClass}>
            DOWNLOAD PNG
          </button>
        )}
        <button type="button" onClick={copyImage} disabled={busy} className={secondaryClass}>
          COPY IMAGE
        </button>
        <button type="button" onClick={copyLink} disabled={busy} className={secondaryClass}>
          COPY LINK
        </button>
      </div>
      <p
        aria-live="polite"
        className={`m-0 min-h-6 text-[17px] font-semibold ${status?.tone === "error" ? "text-accent" : "text-success"}`}
      >
        {status?.message ?? ""}
      </p>
    </div>
  );
}
