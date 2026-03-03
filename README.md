# Bioverse Intake Questionnaire System

A full-stack intake questionnaire application built for the Bioverse coding exercise. Users complete medical intake questionnaires and administrators review responses. The app loads three pre-seeded questionnaires (Semaglutide, NAD Injection, Metformin) from a PostgreSQL database, renders questions in priority order, and stores per-user answers with support for both free-text and multi-select inputs.

---

## Features

**User portal**
- Account creation and login
- Questionnaire selection page showing all available intakes
- Question forms with free-text inputs and multi-select MCQ checkboxes
- Answers pre-populated from prior questionnaires when the same question appears across multiple intakes
- Back navigation link — no need to use the browser back button

**Admin panel**
- Per-questionnaire completion grid (✓ / ○ icons per user × questionnaire)
- Click a questionnaire cell → view only that user's answers for that specific questionnaire
- Click a username → view all of that user's answers across every questionnaire
- Multi-select mode: highlight any combination of (user × questionnaire) cells, then open a combined modal showing all selected responses, clearly separated by user

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components handle data fetching; Client Components handle interactivity. Minimal client-side JS where it's not needed. |
| Language | TypeScript | End-to-end type safety across DB models, API response shapes, and UI components |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first CSS with accessible, unstyled component primitives and zero runtime overhead |
| Database | PostgreSQL via [Neon](https://neon.tech) | Serverless Postgres with a generous free tier; native Vercel integration |
| ORM | Prisma 7 | Latest `prisma-client` generator with driver adapter support; migrations and seed tooling included |
| Sessions | iron-session | Lightweight encrypted cookie sessions — no JWT, no token refresh, no extra infrastructure |

---

## Database Schema

Five models that map directly to the three provided CSV files plus user and answer storage:

```
User
  id, username, password, role ("user" | "admin"), createdAt

Questionnaire                    ← questionnaire_questionnaires.csv
  id, name

Question                         ← questionnaire_questions.csv
  id, question (Json)            ← { type: "input" | "mcq", question: string, options?: string[] }

QuestionnaireJunction            ← questionnaire_junction.csv
  id, questionnaireId, questionId, priority
  unique(questionnaireId, questionId)

UserAnswer                       ← one row per (user × question × questionnaire)
  id, userId, questionId, questionnaireId
  answer (Json)                  ← string[] — 1 element for text, N elements for multi-select
  createdAt, updatedAt
  unique(userId, questionId, questionnaireId)
```

---

## Key Technical Decisions

### `answer Json` instead of `String[]`
Prisma 7's new `prisma-client` generator does not support native PostgreSQL `String[]` array columns. Using `Json` (cast to `string[]` at the application layer) handles both single free-text answers and multi-select MCQ selections uniformly with no schema compromise.

### Upsert via composite unique constraint
`UserAnswer` enforces `@@unique([userId, questionId, questionnaireId])`. This lets every answer submission run as an `upsert` inside a `$transaction` — re-submitting a questionnaire atomically overwrites the previous answers rather than creating duplicate rows.

### Cross-questionnaire pre-population
When a user opens a questionnaire the server fetches two sets of answers in parallel:
1. Answers already saved for **this** questionnaire (takes priority)
2. The most-recently-saved answer for each question from **any other** questionnaire (fallback)

The user's own saved answers are never overwritten by a prior questionnaire's data. This satisfies the acceptance criterion: *"If a question has been previously answered on another questionnaire, pre-populate the answer for the question."*

### Prisma 7 + `@prisma/adapter-pg`
Prisma 7 removed the `datasourceUrl` constructor option and now requires a driver adapter for runtime database connections. We use `@prisma/adapter-pg` with the `pg` package for the application runtime, and keep the `DATABASE_URL` in `prisma.config.ts` (for migrations and seeding) rather than in the schema file.

### iron-session over JWT
The app has two roles and no public API surface. iron-session stores an encrypted `{ id, username, role }` cookie — no refresh tokens, no JWKS endpoint, no token expiry logic needed. Next.js middleware reads the cookie to enforce route-level access control.

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
SESSION_SECRET="a-random-string-that-is-at-least-32-characters-long"
```

Get your `DATABASE_URL` from [Neon](https://neon.tech) → Project → Connection Details → Connection string.

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed the database

```bash
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Login Credentials

| Role  | Username | Password |
|-------|----------|----------|
| User  | `user`   | `user`   |
| Admin | `admin`  | `admin`  |

New accounts can also be created from the login page.

---

## Deployment (Vercel)

1. Push to GitHub and connect the repo to Vercel.
2. Add `DATABASE_URL` and `SESSION_SECRET` in Vercel → Project Settings → Environment Variables.
3. The build command runs automatically:

```bash
prisma generate && prisma migrate deploy && next build
```
