import { CATEGORY_IDS, type CategoryId } from "@/data/categories";
import { GAMES, isGameId } from "@/data/games";
import { MAX_SCORE, type GameScores, type Scores } from "@/lib/scores";

export const SITE_DOMAIN = "pokeranked.com";
export const MAX_NAME_LENGTH = 24;

const LINK_VERSION = "1";
const SCORE_CHARS = "0123456789a";
const ENTRY_LENGTH = CATEGORY_IDS.length;

export type ShareKind = "board" | "game";

export type SharedRanking =
  | { kind: "board"; scores: Scores; name: string }
  | { kind: "game"; gameId: string; scores: Scores; name: string };

export function cleanName(name: string): string {
  return name.trim().replace(/^@+/, "").trim().slice(0, MAX_NAME_LENGTH);
}

function encodeGameScores(gameScores: GameScores): string {
  return CATEGORY_IDS.map((category) => SCORE_CHARS[gameScores[category] ?? 0]).join("");
}

function decodeGameScores(code: string): GameScores | null {
  if (code.length !== ENTRY_LENGTH) return null;
  const gameScores: GameScores = {};
  for (const [index, char] of [...code].entries()) {
    const score = SCORE_CHARS.indexOf(char);
    if (score < 0 || score > MAX_SCORE) return null;
    if (score > 0) gameScores[CATEGORY_IDS[index] as CategoryId] = score;
  }
  return gameScores;
}

function encodeEntry(scores: Scores, gameId: string): string | null {
  const gameScores = scores[gameId];
  if (!gameScores || Object.keys(gameScores).length === 0) return null;
  return gameId + encodeGameScores(gameScores);
}

export function shareHash(ranking: SharedRanking): string {
  const entries =
    ranking.kind === "board"
      ? GAMES.map((game) => encodeEntry(ranking.scores, game.id))
      : [encodeEntry(ranking.scores, ranking.gameId) ?? ranking.gameId + "0".repeat(ENTRY_LENGTH)];
  const params = new URLSearchParams({
    v: LINK_VERSION,
    k: ranking.kind === "board" ? "b" : "g",
    s: entries.filter((entry): entry is string => entry !== null).join("."),
  });
  const name = cleanName(ranking.name);
  if (name) params.set("n", name);
  return params.toString();
}

export function parseShareHash(hash: string): SharedRanking | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.get("v") !== LINK_VERSION) return null;
  const kind = params.get("k");
  const entries = (params.get("s") ?? "").split(".").filter(Boolean);
  const scores: Scores = {};
  const gameIds: string[] = [];
  for (const entry of entries) {
    const gameId = entry.slice(0, -ENTRY_LENGTH);
    const gameScores = decodeGameScores(entry.slice(-ENTRY_LENGTH));
    if (!isGameId(gameId) || !gameScores) return null;
    gameIds.push(gameId);
    if (Object.keys(gameScores).length > 0) scores[gameId] = gameScores;
  }
  const name = cleanName(params.get("n") ?? "");
  if (kind === "b") return { kind: "board", scores, name };
  if (kind === "g" && gameIds.length === 1) return { kind: "game", gameId: gameIds[0], scores, name };
  return null;
}
