export const TIER_LETTERS = ["S", "A", "B", "C", "D"] as const;

export type TierLetter = (typeof TIER_LETTERS)[number];

export type Tier = {
  letter: TierLetter;
  color: string;
  minScore: number;
  range: string;
};

export const TIERS: readonly Tier[] = [
  { letter: "S", color: "#F85848", minScore: 9, range: "9+" },
  { letter: "A", color: "#F89838", minScore: 8, range: "8+" },
  { letter: "B", color: "#F8D038", minScore: 7, range: "7+" },
  { letter: "C", color: "#78C850", minScore: 5, range: "5+" },
  { letter: "D", color: "#58A8F8", minScore: 0, range: "<5" },
];

export function tierForScore(score: number): Tier {
  return TIERS.find((tier) => score >= tier.minScore) ?? TIERS[TIERS.length - 1];
}
