import type { Page } from "@playwright/test";
import type { Scores } from "@/lib/scores";

export const SCORES_KEY = "tierdex:scores:v1";

export const HGSS_SCORES = { pokedex: 9, region: 10, story: 8, soundtrack: 10, progression: 8, difficulty: 8, graphics: 10 };

export async function seedScores(page: Page, scores: Scores) {
  await page.addInitScript(
    ([key, value]) => {
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
    },
    [SCORES_KEY, JSON.stringify(scores)] as const,
  );
}

export function storedScores(page: Page): Promise<Scores> {
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), SCORES_KEY);
}

export function gameTile(page: Page, name: string) {
  return page.getByRole("button", { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},`) });
}

export function scoreBox(page: Page, category: string, value: number) {
  return page.getByRole("button", { name: `${category}: ${value} out of 10`, exact: true });
}
