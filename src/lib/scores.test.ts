import { describe, expect, it } from "vitest";
import { GAMES } from "@/data/games";
import { tierForScore } from "@/data/tiers";
import {
  averageScore,
  clearScores,
  formatAverage,
  parseScores,
  scoredCategoryCount,
  tierBoard,
  toggleScore,
  unratedGames,
  type Scores,
} from "@/lib/scores";

function scored(entries: Record<string, [number, number, number, number]>): Scores {
  return Object.fromEntries(
    Object.entries(entries).map(([id, [pokedex, region, story, soundtrack]]) => [id, { pokedex, region, story, soundtrack }]),
  );
}

describe("tierForScore", () => {
  it.each([
    [10, "S"],
    [9, "S"],
    [8.99, "A"],
    [8, "A"],
    [7.25, "B"],
    [5, "C"],
    [4.9, "D"],
    [1, "D"],
  ])("puts %d in %s", (score, letter) => {
    expect(tierForScore(score).letter).toBe(letter);
  });
});

describe("toggleScore", () => {
  it("sets a score, replaces it, and clears it when the same value is picked again", () => {
    const set = toggleScore({}, "hgss", "story", 8);
    expect(set.hgss).toEqual({ story: 8 });
    const replaced = toggleScore(set, "hgss", "story", 6);
    expect(replaced.hgss).toEqual({ story: 6 });
    const cleared = toggleScore(replaced, "hgss", "story", 6);
    expect(cleared.hgss).toEqual({});
  });

  it("keeps other categories and games untouched", () => {
    const before = toggleScore(toggleScore({}, "bw", "region", 9), "hgss", "story", 8);
    const after = toggleScore(before, "hgss", "pokedex", 10);
    expect(after.hgss).toEqual({ story: 8, pokedex: 10 });
    expect(after.bw).toBe(before.bw);
    expect(before.hgss).toEqual({ story: 8 });
  });
});

describe("averages", () => {
  it("averages only the categories that have a score", () => {
    const scores = toggleScore(toggleScore({}, "e", "pokedex", 9), "e", "story", 6);
    expect(averageScore(scores, "e")).toBe(7.5);
    expect(scoredCategoryCount(scores, "e")).toBe(2);
    expect(averageScore(scores, "rb")).toBeNull();
    expect(formatAverage(averageScore(scores, "e"))).toBe("7.5");
    expect(formatAverage(null)).toBe("–");
  });

  it("clearScores removes every score for the game", () => {
    const scores = scored({ hgss: [9, 10, 8, 10], bw: [9, 8, 10, 10] });
    const cleared = clearScores(scores, "hgss");
    expect(averageScore(cleared, "hgss")).toBeNull();
    expect(cleared.bw).toBe(scores.bw);
  });
});

describe("tierBoard", () => {
  it("groups games by average tier, best first, ties in catalogue order", () => {
    const board = tierBoard(
      scored({
        hgss: [9, 10, 8, 10],
        bw: [9, 8, 10, 10],
        pt: [9, 9, 8, 9],
        e: [8, 9, 7, 9],
        gs: [8, 9, 7, 9],
        lgpe: [4, 5, 3, 5],
      }),
    );
    expect(board.S.map((entry) => entry.game.id)).toEqual(["hgss", "bw"]);
    expect(board.A.map((entry) => entry.game.id)).toEqual(["pt", "gs", "e"]);
    expect(board.B).toEqual([]);
    expect(board.D.map((entry) => [entry.game.id, entry.average])).toEqual([["lgpe", 4.25]]);
  });

  it("leaves games without scores in the unrated list", () => {
    const scores = scored({ rb: [8, 7, 5, 9] });
    const unrated = unratedGames(scores);
    expect(unrated).toHaveLength(GAMES.length - 1);
    expect(unrated.map((game) => game.id)).not.toContain("rb");
  });
});

describe("parseScores", () => {
  it("falls back to no scores for junk", () => {
    expect(parseScores(null)).toEqual({});
    expect(parseScores("nope")).toEqual({});
    expect(parseScores([1, 2])).toEqual({});
  });

  it("keeps only whole scores from 1 to 10 for known games and categories", () => {
    const parsed = parseScores({
      hgss: { pokedex: 9, region: 11, story: 7.5, soundtrack: "10", graphics: 8 },
      bw: { story: 0 },
      missingno: { pokedex: 10 },
      e: { region: 1 },
    });
    expect(parsed).toEqual({ hgss: { pokedex: 9 }, e: { region: 1 } });
  });
});
