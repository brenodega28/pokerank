import { describe, expect, it } from "vitest";
import { cleanName, parseShareHash, shareHash } from "@/lib/share-link";
import { NO_SCORES, type Scores } from "@/lib/scores";

const scores: Scores = {
  simple: { hgss: 5, bw: 3 },
  advanced: {
    hgss: { pokedex: 5, region: 5, story: 4, soundtrack: 5, progression: 4, difficulty: 4, graphics: 5 },
    bw: { story: 5, graphics: 1 },
    e: {},
  },
};

describe("shareHash", () => {
  it("encodes advanced scores in catalogue order with one digit per category", () => {
    expect(shareHash({ kind: "board", mode: "advanced", scores, name: "" })).toBe(
      "v=2&k=b&m=a&s=hgss5545445.bw0050001",
    );
  });

  it("encodes simple scores with one digit per game", () => {
    expect(shareHash({ kind: "board", mode: "simple", scores, name: "" })).toBe("v=2&k=b&m=s&s=hgss5.bw3");
  });

  it("adds a cleaned name", () => {
    expect(shareHash({ kind: "board", mode: "simple", scores: NO_SCORES, name: "  @@Ash Ketchum " })).toBe(
      "v=2&k=b&m=s&s=&n=Ash+Ketchum",
    );
  });

  it("encodes a single game, even without scores", () => {
    expect(shareHash({ kind: "game", gameId: "bw", mode: "advanced", scores, name: "" })).toBe("v=2&k=g&m=a&s=bw0050001");
    expect(shareHash({ kind: "game", gameId: "rb", mode: "advanced", scores, name: "" })).toBe("v=2&k=g&m=a&s=rb0000000");
    expect(shareHash({ kind: "game", gameId: "b2w2", mode: "simple", scores, name: "" })).toBe("v=2&k=g&m=s&s=b2w20");
  });
});

describe("parseShareHash", () => {
  it("round-trips an advanced board and game", () => {
    const board = parseShareHash("#" + shareHash({ kind: "board", mode: "advanced", scores, name: "Misty" }));
    expect(board).toEqual({
      kind: "board",
      mode: "advanced",
      scores: { simple: {}, advanced: { hgss: scores.advanced.hgss, bw: scores.advanced.bw } },
      name: "Misty",
    });
    const game = parseShareHash(shareHash({ kind: "game", gameId: "hgss", mode: "advanced", scores, name: "" }));
    expect(game).toEqual({
      kind: "game",
      gameId: "hgss",
      mode: "advanced",
      scores: { simple: {}, advanced: { hgss: scores.advanced.hgss } },
      name: "",
    });
  });

  it("round-trips a simple board and game, including game ids that end in a digit", () => {
    const withB2w2: Scores = { simple: { ...scores.simple, b2w2: 4 }, advanced: {} };
    const board = parseShareHash(shareHash({ kind: "board", mode: "simple", scores: withB2w2, name: "" }));
    expect(board).toEqual({ kind: "board", mode: "simple", scores: withB2w2, name: "" });
    const game = parseShareHash(shareHash({ kind: "game", gameId: "b2w2", mode: "simple", scores: NO_SCORES, name: "" }));
    expect(game).toEqual({ kind: "game", gameId: "b2w2", mode: "simple", scores: NO_SCORES, name: "" });
  });

  it("rejects broken, unknown or old links", () => {
    expect(parseShareHash("")).toBeNull();
    expect(parseShareHash("#v=1&k=b&s=hgss9a8a88a")).toBeNull();
    expect(parseShareHash("#v=3&k=b&m=s&s=")).toBeNull();
    expect(parseShareHash("#v=2&k=b&s=")).toBeNull();
    expect(parseShareHash("#v=2&k=b&m=x&s=")).toBeNull();
    expect(parseShareHash("#v=2&k=x&m=s&s=")).toBeNull();
    expect(parseShareHash("#v=2&k=b&m=a&s=hgss554")).toBeNull();
    expect(parseShareHash("#v=2&k=b&m=a&s=missingno5545445")).toBeNull();
    expect(parseShareHash("#v=2&k=b&m=a&s=hgss5545446")).toBeNull();
    expect(parseShareHash("#v=2&k=b&m=s&s=hgss6")).toBeNull();
    expect(parseShareHash("#v=2&k=b&m=s&s=hgss+")).toBeNull();
    expect(parseShareHash("#v=2&k=g&m=s&s=hgss5.bw3")).toBeNull();
  });

  it("caps the name length", () => {
    const parsed = parseShareHash("#v=2&k=b&m=s&s=&n=" + "a".repeat(40));
    expect(parsed?.name).toHaveLength(24);
  });
});

describe("cleanName", () => {
  it("strips leading @ and whitespace", () => {
    expect(cleanName("  @brock ")).toBe("brock");
  });
});
