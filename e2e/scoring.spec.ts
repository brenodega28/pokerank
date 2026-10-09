import { expect, test } from "@playwright/test";
import { closeScoring, gameTile, modeButton, scoreBox, seedMode } from "./fixtures";

test.describe("simple mode", () => {
  test("is the default and puts a game straight into the tier for its score", async ({ page }) => {
    await page.goto("/");
    await expect(modeButton(page, "SIMPLE")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("One score from 1 to 5 per game.")).toBeVisible();
    await expect(page.getByText("0/22")).toBeVisible();

    await gameTile(page, "Red & Blue").click();
    await expect(page.getByText("How good is Red & Blue?")).toBeVisible();
    await expect(scoreBox(page, "Score", 4)).toHaveText("4");
    await scoreBox(page, "Score", 4).click();

    await expect(gameTile(page, "Red & Blue")).toHaveAccessibleName("Red & Blue, scored 4, A tier");
    await expect(page.getByText("1/22")).toBeVisible();
  });

  test("picking the current score again clears it", async ({ page }) => {
    await page.goto("/");
    await gameTile(page, "Yellow").click();

    const three = scoreBox(page, "Score", 3);
    await three.click();
    await expect(three).toHaveAttribute("aria-pressed", "true");
    await expect(gameTile(page, "Yellow")).toHaveAccessibleName("Yellow, scored 3, B tier");

    await three.click();
    await expect(three).toHaveAttribute("aria-pressed", "false");
    await expect(gameTile(page, "Yellow")).toHaveAccessibleName("Yellow, not rated");
  });

  test("the game page scores the same single score", async ({ page }) => {
    await page.goto("/games/rb");
    await expect(page.getByText("NOT SCORED")).toBeVisible();
    await scoreBox(page, "Score", 2).click();
    await expect(page.getByText("SCORED", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "MY TIER BOARD" }).click();
    await expect(gameTile(page, "Red & Blue")).toHaveAccessibleName("Red & Blue, scored 2, C tier");
  });
});

test.describe("advanced mode", () => {
  test.beforeEach(async ({ page }) => {
    await seedMode(page, "advanced");
  });

  test("scoring categories moves a game into the tier for its average", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Scored on")).toBeVisible();
    await gameTile(page, "Red & Blue").click();
    await scoreBox(page, "Pokédex", 5).click();
    await scoreBox(page, "Region", 4).click();

    await expect(gameTile(page, "Red & Blue")).toHaveAccessibleName("Red & Blue, scored 4.5, S tier");
    await expect(page.getByText("1/22")).toBeVisible();
  });

  test("clear score resets the game and closes the pop-up", async ({ page }) => {
    await page.goto("/");
    await gameTile(page, "Crystal").click();
    await scoreBox(page, "Soundtrack", 3).click();
    await scoreBox(page, "Graphics", 2).click();
    await expect(gameTile(page, "Crystal")).toHaveAccessibleName("Crystal, scored 2.5, C tier");

    await page.getByRole("button", { name: "CLEAR SCORE" }).click();
    await expect(gameTile(page, "Crystal")).toHaveAccessibleName("Crystal, not rated");
    await expect(page.getByText("How good is Crystal?")).toBeHidden();
    await expect(page.getByText("Tap a game to score it.")).toBeVisible();
  });

  test("the game page and the board share the same scores", async ({ page }) => {
    await page.goto("/games/rb");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Red & Blue");
    await scoreBox(page, "Region", 2).click();
    await expect(page.getByText("1/7 SCORED")).toBeVisible();

    await page.getByRole("link", { name: "MY TIER BOARD" }).click();
    await expect(gameTile(page, "Red & Blue")).toHaveAccessibleName("Red & Blue, scored 2.0, C tier");
  });
});

test("each mode keeps its own scores", async ({ page }) => {
  await page.goto("/");
  await gameTile(page, "Emerald").click();
  await scoreBox(page, "Score", 5).click();
  await expect(gameTile(page, "Emerald")).toHaveAccessibleName("Emerald, scored 5, S tier");
  await closeScoring(page);

  await modeButton(page, "ADVANCED").click();
  await expect(modeButton(page, "ADVANCED")).toHaveAttribute("aria-pressed", "true");
  await expect(gameTile(page, "Emerald")).toHaveAccessibleName("Emerald, not rated");
  await gameTile(page, "Emerald").click();
  await scoreBox(page, "Story", 1).click();
  await expect(gameTile(page, "Emerald")).toHaveAccessibleName("Emerald, scored 1.0, D tier");
  await closeScoring(page);

  await modeButton(page, "SIMPLE").click();
  await expect(gameTile(page, "Emerald")).toHaveAccessibleName("Emerald, scored 5, S tier");
});

test("the mode chosen on the game page carries over to the board", async ({ page }) => {
  await page.goto("/games/e");
  await modeButton(page, "ADVANCED").click();
  await expect(page.getByText("0/7 SCORED")).toBeVisible();

  await page.getByRole("link", { name: "MY TIER BOARD" }).click();
  await expect(modeButton(page, "ADVANCED")).toHaveAttribute("aria-pressed", "true");
});

test("share game and clear score only appear once the game has a score", async ({ page }) => {
  await page.goto("/");
  await gameTile(page, "Gold & Silver").click();
  await expect(page.getByRole("button", { name: "DONE" })).toBeVisible();
  await expect(page.getByRole("button", { name: "SHARE GAME" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "CLEAR SCORE" })).toHaveCount(0);

  await scoreBox(page, "Score", 3).click();
  await expect(page.getByRole("button", { name: "SHARE GAME" })).toBeVisible();
  await expect(page.getByRole("button", { name: "CLEAR SCORE" })).toBeVisible();

  await page.getByRole("button", { name: "CLEAR SCORE" }).click();
  await expect(page.getByRole("button", { name: "SHARE GAME" })).toHaveCount(0);
});

test("the scoring pop-up closes from X, Escape, the backdrop and clear score", async ({ page }) => {
  await page.goto("/");
  const title = page.getByText("How good is Crystal?");

  await gameTile(page, "Crystal").click();
  await expect(title).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(title).toBeHidden();
  await expect(gameTile(page, "Crystal")).toBeFocused();

  await gameTile(page, "Crystal").click();
  await expect(title).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(title).toBeHidden();

  await gameTile(page, "Crystal").click();
  await expect(title).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(title).toBeHidden();

  await gameTile(page, "Crystal").click();
  await scoreBox(page, "Score", 2).click();
  await expect(gameTile(page, "Crystal")).toHaveAccessibleName("Crystal, scored 2, C tier");
  await page.getByRole("button", { name: "CLEAR SCORE" }).click();
  await expect(title).toBeHidden();
  await expect(gameTile(page, "Crystal")).toHaveAccessibleName("Crystal, not rated");
});
