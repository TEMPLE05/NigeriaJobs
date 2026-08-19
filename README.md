# JobVista.NG

A job aggregator for Nigerian job seekers. It scrapes listings from multiple Nigerian job boards, stores them in MongoDB, and serves them through a React frontend with search/filtering and a CV builder.

## Features

- **Automated scraping** — Indeed, LinkedIn, and Jobberman, on an hourly cron with an overlap guard so runs can't stack up
- **Deduplication** — scraped URLs are normalized (stripping per-visit tracking params) so the same posting doesn't reappear as a "new" job on every scrape
- **Search & filtering** — by keyword, location, and source
- **CV Generator** — build a CV from scratch, or upload an existing PDF/DOCX to parse and enhance locally (no AI required); optional AI job-fit analysis via a secured backend endpoint
- **Responsive UI** — persistent sidebar on desktop, fixed bottom tab bar on mobile, light/dark/system theme

## Tech stack

| | |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, React Router |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Scraping | Puppeteer (`puppeteer-extra` + stealth plugin) |
| CV parsing | `pdf-parse`, `mammoth` (DOCX) |
| Scheduling | `node-cron` |

## Project structure

```
job-aggregator/
├── frontend/            React app (Create React App)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── services/     API client (services/api.ts)
│       └── types/
│
└── scraper-backend/      Express API + scraper
    ├── index.js           Server entry point, all API routes
    ├── crawler.js         Site-specific scraping logic
    ├── model/job.js        Mongoose schema
    └── uploads/            Generated CV PDFs (gitignored, not persisted)
```

## Running locally

**Backend:**
```sh
cd scraper-backend
npm install
cp .env.example .env   # then fill in MONGODB_URI and (optionally) OPENAI_API_KEY
npm start
```

**Frontend** (in a separate terminal):
```sh
cd frontend
npm install
npm start
```

The frontend defaults to `http://localhost:4000` for the API; see `frontend/.env.example` if you need to point it elsewhere (e.g. a deployed backend).

## Deployment

- **Frontend**: deployed on Vercel. `npm run build` runs with `CI=true`, which treats ESLint warnings as build-breaking errors — run `CI=true npm run build` locally before pushing if you're unsure.
- **Backend**: intended for a host that supports long-running Node processes (e.g. Render) since it runs Puppeteer and a persistent cron scheduler — not a serverless/edge target.

## Contributing

Feedback, bug reports, and contributions are welcome.
