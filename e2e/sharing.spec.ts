import { readFile } from "node:fs/promises";
import { expect, test, type Download, type Page } from "@playwright/test";
import { HGSS_SCORES, SCORES_KEY, seedScores } from "./fixtures";

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
  await seedScores(page, { hgss: HGSS_SCORES, rb: { pokedex: 6 } });
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
  await expect(viewer.getByText("HeartGold & SoulSilver")).toBeVisible();
  await expect(viewer.locator("main button")).toHaveCount(0);
  expect(await viewer.evaluate((key) => window.localStorage.getItem(key), SCORES_KEY)).toBeNull();
});

test("a shared game link shows that game's scores", async ({ page }) => {
  await page.goto("/share#v=1&k=g&g=hgss&s=hgss9a8a88a&n=Ash");
  await expect(page.getByText("@Ash's rating of HeartGold & SoulSilver")).toBeVisible();
  await expect(page.getByRole("heading", { name: "THEIR SCORES" })).toBeVisible();
});

for (const hash of ["", "#v=1&k=b&s=garbage", "#v=1&k=g&g=nope&s="]) {
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
  expect(calls[0].url).toContain("/share#v=1&k=b&s=");
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
