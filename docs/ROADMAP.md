# PokéRanked: design analysis and build plan

Design source: [Pokémon Game Rankings canvas](https://claude.ai/artifact/M2rcM4ZgBjMCamMKAL2PGb)

## What the design contains

The "Pokémon Game Rankings" canvas has four artboards:

| Artboard | What it is |
|---|---|
| **Tier board** (main page) | One **overall ranking**, scored on **Pokédex / Region / Story / Soundtrack**. You tap a game and give it a 1–10 score per category in a sticky scoring panel (with its overall tier, Game page, Done and Clear scores). The game's tier comes from its average: S 9+, A 8+, B 7+, C 5+, D <5, and games sort by average inside each tier with their score on the tile. Below the board is a "Not rated yet" tray, and a progress bar counts rated games out of 22. A **Share dialog** offers "Whole board" or "One game" (pick a game), with Download PNG, Copy image and Copy link. |
| **Game page** | A game header (generation, platform, year, region, the overall tier and average, an "x/4 scored" badge) and a 1–10 score bar per category. These write to the same scores as the board. A side panel previews and shares that game's card. |
| **Share board** (1080×1350) | A static picture of the overall tier board with each game's average, with a footer of `@[USERNAME]` and `[YOURSITE.COM]`. |
| **Share game** (1080×1080) | A static picture of one game's tier in all four categories. |

**Look:** a Game Boy–era pixel style.

- **Fonts:** Press Start 2P for headings and labels, Pixelify Sans for body text.
- **Panels:** cream `#F8F8F0`, with a 4px `#202030` border, a double inset `#8890C0` frame and a hard drop shadow.
- **Buttons:** beveled.
- **Tier colours:** S `#F85848`, A `#F89838`, B `#F8D038`, C `#78C850`, D `#58A8F8`.
- **Accent:** `#C03030`.
- **Background:** a tiled 1536px pixel-art grass map, rendered pixelated.

There are no game images. Each game is drawn as a cartridge tile with two colour stripes, a short code (`HGSS`) and the full name.

**Data in the design:**

- 22 games from Red & Blue to Legends: Z-A, each with code, name, generation, year, region, platform and two colours.
- 4 categories and 5 tiers.
- The scores are demo data. Real users start with every game unrated.

**Gaps the design doesn't cover:**

- **Missing screens:** the read-only page a share link opens, and 404 or error states.
- **Share dialog footer:** the name field we agreed on isn't drawn.
- **Domain:** `[YOURSITE.COM]` needs the real domain.

## Decisions so far

- **No accounts, databases or servers.** PokéRanked is a static site, and everything runs in the browser.
- **Saving:** scores live in the browser's localStorage, so they stay on that device and browser.
- **Share links:** "Copy link" encodes the scores in the URL itself. Opening the link shows a read-only copy of that board or game.
- **Images:** share PNGs are made in the browser by rendering the 1080px card off-screen and capturing it.
- **Share footer:** an optional name field.
- **Hosting:** static files on AWS S3 behind CloudFront.

## Architecture

- **Game catalogue:** a static TypeScript module (`src/data/games.ts`).
- **Score logic:** pure functions in `src/lib/scores.ts` for setting, clearing and averaging scores and grouping games into tiers. Both the board and the game page use them.
- **Storage:** `src/lib/score-store.ts` keeps scores in localStorage and syncs open tabs.
- **Static export:** Next.js builds plain HTML and assets with `output: "export"`. This needs `cacheComponents` and `partialPrefetching` removed from `next.config.ts`, because export mode can't run partial prerendering. A test build confirmed it produces `index.html`, one page per game and a `404.html`.
- **Share links:** the board or game scores are compacted to one character per score in catalogue order (`1`–`9`, `a` for 10, `0` for no score) and put in the URL hash of `/share`, e.g. `/share#b=…` or `/share#g=hgss.9a8a`. The hash never reaches the host, and the page decodes it in the browser.
- **Share images:** the 1080×1350 board card and 1080×1080 game card are React components rendered off-screen, then captured to PNG with a small library such as `html-to-image`. Download PNG saves that file, and Copy image puts it on the clipboard.
- **Link previews:** with no server, a shared link can't carry a preview image of that person's scores. It gets the site's generic preview image instead.
- **Routes:** `/` (board), `/games/[id]`, `/share` (read-only shared view).

## Phases

1. **Foundations.** Done: theme colours and fonts, background tile, shared panels, buttons, cartridges and progress bar, and the game, category and tier data.
2. **Tier board.** Done: score logic with unit tests, scoring panel, tier rows, unrated tray and progress bar, saved to localStorage.
3. **Game page.** Done: `/games/[id]` with per-category score bars on the same scores, and the header from the catalogue data.
4. **Share cards.** Build both 1080px cards as components and match them against the artboards.
5. **Sharing.** Build the share dialog with the name field. Add PNG capture for Download PNG and Copy image, the URL encoding for Copy link, and the read-only `/share` page.
6. **Static export and AWS deployment.** Switch to `output: "export"` (removing `cacheComponents` and `partialPrefetching`), then publish the `out/` folder to an S3 bucket behind CloudFront. Configure CloudFront to serve `404.html` for missing pages and to map clean URLs like `/games/hgss` to their `.html` files.
7. **QA.** Add Playwright tests for scoring, persistence and sharing, compare the running app against the canvas, and check accessibility (contrast, keyboard use, `aria-pressed`).

## Still open

1. **Missing screens:** add the shared-link page and 404 page to the canvas first, or build them in the same style straight away?
2. **Domain:** what is the site's domain, for the card footer and CloudFront?
