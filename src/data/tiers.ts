export const TIER_LETTERS = ["S", "A", "B", "C", "D"] as const;

export type TierLetter = (typeof TIER_LETTERS)[number];

export type Tier = {
  letter: TierLetter;
  color: string;
  minScore: number;
  range: string;
  simpleRange: string;
};

export const TIERS: readonly Tier[] = [
  { letter: "S", color: "#F85848", minScore: 4.5, range: "4.5+", simpleRange: "5" },
  { letter: "A", color: "#F89838", minScore: 4, range: "4+", simpleRange: "4" },
  { letter: "B", color: "#F8D038", minScore: 3, range: "3+", simpleRange: "3" },
  { letter: "C", color: "#78C850", minScore: 2, range: "2+", simpleRange: "2" },
  { letter: "D", color: "#58A8F8", minScore: 0, range: "<2", simpleRange: "1" },
];

export function tierForScore(score: number): Tier {
  return TIERS.find((tier) => score >= tier.minScore) ?? TIERS[TIERS.length - 1];
}
