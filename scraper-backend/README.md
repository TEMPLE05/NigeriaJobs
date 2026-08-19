# JobVista.NG — Backend

Express API that scrapes job listings from Indeed, LinkedIn, and Jobberman, stores them in MongoDB, and serves them to the frontend. Also handles CV generation/parsing and (optionally) AI job-fit analysis.

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
| `OPENAI_API_KEY` | No | Only needed for `/api/cv/analyze` (AI job-fit suggestions). Everything else works without it. |

```sh
npm start
```

`postinstall` runs `npx puppeteer browsers install chrome` automatically, since Puppeteer needs its own Chrome binary.

## API

### Jobs

- `GET /api/jobs?keyword=&location=&source=&page=&limit=` — paginated, deduplicated job listings (only jobs from the last 7 days)
- `GET /api/scrape` — manually trigger a scrape cycle in the background (no-ops if one is already running)
- `DELETE /api/cleanup` — delete jobs older than 7 days
- `DELETE /api/cleanup-duplicates` — remove duplicate postings (same title/company/location), keeping the newest
- `GET /api/results` — latest 50 jobs, unfiltered
- `GET /api/debug/jobs` — diagnostic listing with scrape age, for troubleshooting

### CV tools

- `POST /api/cv/generate` — build a CV PDF from structured form data, with optional local content enhancement
- `POST /api/cv/enhance` — upload a PDF/DOCX (`multipart/form-data`, field `cvFile`); parses and restructures it, then generates an enhanced CV PDF
- `POST /api/cv/analyze` — AI-powered job-fit suggestions given a job description + CV data (requires `OPENAI_API_KEY`)
- `GET /api/cv/download/:filename` — download a generated CV PDF (deletes it from disk after download)

## How it works

### Scraping

`crawler.js` scrapes Indeed, LinkedIn, and Jobberman with `puppeteer-extra` + the stealth plugin. Scraped job URLs are normalized (stripping site-specific tracking query params like LinkedIn's `trackingId`/`refId` or Indeed's redirect blobs) before storage, so the same posting re-scraped later updates the existing record instead of creating a duplicate.

### Scheduling (`index.js`)

- **Hourly scrape** (`0 * * * *`) — runs the full keyword × location matrix across all three platforms. Guarded so a manual `/api/scrape` call and the cron can't run concurrently.
- **Weekly deletion** (Sundays at midnight) — removes jobs older than 7 days.

### CV parsing

Uploaded PDFs/DOCX files are parsed locally (`pdf-parse` / `mammoth`) — no AI required. Section headers (Education, Experience, Skills, Summary) are detected heuristically and lightly structured (dates, company/position where detectable). This is best-effort: review the extracted fields before downloading, since arbitrary resume layouts can't be perfectly reconstructed without AI.

## License

MIT
