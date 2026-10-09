import { describe, expect, it } from "vitest";
import { GAMES } from "@/data/games";
import { TIERS, tierForScore } from "@/data/tiers";
import {
  NO_SCORES,
  clearScores,
  formatScore,
  overallScore,
  parseScores,
  scoredCategoryCount,
  tierBoard,
  tierRange,
  toggleCategoryScore,
  toggleSimpleScore,
  unratedGames,
  type Scores,
} from "@/lib/scores";

function advanced(entries: Record<string, [number, number, number, number]>): Scores {
  return {
    simple: {},
    advanced: Object.fromEntries(
      Object.entries(entries).map(([id, [pokedex, region, story, soundtrack]]) => [id, { pokedex, region, story, soundtrack }]),
    ),
  };
}

describe("tierForScore", () => {
  it.each([
    [5, "S"],
    [4.5, "S"],
    [4.49, "A"],
    [4, "A"],
    [3.25, "B"],
    [2, "C"],
    [1.9, "D"],
    [1, "D"],
  ])("puts %d in %s", (score, letter) => {
    expect(tierForScore(score).letter).toBe(letter);
  });

  it("gives each whole simple score its own tier", () => {
    expect([5, 4, 3, 2, 1].map((score) => tierForScore(score).letter)).toEqual(["S", "A", "B", "C", "D"]);
    expect(TIERS.map((tier) => tierRange(tier, "simple"))).toEqual(["5", "4", "3", "2", "1"]);
    expect(TIERS.map((tier) => tierRange(tier, "advanced"))).toEqual(["4.5+", "4+", "3+", "2+", "<2"]);
  });
});

describe("toggleCategoryScore", () => {
  it("sets a score, replaces it, and clears it when the same value is picked again", () => {
    const set = toggleCategoryScore(NO_SCORES, "hgss", "story", 4);
    expect(set.advanced.hgss).toEqual({ story: 4 });
    const replaced = toggleCategoryScore(set, "hgss", "story", 3);
    expect(replaced.advanced.hgss).toEqual({ story: 3 });
    const cleared = toggleCategoryScore(replaced, "hgss", "story", 3);
    expect(cleared.advanced.hgss).toEqual({});
  });

  it("keeps other categories, games and the simple scores untouched", () => {
    const before = toggleCategoryScore(toggleSimpleScore(NO_SCORES, "bw", 5), "hgss", "story", 4);
    const after = toggleCategoryScore(before, "hgss", "pokedex", 5);
    expect(after.advanced.hgss).toEqual({ story: 4, pokedex: 5 });
    expect(after.simple).toBe(before.simple);
    expect(before.advanced.hgss).toEqual({ story: 4 });
  });
});

describe("toggleSimpleScore", () => {
  it("sets, replaces and clears one score per game without touching advanced scores", () => {
    const start = toggleCategoryScore(NO_SCORES, "e", "region", 2);
    const set = toggleSimpleScore(start, "e", 4);
    expect(set.simple).toEqual({ e: 4 });
    expect(set.advanced).toBe(start.advanced);
    expect(toggleSimpleScore(set, "e", 2).simple).toEqual({ e: 2 });
    expect(toggleSimpleScore(set, "e", 4).simple).toEqual({});
  });
});

describe("overallScore", () => {
  it("uses the single score in simple mode", () => {
    const scores = toggleCategoryScore(toggleSimpleScore(NO_SCORES, "e", 3), "e", "story", 5);
    expect(overallScore(scores, "simple", "e")).toBe(3);
    expect(overallScore(scores, "simple", "rb")).toBeNull();
    expect(formatScore(3, "simple")).toBe("3");
  });

  it("averages only the categories that have a score in advanced mode", () => {
    const scores = toggleCategoryScore(toggleCategoryScore(NO_SCORES, "e", "pokedex", 5), "e", "story", 2);
    expect(overallScore(scores, "advanced", "e")).toBe(3.5);
    expect(scoredCategoryCount(scores, "e")).toBe(2);
    expect(overallScore(scores, "advanced", "rb")).toBeNull();
    expect(formatScore(3.5, "advanced")).toBe("3.5");
    expect(formatScore(4, "advanced")).toBe("4.0");
    expect(formatScore(null, "advanced")).toBe("–");
  });

  it("counts and averages all seven categories", () => {
    const scores = parseScores({
      advanced: { hgss: { pokedex: 5, region: 5, story: 4, soundtrack: 5, progression: 4, difficulty: 4, graphics: 5 } },
    });
    expect(scoredCategoryCount(scores, "hgss")).toBe(7);
    expect(formatScore(overallScore(scores, "advanced", "hgss"), "advanced")).toBe("4.6");
  });
});

describe("clearScores", () => {
  it("removes the game's scores for the current mode only", () => {
    const scores = { ...advanced({ hgss: [5, 5, 4, 5], bw: [5, 4, 5, 5] }), simple: { hgss: 5 } };
    const clearedAdvanced = clearScores(scores, "advanced", "hgss");
    expect(overallScore(clearedAdvanced, "advanced", "hgss")).toBeNull();
    expect(clearedAdvanced.advanced.bw).toBe(scores.advanced.bw);
    expect(clearedAdvanced.simple).toBe(scores.simple);

    const clearedSimple = clearScores(scores, "simple", "hgss");
    expect(clearedSimple.simple).toEqual({});
    expect(clearedSimple.advanced).toBe(scores.advanced);
  });
});

describe("tierBoard", () => {
  it("groups games by average tier, best first, ties in catalogue order", () => {
    const scores = advanced({
      hgss: [5, 5, 4, 5],
      bw: [5, 4, 5, 4],
      pt: [4, 5, 4, 4],
      e: [4, 4, 4, 4],
      gs: [4, 4, 4, 4],
      lgpe: [1, 2, 1, 2],
    });
    const board = tierBoard(scores, "advanced");
    expect(board.S.map((entry) => entry.game.id)).toEqual(["hgss", "bw"]);
    expect(board.A.map((entry) => entry.game.id)).toEqual(["pt", "gs", "e"]);
    expect(board.B).toEqual([]);
    expect(board.D.map((entry) => [entry.game.id, entry.score])).toEqual([["lgpe", 1.5]]);
    expect(tierBoard(scores, "simple").S).toEqual([]);
  });

  it("puts each simple score straight into its tier", () => {
    const board = tierBoard({ simple: { rb: 5, bw: 5, e: 3, lgpe: 1 }, advanced: {} }, "simple");
    expect(board.S.map((entry) => entry.game.id)).toEqual(["rb", "bw"]);
    expect(board.B.map((entry) => entry.game.id)).toEqual(["e"]);
    expect(board.D.map((entry) => entry.game.id)).toEqual(["lgpe"]);
  });

  it("leaves games without scores in the unrated list for that mode", () => {
    const scores = { ...advanced({ rb: [4, 4, 3, 5] }), simple: { e: 2, bw: 4 } };
    expect(unratedGames(scores, "advanced")).toHaveLength(GAMES.length - 1);
    expect(unratedGames(scores, "advanced").map((game) => game.id)).not.toContain("rb");
    expect(unratedGames(scores, "simple")).toHaveLength(GAMES.length - 2);
    expect(unratedGames(scores, "simple").map((game) => game.id)).toContain("rb");
  });
});

describe("parseScores", () => {
  it("falls back to no scores for junk", () => {
    expect(parseScores(null)).toEqual(NO_SCORES);
    expect(parseScores("nope")).toEqual(NO_SCORES);
    expect(parseScores([1, 2])).toEqual(NO_SCORES);
    expect(parseScores({ simple: [3], advanced: "x" })).toEqual(NO_SCORES);
  });

  it("keeps only whole scores from 1 to 5 for known games and categories", () => {
    const parsed = parseScores({
      simple: { rb: 5, y: 6, c: 2.5, e: "3", missingno: 4, gs: 1 },
      advanced: {
        hgss: { pokedex: 5, region: 6, story: 3.5, soundtrack: "5", battles: 4 },
        bw: { story: 0 },
        missingno: { pokedex: 5 },
        e: { region: 1 },
      },
    });
    expect(parsed).toEqual({ simple: { rb: 5, gs: 1 }, advanced: { hgss: { pokedex: 5 }, e: { region: 1 } } });
  });
});
