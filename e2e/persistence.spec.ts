import { expect, test } from "@playwright/test";
import { MODE_KEY, SCORES_KEY, closeScoring, gameTile, modeButton, scoreBox, storedScores } from "./fixtures";

test("scores and the mode survive a reload", async ({ page }) => {
  await page.goto("/");
  await gameTile(page, "Emerald").click();
  await scoreBox(page, "Score", 4).click();
  await closeScoring(page);
  await modeButton(page, "ADVANCED").click();
  await gameTile(page, "Emerald").click();
  await scoreBox(page, "Pokédex", 3).click();
  await expect.poll(() => storedScores(page)).toEqual({ simple: { e: 4 }, advanced: { e: { pokedex: 3 } } });

  await page.reload();
  await expect(modeButton(page, "ADVANCED")).toHaveAttribute("aria-pressed", "true");
  await expect(gameTile(page, "Emerald")).toHaveAccessibleName("Emerald, scored 3.0, B tier");
  await modeButton(page, "SIMPLE").click();
  await expect(gameTile(page, "Emerald")).toHaveAccessibleName("Emerald, scored 4, A tier");
});

test("another open tab picks up new scores", async ({ page, context }) => {
  await page.goto("/");
  const otherTab = await context.newPage();
  await otherTab.goto("/");
  await expect(gameTile(otherTab, "Platinum")).toHaveAccessibleName("Platinum, not rated");

  await gameTile(page, "Platinum").click();
  await scoreBox(page, "Score", 5).click();

  await expect(gameTile(otherTab, "Platinum")).toHaveAccessibleName("Platinum, scored 5, S tier");
});

for (const [label, key, value] of [
  ["text that isn't JSON", SCORES_KEY, "not json"],
  [
    "out-of-range and unknown entries",
    SCORES_KEY,
    JSON.stringify({ simple: { rb: 9, nope: 3 }, advanced: { rb: { pokedex: 99, story: "x" }, nope: { pokedex: 5 } } }),
  ],
  ["an array", SCORES_KEY, "[1,2]"],
  ["scores from the old 1–10 version", "tierdex:scores:v1", JSON.stringify({ rb: { pokedex: 9 } })],
]) {
  test(`stored ${label} falls back to an empty board`, async ({ page }) => {
    await page.addInitScript(([storageKey, stored]) => window.localStorage.setItem(storageKey, stored), [key, value] as const);
    await page.goto("/");
    await expect(page.getByText("0/22")).toBeVisible();
    await expect(gameTile(page, "Red & Blue")).toHaveAccessibleName("Red & Blue, not rated");
  });
}

test("an unknown stored mode falls back to simple", async ({ page }) => {
  await page.addInitScript((key) => window.localStorage.setItem(key, JSON.stringify("expert")), MODE_KEY);
  await page.goto("/");
  await expect(modeButton(page, "SIMPLE")).toHaveAttribute("aria-pressed", "true");
});
