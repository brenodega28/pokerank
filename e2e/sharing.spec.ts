import { readFile } from "node:fs/promises";
import { expect, test, type Download, type Page } from "@playwright/test";
import { HGSS_SCORES, SCORES_KEY, modeButton, seedScores } from "./fixtures";

async function pngSize(download: Download) {
  const bytes = await readFile(await download.path());
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function openShareDialog(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "SHARE BOARD" }).click();
  return page.getByRole("dialog", { name: "SHARE A PICTURE" });
}

test.beforeEach(async ({ page }) => {
  await seedScores(page, { simple: { hgss: 5, rb: 3 }, advanced: { hgss: HGSS_SCORES, rb: { pokedex: 3 } } });
});

test("download saves the board and game pictures at full size", async ({ page }) => {
  const dialog = await openShareDialog(page);

  const [board] = await Promise.all([page.waitForEvent("download"), dialog.getByRole("button", { name: "DOWNLOAD PNG" }).click()]);
  expect(board.suggestedFilename()).toBe("pokeranked-overall.png");
  expect(await pngSize(board)).toEqual({ width: 1080, height: 1350 });

  await dialog.getByRole("button", { name: "ONE GAME" }).click();
  await dialog.getByRole("button", { name: "HeartGold & SoulSilver", exact: true }).click();
  const [game] = await Promise.all([page.waitForEvent("download"), dialog.getByRole("button", { name: "DOWNLOAD PNG" }).click()]);
  expect(game.suggestedFilename()).toBe("pokeranked-hgss.png");
  expect(await pngSize(game)).toEqual({ width: 1080, height: 1080 });
});

test("a copied link opens a read-only copy of the board", async ({ page, context, browser }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const dialog = await openShareDialog(page);
  await dialog.getByLabel("YOUR NAME (OPTIONAL)").fill("Ash");
  await dialog.getByRole("button", { name: "COPY LINK" }).click();
  await expect(dialog.getByText("Link copied!")).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());

  const viewer = await (await browser.newContext()).newPage();
  await viewer.goto(link);
  await expect(viewer.getByRole("heading", { level: 1 })).toHaveText("@ASH'S RANKING");
  await expect(viewer.getByText("One score from 1 to 5 per game.")).toBeVisible();
  await expect(viewer.getByText(", scored 5, S tier")).toBeAttached();
  await expect(viewer.locator("main button")).toHaveCount(0);
  expect(await viewer.evaluate((key) => window.localStorage.getItem(key), SCORES_KEY)).toBeNull();
});

test("a copied advanced link keeps the advanced scores", async ({ page, context, browser }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await modeButton(page, "ADVANCED").click();
  await page.getByRole("button", { name: "SHARE BOARD" }).click();
  const dialog = page.getByRole("dialog", { name: "SHARE A PICTURE" });
  await dialog.getByRole("button", { name: "COPY LINK" }).click();
  await expect(dialog.getByText("Link copied!")).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain("m=a");

  const viewer = await (await browser.newContext()).newPage();
  await viewer.goto(link);
  await expect(viewer.getByText("Scored on")).toBeVisible();
  await expect(viewer.getByText(", scored 4.6, S tier")).toBeAttached();
  await expect(viewer.getByText(", scored 3.0, B tier")).toBeAttached();
});

test("a shared advanced game link shows every category", async ({ page }) => {
  await page.goto("/share#v=2&k=g&m=a&s=hgss5545445&n=Ash");
  await expect(page.getByText("@Ash's rating of HeartGold & SoulSilver")).toBeVisible();
  await expect(page.getByRole("heading", { name: "THEIR SCORES" })).toBeVisible();
  await expect(page.getByText("7/7 SCORED")).toBeVisible();
  await expect(page.getByText("4.6/5")).toBeVisible();
});

test("a shared simple game link shows the one score", async ({ page }) => {
  await page.goto("/share#v=2&k=g&m=s&s=hgss4");
  await expect(page.getByRole("heading", { name: "THEIR SCORE" })).toBeVisible();
  await expect(page.getByText("4/5").first()).toBeVisible();
  await expect(page.getByText("Pokédex")).toHaveCount(0);
});

for (const hash of ["", "#v=2&k=b&m=s&s=garbage", "#v=2&k=g&m=s&s=nope3", "#v=1&k=b&s=hgss9a8a88a"]) {
  test(`a broken share link (${hash || "no hash"}) explains itself`, async ({ page }) => {
    await page.goto(`/share${hash}`);
    await expect(page.getByRole("heading", { name: "THIS LINK DOESN'T WORK" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "MAKE YOUR OWN" })).toHaveAttribute("href", "/");
  });
}

test("the native share button sends the picture and the link", async ({ page }) => {
  await page.addInitScript(() => {
    const calls: unknown[] = [];
    Object.assign(window, { shareCalls: calls });
    navigator.canShare = (data) => Boolean(data?.files);
    navigator.share = async (data) => {
      calls.push({ url: data?.url, files: data?.files?.map((file) => [file.name, file.type]) });
    };
  });
  const dialog = await openShareDialog(page);
  await dialog.getByRole("button", { name: "SHARE", exact: true }).click();
  await expect(dialog.getByText("Shared!")).toBeVisible();

  const calls = await page.evaluate(() => (window as unknown as { shareCalls: { url: string; files: string[][] }[] }).shareCalls);
  expect(calls).toHaveLength(1);
  expect(calls[0].url).toContain("/share#v=2&k=b&m=s&s=rb3.hgss5");
  expect(calls[0].files).toEqual([["pokeranked-overall.png", "image/png"]]);
});

test("without native sharing, download is the main action", async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(Navigator.prototype, "share");
    Reflect.deleteProperty(Navigator.prototype, "canShare");
  });
  const dialog = await openShareDialog(page);
  await expect(dialog.getByRole("button", { name: "SHARE", exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "DOWNLOAD PNG" })).toBeVisible();
});
