import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { HGSS_SCORES, gameTile, seedScores } from "./fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.beforeEach(async ({ page }) => {
  await seedScores(page, { hgss: HGSS_SCORES });
});

for (const path of ["/", "/games/hgss", "/share#v=1&k=b&s=hgss9a8a88a"]) {
  test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("the open scoring panel and share dialog have no WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");
  await gameTile(page, "HeartGold & SoulSilver").click();
  expect((await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()).violations).toEqual([]);

  await page.getByRole("button", { name: "SHARE GAME" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const results = await new AxeBuilder({ page }).include("dialog").withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
});

test("toggle buttons report their pressed state", async ({ page }) => {
  await page.goto("/");
  const tile = gameTile(page, "HeartGold & SoulSilver");
  await expect(tile).toHaveAttribute("aria-pressed", "false");
  await tile.click();
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Pokédex: 9 out of 10" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Pokédex: 8 out of 10" })).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("button", { name: "SHARE GAME" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "ONE GAME" })).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.getByRole("button", { name: "WHOLE BOARD" })).toHaveAttribute("aria-pressed", "false");
  await expect(dialog.getByRole("button", { name: "HeartGold & SoulSilver", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("the board works from the keyboard", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard flow is desktop only");
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "PokéRanked" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "SHARE BOARD" })).toBeFocused();

  await gameTile(page, "Yellow").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("How good is Yellow?")).toBeVisible();
  await page.getByRole("button", { name: "Region: 8 out of 10" }).focus();
  await page.keyboard.press("Space");
  await expect(gameTile(page, "Yellow")).toHaveAccessibleName("Yellow, scored 8.0, A tier");

  const shareBoard = page.getByRole("button", { name: "SHARE BOARD" });
  await shareBoard.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(shareBoard).toBeFocused();
});
