import { describe, expect, it } from "vitest";
import { cleanName, parseShareHash, shareHash } from "@/lib/share-link";
import type { Scores } from "@/lib/scores";

const scores: Scores = {
  hgss: { pokedex: 9, region: 10, story: 8, soundtrack: 10, progression: 8, difficulty: 8, graphics: 10 },
  bw: { story: 10, graphics: 1 },
  e: {},
};

describe("shareHash", () => {
  it("encodes rated games in catalogue order with one character per category", () => {
    expect(shareHash({ kind: "board", scores, name: "" })).toBe("v=1&k=b&s=hgss9a8a88a.bw00a0001");
  });

  it("adds a cleaned name", () => {
    expect(shareHash({ kind: "board", scores: {}, name: "  @@Ash Ketchum " })).toBe("v=1&k=b&s=&n=Ash+Ketchum");
  });

  it("encodes a single game, even without scores", () => {
    expect(shareHash({ kind: "game", gameId: "bw", scores, name: "" })).toBe("v=1&k=g&s=bw00a0001");
    expect(shareHash({ kind: "game", gameId: "rb", scores, name: "" })).toBe("v=1&k=g&s=rb0000000");
  });
});

describe("parseShareHash", () => {
  it("round-trips a board and a game", () => {
    const board = parseShareHash("#" + shareHash({ kind: "board", scores, name: "Misty" }));
    expect(board).toEqual({ kind: "board", scores: { hgss: scores.hgss, bw: scores.bw }, name: "Misty" });
    const game = parseShareHash(shareHash({ kind: "game", gameId: "hgss", scores, name: "" }));
    expect(game).toEqual({ kind: "game", gameId: "hgss", scores: { hgss: scores.hgss }, name: "" });
  });

  it("rejects broken or unknown links", () => {
    expect(parseShareHash("")).toBeNull();
    expect(parseShareHash("#v=2&k=b&s=")).toBeNull();
    expect(parseShareHash("#v=1&k=x&s=")).toBeNull();
    expect(parseShareHash("#v=1&k=b&s=hgss9a8a")).toBeNull();
    expect(parseShareHash("#v=1&k=b&s=missingno9a8a88a")).toBeNull();
    expect(parseShareHash("#v=1&k=b&s=hgss9a8a88z")).toBeNull();
    expect(parseShareHash("#v=1&k=g&s=hgss9a8a88a.bw00a0001")).toBeNull();
  });

  it("caps the name length", () => {
    const parsed = parseShareHash("#v=1&k=b&s=&n=" + "a".repeat(40));
    expect(parsed?.name).toHaveLength(24);
  });
});

describe("cleanName", () => {
  it("strips leading @ and whitespace", () => {
    expect(cleanName("  @brock ")).toBe("brock");
  });
});
