# PromptVault

A modern, minimal web app for collecting, organizing, and browsing AI prompts visually.

## Features

- Responsive prompt card grid (desktop/tablet/mobile)
- Favorites toggle and Favorites filter
- Tag-based filtering
- Search by title/description/prompt text
- Copy full prompt to clipboard with toast feedback
- Read More modal with ESC/outside-click close
- Public/private prompt visibility
- Public homepage feed for logged-out users
- Account auth with JWT sessions
- PostgreSQL persistence via Prisma
- Framer Motion micro-interactions

## Tech stack

- Frontend: React + Vite + Tailwind
- Backend API: Express
- Database ORM: Prisma
- Database: PostgreSQL

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
```

## Run (web + API)

```bash
npm run dev
```

- Web app: `http://localhost:5173`
- API: `http://localhost:4000`

## Environment variables

Use `.env` (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: secret used to sign JWT access tokens
- `API_PORT`: API server port (default `4000`)
- `CORS_ORIGIN`: allowed web origin for API calls
- `VITE_API_URL`: frontend API base URL

## Production notes

- Run database migrations on deploy with `npm run prisma:deploy`
- Set a strong `JWT_SECRET` in production
- Set `CORS_ORIGIN` and `VITE_API_URL` to your deployed domains
