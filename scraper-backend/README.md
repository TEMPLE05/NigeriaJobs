# JobVista.NG — Backend

Express API that scrapes job listings from Indeed, LinkedIn, and Jobberman, stores them in MongoDB, and serves them to the frontend. Also handles CV generation and parsing.

## Prerequisites

- Node.js 18+
- A MongoDB connection string (e.g. MongoDB Atlas)

## Setup

```sh
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `PORT` | No | Defaults to `4000` |
| `ADMIN_API_KEY` | No | Required to call `/api/scrape` and `/api/cleanup-duplicates` (send as an `x-admin-key` header). Unset = those two routes are blocked entirely (fails closed), not open. |

```sh
npm start
```

`postinstall` runs `npx puppeteer browsers install chrome` automatically, since Puppeteer needs its own Chrome binary.

## API

### Jobs

- `GET /api/jobs?keyword=&location=&source=&level=&page=&limit=` — paginated, deduplicated job listings (only jobs from the last 7 days)
- `GET /api/scrape` 🔒 — manually trigger a scrape cycle in the background (no-ops if one is already running)
- `GET /api/ping` — no-op health check (no DB query), for an external keep-alive scheduler — see "Deployment" below
- `DELETE /api/cleanup` — delete jobs older than 7 days. Deliberately left open (not 🔒) — it's wired to a real "Clean Old Jobs" button in the frontend, and the frontend can't hold a secret without shipping it to every visitor's browser. Low risk regardless: it only removes what the weekly cron would delete anyway.
- `DELETE /api/cleanup-duplicates` 🔒 — remove duplicate postings (same title/company/location), keeping the newest
- `GET /api/results` — latest 50 jobs, unfiltered
- `GET /api/debug/jobs` — diagnostic listing with scrape age, for troubleshooting

🔒 = requires an `x-admin-key` header matching `ADMIN_API_KEY`.

### CV tools

- `POST /api/cv/generate` — build a CV PDF from structured form data, with optional local content enhancement
- `POST /api/cv/enhance` — upload a PDF/DOCX (`multipart/form-data`, field `cvFile`); parses and restructures it, then generates an enhanced CV PDF
- `GET /api/cv/download/:filename` — download a generated CV PDF (deletes it from disk after download)

## How it works

### Scraping

`crawler.js` scrapes Indeed, LinkedIn, and Jobberman with `puppeteer-extra` + the stealth plugin. Scraped job URLs are normalized (stripping site-specific tracking query params like LinkedIn's `trackingId`/`refId` or Indeed's redirect blobs) before storage, so the same posting re-scraped later updates the existing record instead of creating a duplicate.

### Scheduling (`index.js`)

- **Hourly scrape** (`0 * * * *`) — runs the full keyword × location matrix across all three platforms. Guarded so a manual `/api/scrape` call and the cron can't run concurrently.
- **Weekly deletion** (Sundays at midnight) — removes jobs older than 7 days.

Both rely on the Node process staying alive continuously — see "Deployment" below if hosted somewhere that sleeps the process on inactivity.

## Deployment

On Render's free tier (or any host that spins the service down after a period of no HTTP traffic), the whole process — including both cron schedules above — stops running while asleep, and even an external ping meant to wake it (e.g. an hourly cron-job.org call to `/api/scrape`) can itself fail with a 503 if the wake attempt doesn't complete in time.

Fix: point an external scheduler at `GET /api/ping` every ~10-14 minutes (comfortably under Render's 15-minute inactivity threshold) so the service never gets the chance to sleep. Once it's continuously warm, both the in-process cron schedules and any external `/api/scrape` trigger become reliable again.

### CV parsing

Uploaded PDFs/DOCX files are parsed locally (`pdf-parse` / `mammoth`) — no AI required. Section headers (Education, Experience, Skills, Summary) are detected heuristically and lightly structured (dates, company/position where detectable). This is best-effort: review the extracted fields before downloading, since arbitrary resume layouts can't be perfectly reconstructed without AI.

## License

MIT
