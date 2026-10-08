import { expect, test } from "@playwright/test";
import { gameTile, scoreBox } from "./fixtures";

test("scoring a game moves it into the tier for its average", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("0/22")).toBeVisible();

  await gameTile(page, "Red & Blue").click();
  await expect(page.getByText("How good is Red & Blue?")).toBeVisible();
  await scoreBox(page, "Pokédex", 9).click();
  await scoreBox(page, "Region", 10).click();

  await expect(gameTile(page, "Red & Blue")).toHaveAccessibleName("Red & Blue, scored 9.5, S tier");
  await expect(page.getByText("1/22")).toBeVisible();
});

test("picking the current score again clears it", async ({ page }) => {
  await page.goto("/");
  await gameTile(page, "Yellow").click();

  const seven = scoreBox(page, "Story", 7);
  await seven.click();
  await expect(seven).toHaveAttribute("aria-pressed", "true");
  await expect(gameTile(page, "Yellow")).toHaveAccessibleName("Yellow, scored 7.0, B tier");

  await seven.click();
  await expect(seven).toHaveAttribute("aria-pressed", "false");
  await expect(gameTile(page, "Yellow")).toHaveAccessibleName("Yellow, not rated");
});

test("clear scores resets the game and done closes the panel", async ({ page }) => {
  await page.goto("/");
  await gameTile(page, "Crystal").click();
  await scoreBox(page, "Soundtrack", 6).click();
  await scoreBox(page, "Graphics", 4).click();
  await expect(gameTile(page, "Crystal")).toHaveAccessibleName("Crystal, scored 5.0, C tier");

  await page.getByRole("button", { name: "CLEAR SCORES" }).click();
  await expect(gameTile(page, "Crystal")).toHaveAccessibleName("Crystal, not rated");

  await page.getByRole("button", { name: "DONE" }).click();
  await expect(page.getByText("How good is Crystal?")).toBeHidden();
  await expect(page.getByText("Tap a game to score it.")).toBeVisible();
});

test("the game page and the board share the same scores", async ({ page }) => {
  await page.goto("/games/rb");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Red & Blue");
  await scoreBox(page, "Region", 4).click();
  await expect(page.getByText("1/7 SCORED")).toBeVisible();

  await page.getByRole("link", { name: "MY TIER BOARD" }).click();
  await expect(gameTile(page, "Red & Blue")).toHaveAccessibleName("Red & Blue, scored 4.0, D tier");
});
