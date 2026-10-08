import { CATEGORY_IDS, type CategoryId } from "@/data/categories";
import { GAMES, isGameId } from "@/data/games";
import { TIER_LETTERS, type TierLetter } from "@/data/tiers";

export type Board = Record<TierLetter, string[]>;

export type Boards = Record<CategoryId, Board>;

export function emptyBoard(): Board {
  return { S: [], A: [], B: [], C: [], D: [] };
}

export function emptyBoards(): Boards {
  return { pokedex: emptyBoard(), region: emptyBoard(), story: emptyBoard(), soundtrack: emptyBoard() };
}

export function tierOf(board: Board, gameId: string): TierLetter | null {
  return TIER_LETTERS.find((letter) => board[letter].includes(gameId)) ?? null;
}

export function placeGame(boards: Boards, category: CategoryId, gameId: string, tier: TierLetter | null): Boards {
  const withoutGame = Object.fromEntries(
    TIER_LETTERS.map((letter) => [letter, boards[category][letter].filter((id) => id !== gameId)]),
  ) as Board;
  if (tier) withoutGame[tier] = [...withoutGame[tier], gameId];
  return { ...boards, [category]: withoutGame };
}

export function rankedCount(board: Board): number {
  return TIER_LETTERS.reduce((count, letter) => count + board[letter].length, 0);
}

export function unrankedGameIds(board: Board): string[] {
  return GAMES.filter((game) => tierOf(board, game.id) === null).map((game) => game.id);
}

function parseBoard(value: unknown): Board {
  const board = emptyBoard();
  if (typeof value !== "object" || value === null) return board;
  const seen = new Set<string>();
  for (const letter of TIER_LETTERS) {
    const ids = (value as Record<string, unknown>)[letter];
    if (!Array.isArray(ids)) continue;
    for (const id of ids) {
      if (typeof id !== "string" || !isGameId(id) || seen.has(id)) continue;
      seen.add(id);
      board[letter].push(id);
    }
  }
  return board;
}

export function parseBoards(value: unknown): Boards {
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(CATEGORY_IDS.map((id) => [id, parseBoard(source[id])])) as Boards;
}
