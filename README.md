# PokéRanked

Rank every main-series Pokémon game. Score each game across a few categories, watch it land in a tier (S to D), and share your board as a picture or a link.

It's a fully static Next.js site with no backend. Scores are kept in `localStorage`, share links carry the ranking in the URL hash, and share pictures are rendered in the browser.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # vitest
npm run lint
npm run build   # static export to out/
```

## Cover art

Covers in `public/covers/` come from [IGDB](https://www.igdb.com). To refresh them, put your Twitch/IGDB credentials in `.env`:

```
client_id=...
client_secret=...
```

then run `npm run covers`.

## Deploy

Hosted on S3 + CloudFront, provisioned with Terraform in `infra/` (see `infra/README.md`). With the infra applied and AWS credentials set:

```bash
npm run deploy
```

This builds the site, syncs `out/` to the bucket and invalidates the CloudFront cache.
