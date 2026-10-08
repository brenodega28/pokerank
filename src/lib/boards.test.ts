import { describe, expect, it } from "vitest";
import { GAMES } from "@/data/games";
import { emptyBoards, parseBoards, placeGame, rankedCount, tierOf, unrankedGameIds } from "@/lib/boards";

describe("placeGame", () => {
  it("appends the game to the chosen tier", () => {
    const once = placeGame(emptyBoards(), "pokedex", "hgss", "S");
    const twice = placeGame(once, "pokedex", "bw", "S");
    expect(twice.pokedex.S).toEqual(["hgss", "bw"]);
  });

  it("moves a game out of its previous tier", () => {
    const placed = placeGame(emptyBoards(), "story", "e", "A");
    const moved = placeGame(placed, "story", "e", "C");
    expect(moved.story.A).toEqual([]);
    expect(moved.story.C).toEqual(["e"]);
  });

  it("unranks the game when the tier is null", () => {
    const placed = placeGame(emptyBoards(), "region", "pt", "B");
    const unranked = placeGame(placed, "region", "pt", null);
    expect(tierOf(unranked.region, "pt")).toBeNull();
  });

  it("only changes the given category and leaves the input untouched", () => {
    const before = emptyBoards();
    const after = placeGame(before, "soundtrack", "sv", "D");
    expect(before.soundtrack.D).toEqual([]);
    expect(after.pokedex).toBe(before.pokedex);
    expect(tierOf(after.pokedex, "sv")).toBeNull();
  });
});

describe("board counts", () => {
  it("counts ranked games and lists the rest in catalogue order", () => {
    const boards = placeGame(placeGame(emptyBoards(), "pokedex", "y", "S"), "pokedex", "rb", "D");
    expect(rankedCount(boards.pokedex)).toBe(2);
    const unranked = unrankedGameIds(boards.pokedex);
    expect(unranked).toHaveLength(GAMES.length - 2);
    expect(unranked[0]).toBe("gs");
  });
});

describe("parseBoards", () => {
  it("falls back to empty boards for junk", () => {
    expect(parseBoards(null)).toEqual(emptyBoards());
    expect(parseBoards("nope")).toEqual(emptyBoards());
  });

  it("drops unknown games, duplicates and malformed tiers", () => {
    const parsed = parseBoards({
      pokedex: { S: ["hgss", "missingno", 7], A: ["hgss", "bw"], B: "bad" },
      story: { C: ["e"] },
    });
    expect(parsed.pokedex.S).toEqual(["hgss"]);
    expect(parsed.pokedex.A).toEqual(["bw"]);
    expect(parsed.pokedex.B).toEqual([]);
    expect(parsed.story.C).toEqual(["e"]);
    expect(parsed.region).toEqual(emptyBoards().region);
  });
});
