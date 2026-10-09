import { CATEGORIES, CATEGORY_IDS, type CategoryId } from "@/data/categories";
import { GAMES, isGameId, type Game } from "@/data/games";
import { TIERS, tierForScore, type Tier, type TierLetter } from "@/data/tiers";

export const MAX_SCORE = 5;

export const SCORING_MODES = ["simple", "advanced"] as const;

export type ScoringMode = (typeof SCORING_MODES)[number];

export type GameScores = Partial<Record<CategoryId, number>>;

export type Scores = {
  simple: Record<string, number>;
  advanced: Record<string, GameScores>;
};

export const NO_SCORES: Scores = { simple: {}, advanced: {} };

export type RatedGame = {
  game: Game;
  score: number;
};

export function isScoringMode(value: unknown): value is ScoringMode {
  return SCORING_MODES.includes(value as ScoringMode);
}

export function toggleSimpleScore(scores: Scores, gameId: string, value: number): Scores {
  const { [gameId]: current, ...rest } = scores.simple;
  return { ...scores, simple: current === value ? rest : { ...rest, [gameId]: value } };
}

export function toggleCategoryScore(scores: Scores, gameId: string, category: CategoryId, value: number): Scores {
  const { [category]: current, ...rest } = scores.advanced[gameId] ?? {};
  const next: GameScores = current === value ? rest : { ...rest, [category]: value };
  return { ...scores, advanced: { ...scores.advanced, [gameId]: next } };
}

function withoutGame<T>(entries: Record<string, T>, gameId: string): Record<string, T> {
  return Object.fromEntries(Object.entries(entries).filter(([id]) => id !== gameId));
}

export function clearScores(scores: Scores, mode: ScoringMode, gameId: string): Scores {
  return mode === "simple"
    ? { ...scores, simple: withoutGame(scores.simple, gameId) }
    : { ...scores, advanced: withoutGame(scores.advanced, gameId) };
}

export function scoredCategoryCount(scores: Scores, gameId: string): number {
  return CATEGORIES.filter((category) => scores.advanced[gameId]?.[category.id] !== undefined).length;
}

export function overallScore(scores: Scores, mode: ScoringMode, gameId: string): number | null {
  if (mode === "simple") return scores.simple[gameId] ?? null;
  const values = CATEGORIES.map((category) => scores.advanced[gameId]?.[category.id]).filter(
    (value): value is number => value !== undefined,
  );
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function formatScore(score: number | null, mode: ScoringMode): string {
  if (score === null) return "–";
  return mode === "simple" ? String(score) : score.toFixed(1);
}

export function tierRange(tier: Tier, mode: ScoringMode): string {
  return mode === "simple" ? tier.simpleRange : tier.range;
}

export function tierBoard(scores: Scores, mode: ScoringMode): Record<TierLetter, RatedGame[]> {
  const rated = GAMES.flatMap((game) => {
    const score = overallScore(scores, mode, game.id);
    return score === null ? [] : [{ game, score }];
  }).sort((a, b) => b.score - a.score);
  return Object.fromEntries(
    TIERS.map((tier) => [tier.letter, rated.filter((entry) => tierForScore(entry.score).letter === tier.letter)]),
  ) as Record<TierLetter, RatedGame[]>;
}

export function unratedGames(scores: Scores, mode: ScoringMode): Game[] {
  return GAMES.filter((game) => overallScore(scores, mode, game.id) === null);
}

function isScore(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_SCORE;
}

function entriesOf(value: unknown): [string, unknown][] {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? Object.entries(value) : [];
}

export function parseScores(value: unknown): Scores {
  const raw = Object.fromEntries(entriesOf(value));
  const simple: Record<string, number> = {};
  for (const [gameId, score] of entriesOf(raw.simple)) {
    if (isGameId(gameId) && isScore(score)) simple[gameId] = score;
  }
  const advanced: Record<string, GameScores> = {};
  for (const [gameId, rawGame] of entriesOf(raw.advanced)) {
    if (!isGameId(gameId)) continue;
    const gameScores: GameScores = {};
    for (const [category, score] of entriesOf(rawGame)) {
      if (CATEGORY_IDS.includes(category as CategoryId) && isScore(score)) gameScores[category as CategoryId] = score;
    }
    if (Object.keys(gameScores).length > 0) advanced[gameId] = gameScores;
  }
  return { simple, advanced };
}
