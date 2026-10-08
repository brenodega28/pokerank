import { expect, test } from "@playwright/test";
import { SCORES_KEY, gameTile, scoreBox, storedScores } from "./fixtures";

test("scores survive a reload", async ({ page }) => {
  await page.goto("/");
  await gameTile(page, "Emerald").click();
  await scoreBox(page, "Pokédex", 8).click();
  await expect.poll(() => storedScores(page)).toEqual({ e: { pokedex: 8 } });

  await page.reload();
  await expect(gameTile(page, "Emerald")).toHaveAccessibleName("Emerald, scored 8.0, A tier");
});

test("another open tab picks up new scores", async ({ page, context }) => {
  await page.goto("/");
  const otherTab = await context.newPage();
  await otherTab.goto("/");
  await expect(gameTile(otherTab, "Platinum")).toHaveAccessibleName("Platinum, not rated");

  await gameTile(page, "Platinum").click();
  await scoreBox(page, "Story", 10).click();

  await expect(gameTile(otherTab, "Platinum")).toHaveAccessibleName("Platinum, scored 10.0, S tier");
});

for (const [label, value] of [
  ["text that isn't JSON", "not json"],
  ["out-of-range and unknown entries", JSON.stringify({ rb: { pokedex: 99, story: "x" }, nope: { pokedex: 5 } })],
  ["an array", "[1,2]"],
]) {
  test(`stored ${label} falls back to an empty board`, async ({ page }) => {
    await page.addInitScript(([key, stored]) => window.localStorage.setItem(key, stored), [SCORES_KEY, value] as const);
    await page.goto("/");
    await expect(page.getByText("0/22")).toBeVisible();
    await expect(gameTile(page, "Red & Blue")).toHaveAccessibleName("Red & Blue, not rated");
  });
}
