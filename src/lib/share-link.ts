import { CATEGORY_IDS, type CategoryId } from "@/data/categories";
import { GAMES, isGameId } from "@/data/games";
import { MAX_SCORE, type GameScores, type Scores, type ScoringMode } from "@/lib/scores";

export const SITE_DOMAIN = "pokeranked.com";
export const MAX_NAME_LENGTH = 24;

const LINK_VERSION = "2";
const MODE_CODES: Record<ScoringMode, string> = { simple: "s", advanced: "a" };
const ENTRY_LENGTHS: Record<ScoringMode, number> = { simple: 1, advanced: CATEGORY_IDS.length };
const SCORE_CODE = new RegExp(`^[0-${MAX_SCORE}]+$`);

export type ShareKind = "board" | "game";

export type SharedRanking =
  | { kind: "board"; mode: ScoringMode; scores: Scores; name: string }
  | { kind: "game"; gameId: string; mode: ScoringMode; scores: Scores; name: string };

export function cleanName(name: string): string {
  return name.trim().replace(/^@+/, "").trim().slice(0, MAX_NAME_LENGTH);
}

function encodeEntry(scores: Scores, mode: ScoringMode, gameId: string): string | null {
  if (mode === "simple") {
    const score = scores.simple[gameId];
    return score === undefined ? null : gameId + score;
  }
  const gameScores = scores.advanced[gameId];
  if (!gameScores || Object.keys(gameScores).length === 0) return null;
  return gameId + CATEGORY_IDS.map((category) => gameScores[category] ?? 0).join("");
}

function decodeEntry(scores: Scores, mode: ScoringMode, gameId: string, code: string): boolean {
  if (!SCORE_CODE.test(code)) return false;
  const values = [...code].map(Number);
  if (mode === "simple") {
    if (values[0] > 0) scores.simple[gameId] = values[0];
    return true;
  }
  const gameScores: GameScores = {};
  values.forEach((value, index) => {
    if (value > 0) gameScores[CATEGORY_IDS[index] as CategoryId] = value;
  });
  if (Object.keys(gameScores).length > 0) scores.advanced[gameId] = gameScores;
  return true;
}

export function shareHash(ranking: SharedRanking): string {
  const { mode, scores } = ranking;
  const entries =
    ranking.kind === "board"
      ? GAMES.map((game) => encodeEntry(scores, mode, game.id))
      : [encodeEntry(scores, mode, ranking.gameId) ?? ranking.gameId + "0".repeat(ENTRY_LENGTHS[mode])];
  const params = new URLSearchParams({
    v: LINK_VERSION,
    k: ranking.kind === "board" ? "b" : "g",
    m: MODE_CODES[mode],
    s: entries.filter((entry): entry is string => entry !== null).join("."),
  });
  const name = cleanName(ranking.name);
  if (name) params.set("n", name);
  return params.toString();
}

export function parseShareHash(hash: string): SharedRanking | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.get("v") !== LINK_VERSION) return null;
  const mode = (Object.keys(MODE_CODES) as ScoringMode[]).find((key) => MODE_CODES[key] === params.get("m"));
  if (!mode) return null;
  const entryLength = ENTRY_LENGTHS[mode];
  const entries = (params.get("s") ?? "").split(".").filter(Boolean);
  const scores: Scores = { simple: {}, advanced: {} };
  const gameIds: string[] = [];
  for (const entry of entries) {
    const gameId = entry.slice(0, -entryLength);
    if (!isGameId(gameId) || !decodeEntry(scores, mode, gameId, entry.slice(-entryLength))) return null;
    gameIds.push(gameId);
  }
  const name = cleanName(params.get("n") ?? "");
  const kind = params.get("k");
  if (kind === "b") return { kind: "board", mode, scores, name };
  if (kind === "g" && gameIds.length === 1) return { kind: "game", gameId: gameIds[0], mode, scores, name };
  return null;
}
