# JobVista.NG — Frontend

React app (Create React App + TypeScript + Tailwind CSS) for browsing scraped job listings and building/enhancing CVs.

## Setup

```sh
npm install
cp .env.example .env   # only needed if not using the default localhost:4000 backend
npm start
```

Runs on [http://localhost:3000](http://localhost:3000) and expects the backend (`../scraper-backend`) running on `http://localhost:4000` by default.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | No | Backend base URL. Defaults to `http://localhost:4000`. Set this when pointing at a deployed backend. |

Note: anything prefixed `REACT_APP_` gets bundled into the client-side JS and is publicly visible in the browser — never put secrets (API keys, tokens) here. AI-related calls go through the backend for exactly this reason.

## Scripts

- `npm start` — dev server with hot reload
- `npm test` — test runner (interactive watch mode)
- `npm run build` — production build to `build/`. **Note:** hosts like Vercel run this with `CI=true`, which turns ESLint warnings (e.g. unused imports) into build-breaking errors. Run `CI=true npm run build` locally before pushing if a deploy might be affected.

## Structure

- `src/components/AppShell.tsx` — shared layout: fixed sidebar on desktop, top bar + fixed bottom tab bar on mobile
- `src/components/HomePage.tsx` — job search/filter/listing page
- `src/components/CVGenerator.tsx` — CV builder + upload-and-enhance flow
- `src/hooks/useTheme.ts` — single source of truth for light/dark/system theme, shared across the whole app
- `src/services/api.ts` — backend API client

This project was originally bootstrapped with [Create React App](https://github.com/facebook/create-react-app); see the [CRA documentation](https://facebook.github.io/create-react-app/docs/getting-started) for tooling details not covered here.
