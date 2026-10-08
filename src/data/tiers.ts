export const TIER_LETTERS = ["S", "A", "B", "C", "D"] as const;

export type TierLetter = (typeof TIER_LETTERS)[number];

export type Tier = {
  letter: TierLetter;
  color: string;
};

export const TIERS: readonly Tier[] = [
  { letter: "S", color: "#F85848" },
  { letter: "A", color: "#F89838" },
  { letter: "B", color: "#F8D038" },
  { letter: "C", color: "#78C850" },
  { letter: "D", color: "#58A8F8" },
];

export function tierColor(letter: TierLetter): string {
  return TIERS.find((tier) => tier.letter === letter)!.color;
}
