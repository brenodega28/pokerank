import { CATEGORIES, CATEGORY_IDS, type CategoryId } from "@/data/categories";
import { GAMES, isGameId, type Game } from "@/data/games";
import { TIERS, tierForScore, type TierLetter } from "@/data/tiers";

export const MAX_SCORE = 10;

export type GameScores = Partial<Record<CategoryId, number>>;

export type Scores = Record<string, GameScores>;

export type RatedGame = {
  game: Game;
  average: number;
};

export function toggleScore(scores: Scores, gameId: string, category: CategoryId, value: number): Scores {
  const { [category]: current, ...rest } = scores[gameId] ?? {};
  const next: GameScores = current === value ? rest : { ...rest, [category]: value };
  return { ...scores, [gameId]: next };
}

export function clearScores(scores: Scores, gameId: string): Scores {
  return Object.fromEntries(Object.entries(scores).filter(([id]) => id !== gameId));
}

export function scoredCategoryCount(scores: Scores, gameId: string): number {
  return CATEGORIES.filter((category) => scores[gameId]?.[category.id] !== undefined).length;
}

export function averageScore(scores: Scores, gameId: string): number | null {
  const values = CATEGORIES.map((category) => scores[gameId]?.[category.id]).filter(
    (value): value is number => value !== undefined,
  );
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function formatAverage(average: number | null): string {
  return average === null ? "–" : average.toFixed(1);
}

export function tierBoard(scores: Scores): Record<TierLetter, RatedGame[]> {
  const rated = GAMES.flatMap((game) => {
    const average = averageScore(scores, game.id);
    return average === null ? [] : [{ game, average }];
  }).sort((a, b) => b.average - a.average);
  return Object.fromEntries(
    TIERS.map((tier) => [tier.letter, rated.filter((entry) => tierForScore(entry.average).letter === tier.letter)]),
  ) as Record<TierLetter, RatedGame[]>;
}

export function unratedGames(scores: Scores): Game[] {
  return GAMES.filter((game) => averageScore(scores, game.id) === null);
}

function isScore(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_SCORE;
}

export function parseScores(value: unknown): Scores {
  if (typeof value !== "object" || value === null) return {};
  const scores: Scores = {};
  for (const [gameId, raw] of Object.entries(value)) {
    if (!isGameId(gameId) || typeof raw !== "object" || raw === null) continue;
    const gameScores: GameScores = {};
    for (const category of CATEGORY_IDS) {
      const score = (raw as Record<string, unknown>)[category];
      if (isScore(score)) gameScores[category] = score;
    }
    if (Object.keys(gameScores).length > 0) scores[gameId] = gameScores;
  }
  return scores;
}
