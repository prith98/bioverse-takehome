# Bioverse Intake Questionnaire System

A full-stack intake questionnaire web application built with Next.js 16, PostgreSQL, and Prisma.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** + **shadcn/ui**
- **PostgreSQL** (Neon)
- **Prisma 7**
- **iron-session** (cookie-based session)

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

## Login Credentials

| Role  | Username | Password |
|-------|----------|----------|
| User  | `user`   | `user`   |
| Admin | `admin`  | `admin`  |

## Deployment (Vercel)

1. Push to GitHub and connect the repo to Vercel.
2. Add `DATABASE_URL` and `SESSION_SECRET` in Vercel → Project Settings → Environment Variables.
3. The build command (`prisma generate && prisma migrate deploy && next build`) runs automatically.
