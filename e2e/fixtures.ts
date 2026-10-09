import { expect, type Page } from "@playwright/test";
import type { Scores, ScoringMode } from "@/lib/scores";

export const SCORES_KEY = "pokeranked:scores:v2";
export const MODE_KEY = "pokeranked:mode:v1";

export const HGSS_SCORES = { pokedex: 5, region: 5, story: 4, soundtrack: 5, progression: 4, difficulty: 4, graphics: 5 };

async function seed(page: Page, key: string, value: unknown) {
  await page.addInitScript(
    ([storageKey, stored]) => {
      if (!window.localStorage.getItem(storageKey)) window.localStorage.setItem(storageKey, stored);
    },
    [key, JSON.stringify(value)] as const,
  );
}

export function seedScores(page: Page, scores: Partial<Scores>) {
  return seed(page, SCORES_KEY, scores);
}

export function seedMode(page: Page, mode: ScoringMode) {
  return seed(page, MODE_KEY, mode);
}

export function storedScores(page: Page): Promise<Scores> {
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "{}"), SCORES_KEY);
}

export function gameTile(page: Page, name: string) {
  return page.getByRole("button", { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},`) });
}

export function scoreBox(page: Page, label: string, value: number) {
  return page.getByRole("button", { name: `${label}: ${value} out of 5`, exact: true });
}

export function modeButton(page: Page, mode: "SIMPLE" | "ADVANCED") {
  return page.getByRole("group", { name: "Scoring mode" }).getByRole("button", { name: mode });
}

export async function waitForAnimations(page: Page) {
  await page.waitForFunction(() => {
    const dialog = document.querySelector("dialog[open]");
    return dialog !== null && dialog.getAnimations({ subtree: true }).every((animation) => animation.playState !== "running");
  });
}

export async function closeScoring(page: Page) {
  await page.getByRole("button", { name: "DONE" }).click();
  await expect(page.getByText(/^How good is/)).toBeHidden();
}
