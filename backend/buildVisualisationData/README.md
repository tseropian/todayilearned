# Visualisation data (build + serve)

Two Lambdas — a scheduled **build** that rebuilds the Wikipedia visualisation
data and publishes it to S3, and an HTTP **serve** endpoint the website reads
from. Both are defined in the unified `../serverless.yml` (`til-api`); the
handlers just live in this folder. Deploy from `backend/` — see `../README.md`.

## build (scheduled)

Runs the same three-stage pipeline as the manual scripts in `tools/`, as a single
invocation with no intermediate files:

1. **Scan** `til-links-live` and count Wikipedia URLs (`lib/exportLinks.js`),
   and publish the raw `wikipedia-links.csv` to S3 — its `LastModified` is the
   data's `createdAt`.
2. **Normalise + enrich** via the Wikipedia API, caching categories in
   `til-wikipedia-metadata` (`lib/normalise.js`, `lib/enrich.js`).
3. **Aggregate** into `wikipedia-topics.json`, `wikipedia-top-pages.json` and
   `wikipedia-network.json` (`lib/buildViz.js`) and upload them to
   `s3://todayilearned-prod/data/`.

Daily at 03:00 UTC — `cron(0 3 * * ? *)` in `serverless.yml`.

## serve (HTTP GET `/visualisation-data`)

Reads the published files back from S3 and returns them as one CORS-enabled
payload (`serve.js`):

```json
{ "createdAt": "2026-08-26T03:00:00.000Z", "topics": [ ... ], "topPages": [ ... ], "network": { "nodes": [ ... ], "edges": [ ... ] } }
```

`createdAt` is the `LastModified` of the source CSV. The website
(`website/pages/visualisations.vue`) fetches this endpoint client-side via
`TIL_DATA_API`, so new data — and its date — appears without a rebuild.

## Deploy

Part of the unified service — deploy everything from `backend/`:

```sh
cd backend && pnpm install && npx serverless deploy
```

## Configuration (env vars, defaults in `serverless.yml`)

| Var | Default | Purpose |
| --- | --- | --- |
| `LINKS_TABLE` | `til-links-live` | Source links table to scan |
| `METADATA_TABLE` | `til-wikipedia-metadata` | Wikipedia category cache |
| `DATA_BUCKET` | `todayilearned-prod` | Bucket to publish JSON to |
| `DATA_PREFIX` | `data` | Key prefix for the published JSON |

The bucket needs the CORS rule defined in `infrastructure/s3.tf` for the browser
to read the published files cross-origin.
