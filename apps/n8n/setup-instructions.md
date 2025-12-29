# n8n Setup Instructions for ai-tools-platform

These instructions complete the n8n integration so webhooks and MongoDB updates work reliably in local development.

## 1) Environment variables

Update the following files with correct URLs, ports, and secrets.

- `.env.local` (project root)
  - `NEXT_PUBLIC_WEBHOOK_URL=http://localhost:3000`
  - `N8N_WEBHOOK_URL=http://localhost:5678/webhook`
  - `N8N_API_KEY=<your-n8n-api-key>`
  - `N8N_WEBHOOK_SECRET=<your-n8n-webhook-secret>`

- `apps/n8n/docker-compose.override.yml`
  - Ensure the service `seo-n8n` has these env vars:
    - `NEXTJS_WEBHOOK_URL=http://host.docker.internal:3000`
    - `N8N_API_KEY=<your-n8n-api-key>`
    - `N8N_WEBHOOK_SECRET=<your-n8n-webhook-secret>`
    - `N8N_EDITOR_BASE_URL=http://localhost:5678`
    - `WEBHOOK_URL=http://localhost:5678`
  - Publish port `5678:5678` for the editor/webhook

## 2) MongoDB credentials in n8n

Import or create the credential using the JSON file:

- Path: `apps/n8n/credentials/mongodb-credentials.json`
- Values:
  - `server`: `mongodb://host.docker.internal:27017`
  - `database`: `seo-tools-dev`
  - `user`/`password`: leave empty for local dev, or set as needed
  - `options`: `{ ssl: false, authSource: "admin" }`

In the n8n UI:
- Go to Credentials → Create → MongoDB
- Fill the same values or import the JSON
- Name it "MongoDB Credentials"

## 3) Fix flows

- `apps/n8n/flows/competitor-analysis-workflow.json`
  - In the HTTP Request node "Notify Completion", ensure body JSON includes:
    - `type: "competitor"`
    - `analysisId` and `status` fields matching the webhook handler requirements
  - This aligns with Next.js route: `apps/web/app/api/competitor-analysis/webhook/route.ts`

- `apps/n8n/flows/scraper-keywords.json`
  - Update URL to call local backend reliably from Docker:
    - `http://host.docker.internal:3001/api/keywords/scrap`

## 4) Next.js webhooks

Verify the webhook route expects required fields and secrets/headers as needed:
- Route: `apps/web/app/api/competitor-analysis/webhook/route.ts`
- Required JSON fields:
  - `analysisId`, `type`, `status` (plus payload specific to each analysis)
- If you enforce a shared secret, set and validate `N8N_WEBHOOK_SECRET` header.

## 5) Start services

- Start MongoDB (local or Docker). If using Docker, ensure it binds to `localhost:27017`.
- Start n8n via Docker Compose:
  - `docker compose -f apps/n8n/docker-compose.yml -f apps/n8n/docker-compose.override.yml up -d`
- Start Next.js app:
  - From project root: `pnpm dev` (or `npm run dev`)

## 6) Test the integration

- Open n8n Editor: `http://localhost:5678`
- Execute the flows:
  - Trigger `competitor-analysis-workflow` with a test payload that includes `{ analysisId, type: "competitor", status: "completed" }`
  - Observe Next.js logs for webhook receipt and MongoDB updates
- For `scraper-keywords`, run the node and verify it reaches your backend on `http://host.docker.internal:3001`.

## 7) Troubleshooting

- If webhooks fail, check:
  - n8n logs (container logs): `docker logs <n8n-container>`
  - Next.js server logs
  - Network reachability from Docker to host via `host.docker.internal`
- If MongoDB auth errors appear, set `user/password` and `authSource` accordingly in credentials.

## 8) Production notes

- Use real secrets and HTTPS endpoints.
- Replace `host.docker.internal` with internal network addresses or a shared gateway.
- Configure n8n credentials with secure users and passwords.