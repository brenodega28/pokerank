# Tierdex: design analysis and build plan

Design source: [Pokémon Game Rankings canvas](https://claude.ai/artifact/M2rcM4ZgBjMCamMKAL2PGb)

## What the design contains

The "Pokémon Game Rankings" canvas has four artboards:

| Artboard | What it is |
|---|---|
| **Tier board** (main page) | A "Rank by" switch for **Pokédex / Region / Story / Soundtrack**. Each category has its own S–D board. You tap a game, then tap a tier to place it. A sticky bar shows the selected game with S/A/B/C/D, Unrank, Game page and Share game buttons. Below the board is a "Not ranked yet" tray, and a progress bar counts ranked games out of 22. A **Share dialog** offers "Whole board" (pick a category) or "One game" (pick a game), with Download PNG, Copy image and Copy link. |
| **Game page** | A game header (generation, platform, year, region, an "x/4 rated" badge) and one row of S–D buttons per category. These write to the same data as the board ("Picking a tier moves this game on that category's board"). A side panel previews and shares that game's card. |
| **Share board** (1080×1350) | A static picture of one category's tier board, with a footer of `@[USERNAME]` and `[YOURSITE.COM]`. |
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
- The tier placements are demo data. Real users start with every game unranked.

**Gaps the design doesn't cover:**

- **Missing screens:** sign-in, account menu and sign-out, the public page a share link opens, and 404 or error states.
- **Share dialog footer:** the name field we agreed on isn't drawn.
- **Domain:** `[YOURSITE.COM]` needs the real domain.
- **Ordering:** placement only appends to the end of a tier. Reordering within a tier and drag-and-drop aren't designed.

## Decisions so far

- **Data and login:** accounts in Postgres through Drizzle, with Auth.js email magic links.
- **Guests:** they rank in localStorage, and their board is imported into the account when they sign in.
- **Share links:** "Copy link" creates a short server link to a saved snapshot.
- **Images:** share PNGs are made on the server with `next/og`.
- **Share footer:** an optional name field.
- **Hosting:** AWS.

## Architecture

- **Game catalogue:** a static TypeScript module (`src/data/games.ts`), not a database table. It rarely changes, and the server and the image renderer both need it.
- **Tables:**
  - The usual Auth.js tables: `users`, `accounts`, `sessions`, `verification_tokens`.
  - `placements (user_id, category, game_id, tier, position)`, with primary key `(user_id, category, game_id)`.
  - `share_snapshots (slug, user_id?, kind 'board'|'game', category?, game_id?, payload jsonb, display_name?, created_at)`. The payload is frozen so the link keeps showing what was shared, even after later edits.
- **Board logic:** one pure reducer for select, place, unrank and switch category. Both the board and the game page use it. A storage adapter saves to **localStorage** for guests and to **server actions** for signed-in users, with optimistic updates.
- **Image routes:** `/s/[slug]/image.png` built with `next/og` (bundled TTF fonts, background tile in `public/`). The same image is the page's link preview. Download and Copy image both fetch this URL.
- **Routes:** `/` (board), `/games/[id]`, `/s/[slug]` (read-only shared view), `/signin`, plus image routes.
- **Email:** Amazon SES for the magic links.

## Phases

1. **Foundations.** Add the design colours and fonts to the Tailwind theme, load the fonts with `next/font`, and put the background tile in `public/`. Build the shared pieces: Panel, PixelButton, TierButton, GameTile, ProgressBar. Add the game, category and tier data.
2. **Tier board for guests.** Write the reducer with unit tests. Build the category tabs, select-and-place flow, sticky bar, unranked tray and progress bar, and save to localStorage. Check that it works at phone width.
3. **Game page.** Build `/games/[id]` with per-category tier rows on the same state, and the header from the catalogue data.
4. **Share cards.** Rebuild both cards in markup `next/og` can render (flexbox only) and match them against the 1080px artboards.
5. **Database and sign-in.** Set up Docker Postgres locally, the Drizzle schema and migrations, and Auth.js with the Drizzle adapter and email sign-in. Then add the sign-in page and account menu, server actions for placements, and the guest-board import on first sign-in.
6. **Sharing.** Build the share dialog with the name field. Creating a snapshot returns a slug, then Download, Copy image (via the clipboard API) and Copy link are wired up. Add the `/s/[slug]` page with link-preview tags, and rate-limit anonymous snapshot creation.
7. **AWS deployment.** Set up RDS Postgres, verify the domain in SES, manage secrets, and run migrations in CI. The hosting service is still open: Amplify Hosting is simplest if it supports Next.js 16 at that point. Otherwise a standalone container on ECS Fargate is the dependable option.
8. **QA.** Add Playwright tests for rank → sign in → share, compare the running app against the canvas, and check accessibility (contrast, keyboard use, `aria-pressed`).

## Still open

1. **Missing screens:** add the sign-in page, account menu and shared-link page to the canvas first, or build them in the same style straight away?
2. **Domain:** what is the site's domain, for the card footer and SES?
3. **Reordering:** should players be able to reorder games inside a tier, or is placement order enough for now?
4. **AWS hosting:** pick one service now, or decide in phase 7?
