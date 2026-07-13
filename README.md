# exfocus — Smart Study Planner

An intelligent study planner that builds and continuously recalculates a personalized study
schedule from your subjects, exams, assignments, quizzes, and projects. It weighs deadlines,
difficulty, grade weight, and preparation level to decide what you should study and when —
then keeps the plan in sync automatically every time your academic data changes.

Think Notion + Google Calendar + Todoist + Motion, focused on studying.

## Features

- **AI scheduling engine** — deterministic, fully explainable priority scoring and greedy
  time allocation with burnout caps, spaced repetition, and balanced subject rotation. No
  external AI dependency; the plan recalculates on every data change.
- **Smart priority calculator** — Critical/High/Medium/Low from days remaining, difficulty,
  grade weight, credits, and preparation gap.
- **Deadline risk predictor** and **study-hour recommendation** surfaced on the dashboard.
- **Exam readiness score** (0–100) blending topic completion and tracked study hours.
- **Focus mode** — Pomodoro 25/5, Deep Focus 50/10, 90-minute sessions, custom, fullscreen,
  synthesized ambient sound, with XP/coins/streak rewards on completion.
- **Academic calendar** — month/week/agenda views with drag-and-drop rescheduling that
  reflows the rest of the plan.
- **Productivity analytics** — study-hours trend, subject distribution, weekly productivity,
  a GitHub-style heatmap, and a rule-based weekly report.
- **Gamification** — XP, levels, coins, streaks, and unlockable achievements.
- **Notifications** — in-app bell plus optional browser push, with scheduled exam/assignment/
  streak reminders and daily/weekly summaries.
- **Global search** (Cmd/Ctrl+K), **settings**, **profile**, **import/export**.
- Light/dark mode, responsive, accessible, premium SaaS design system.

## Tech stack

| Area         | Choice                                                             |
| ------------ | ------------------------------------------------------------------ |
| Framework    | Next.js 16 (App Router) + TypeScript                               |
| Styling      | Tailwind CSS v4 + shadcn/ui (Base UI primitives)                   |
| Database     | PostgreSQL (Neon) + Prisma 7 (Neon serverless driver adapter)      |
| Auth         | Auth.js (NextAuth v5) — credentials (bcrypt) + Google OAuth        |
| Server state | TanStack Query · client state: Zustand                             |
| Charts       | Recharts (via shadcn Chart) · Calendar: FullCalendar               |
| Animation    | Framer Motion                                                      |
| Validation   | Zod (shared client/server schemas)                                 |
| Testing      | Vitest + React Testing Library (unit/component) · Playwright (e2e) |

### Architecture

Clean Architecture with feature-based folders under `src/`:

```
src/
  domain/           # framework-free entities/types (scheduling engine contracts)
  application/      # pure services: scheduling engine, priority calculator,
                    #   readiness score, streak, achievements, weekly report
  infrastructure/   # Prisma client + repositories (all DB access lives here)
  features/         # feature modules: auth, subjects, assignments, exams, quizzes,
                    #   projects, focus, calendar, analytics, gamification,
                    #   notifications, search, settings, profile, dashboard
  components/        # shared UI (ui/ = shadcn primitives, layout/, shared/, forms/)
  app/               # Next.js routes: (auth) group, (dashboard) group, api/
  lib/               # env validation, constants, helpers
```

The `application/` services are pure and DB-free, which is why they carry the bulk of the
unit tests. Repositories in `infrastructure/` are the only place that touches Prisma.

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A PostgreSQL database. The app is wired for [Neon](https://neon.tech) (serverless Postgres)
  via the Prisma Neon driver adapter, but any Postgres works — see the note in
  `src/infrastructure/db/prisma.ts` if you switch providers.

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in real values:

```bash
cp .env.example .env
```

| Variable                       | Required | Notes                                                                         |
| ------------------------------ | -------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`                 | yes      | Neon **pooled** connection string (the app runtime uses this).                |
| `DIRECT_URL`                   | yes      | Neon **direct** (unpooled) connection — used by Prisma for migrations.        |
| `AUTH_SECRET`                  | yes      | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL`                 | yes      | `http://localhost:3000` in dev; your deployed URL in prod.                    |
| `AUTH_GOOGLE_ID` / `_SECRET`   | no       | Google OAuth client. Leave blank to disable the Google button.                |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | no       | Web Push. Generate with `npx web-push generate-vapid-keys`.                   |
| `VAPID_PRIVATE_KEY`            | no       | Web Push private key (keep secret).                                           |
| `CRON_SECRET`                  | no       | Bearer token protecting `/api/cron/notifications`.                            |

### 3. Set up the database

```bash
npm run db:deploy   # apply migrations (prisma migrate deploy)
npm run db:seed     # seed the achievement catalog
```

For iterative schema changes during development use `npm run db:migrate` instead.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and add a subject
to see the planner generate a schedule.

## Scripts

| Script               | What it does                                                |
| -------------------- | ----------------------------------------------------------- |
| `npm run dev`        | Start the dev server                                        |
| `npm run build`      | `prisma generate` + production build                        |
| `npm run start`      | Start the production server                                 |
| `npm run lint`       | ESLint                                                      |
| `npm run typecheck`  | `tsc --noEmit`                                              |
| `npm run format`     | Prettier (write) · `format:check` to verify only            |
| `npm run test`       | Vitest unit/component tests · `test:watch`, `test:coverage` |
| `npm run test:e2e`   | Playwright end-to-end tests                                 |
| `npm run db:migrate` | Create + apply a dev migration                              |
| `npm run db:deploy`  | Apply committed migrations (prod)                           |
| `npm run db:seed`    | Seed achievements                                           |
| `npm run db:studio`  | Prisma Studio                                               |

## Testing

- **Unit / component** (`npm run test`): the scheduling engine, priority calculator,
  readiness score, streak logic, weekly-report suggestions, gamification math, quotes, the
  focus-timer reducer, and a component render test — all runnable with no database.
- **End-to-end** (`npm run test:e2e`): Playwright drives the public routes and auth guards.
  It starts its own dev server (see `playwright.config.ts`). The included specs don't require
  a live database; add authenticated flows once you have a seeded test database.

## Deployment (Vercel)

1. Push the repo to GitHub and import it into Vercel.
2. Add all environment variables from `.env.example` in the Vercel project settings. Use your
   production Neon connection strings for `DATABASE_URL` / `DIRECT_URL` and your deployed
   origin for `NEXTAUTH_URL`.
3. The build command (`npm run build`) runs `prisma generate` automatically. Apply migrations
   against your production database with `npm run db:deploy` (e.g. as a release step or once
   from your machine against the prod `DIRECT_URL`).
4. `vercel.json` registers an hourly cron hitting `/api/cron/notifications`; set `CRON_SECRET`
   so only Vercel Cron (which sends it as a bearer token) can trigger it.

Any Node host works too — run `npm run build` then `npm run start` behind your process manager,
with the same environment variables set.
