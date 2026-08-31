# Today I Learned — backend (`til-api`)

Every Lambda lives in **one** Serverless service (`serverless.yml`), so all HTTP
routes share a **single API Gateway** instead of one gateway per service. The
handlers stay in their original folders and are referenced in place.

## Routes & functions

| Function | Handler | Trigger |
| --- | --- | --- |
| `addLink` | `addLink/src/addLink.addLink` | `POST /links` |
| `getLinks` | `getLinksByDate/handler.getLinks` | `GET /links/{date}` |
| `serve` | `buildVisualisationData/serve.serve` | `GET /visualisation-data` |
| `build` | `buildVisualisationData/handler.build` | daily `cron(0 3 * * ? *)` |

All three HTTP routes resolve to the same invoke URL:
`https://{apiId}.execute-api.eu-west-1.amazonaws.com/{stage}/…`.

## Deploy

```sh
cd backend
pnpm install
npx serverless login   # first time only - opens the Dashboard to authenticate
npx serverless deploy
```

Serverless Framework v4 requires authentication for every command, including
locally (it's free for individuals/orgs under $2M revenue - see
https://www.serverless.com/pricing). `serverless login` handles this on a
dev machine; CI (`.github/workflows/backend-deploy.yml`) instead reads a
Dashboard-generated Access Key from the `SERVERLESS_ACCESS_KEY` secret.

## Migrating from the old per-service gateways

Previously each function was its own service/stack with its own API Gateway
(`til-addlink`, `til-get-links-by-date`, `til-build-visualisation-data`). To cut
over:

1. `npx serverless deploy` here to create the unified `til-api` gateway.
2. Point the website at it: set the `TIL_API_HOST` env (Vercel) to the new
   gateway's base URL, with a trailing slash. `TIL_DATA_API` derives from it
   automatically (see `website/nuxt.config.ts`).
3. Remove the now-duplicated old stacks so nothing double-serves:
   `serverless remove` against each old service, or delete the
   `til-addlink` / `til-get-links-by-date` / `til-build-visualisation-data`
   CloudFormation stacks.

## Removed

- `deployWebsite` (hourly Vercel redeploy trigger) — obsolete now that the site
  fetches links and visualisation data client-side at runtime.
