import { mkdir, writeFile } from "node:fs/promises";

const IGDB_SLUGS = {
  rb: "pokemon-red-version",
  y: "pokemon-yellow-version-special-pikachu-edition",
  gs: "pokemon-gold-version",
  c: "pokemon-crystal-version",
  rs: "pokemon-ruby-version",
  frlg: "pokemon-firered-version",
  e: "pokemon-emerald-version",
  dp: "pokemon-diamond-version",
  pt: "pokemon-platinum-version",
  hgss: "pokemon-heartgold-version",
  bw: "pokemon-black-version",
  b2w2: "pokemon-black-version-2",
  xy: "pokemon-x",
  oras: "pokemon-omega-ruby",
  sm: "pokemon-sun",
  usum: "pokemon-ultra-sun",
  lgpe: "pokemon-lets-go-pikachu",
  swsh: "pokemon-sword",
  bdsp: "pokemon-brilliant-diamond",
  la: "pokemon-legends-arceus",
  sv: "pokemon-scarlet",
  za: "pokemon-legends-z-a",
};

const OUTPUT_DIR = new URL("../public/covers/", import.meta.url);
const IMAGE_SIZE = "t_cover_big_2x";

const { client_id: clientId, client_secret: clientSecret } = process.env;
if (!clientId || !clientSecret) {
  throw new Error("Set client_id and client_secret (Twitch app credentials) in .env");
}

async function fetchAccessToken() {
  const params = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" });
  const response = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: "POST" });
  if (!response.ok) throw new Error(`Twitch auth failed: ${response.status} ${await response.text()}`);
  return (await response.json()).access_token;
}

async function fetchCoverIdsBySlug(accessToken) {
  const slugList = Object.values(IGDB_SLUGS).map((slug) => `"${slug}"`).join(",");
  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: { "Client-ID": clientId, Authorization: `Bearer ${accessToken}` },
    body: `fields slug,cover.image_id; where slug = (${slugList}); limit 500;`,
  });
  if (!response.ok) throw new Error(`IGDB query failed: ${response.status} ${await response.text()}`);
  const games = await response.json();
  return new Map(games.map((game) => [game.slug, game.cover?.image_id]));
}

async function downloadCover(gameId, imageId) {
  const response = await fetch(`https://images.igdb.com/igdb/image/upload/${IMAGE_SIZE}/${imageId}.jpg`);
  if (!response.ok) throw new Error(`Cover download failed for ${gameId}: ${response.status}`);
  await writeFile(new URL(`${gameId}.jpg`, OUTPUT_DIR), Buffer.from(await response.arrayBuffer()));
}

const coverIdsBySlug = await fetchCoverIdsBySlug(await fetchAccessToken());
const missing = Object.entries(IGDB_SLUGS).filter(([, slug]) => !coverIdsBySlug.get(slug));
if (missing.length > 0) {
  throw new Error(`No IGDB cover for: ${missing.map(([gameId, slug]) => `${gameId} (${slug})`).join(", ")}`);
}

await mkdir(OUTPUT_DIR, { recursive: true });
await Promise.all(
  Object.entries(IGDB_SLUGS).map(([gameId, slug]) => downloadCover(gameId, coverIdsBySlug.get(slug))),
);
console.log(`Saved ${Object.keys(IGDB_SLUGS).length} covers to public/covers/`);
