# HelpFinance Workspace

## Overview

HelpFinance is a gamified personal finance SaaS web app built with React + Vite frontend and Express 5 backend in a pnpm monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/helpfinance) at `/`
- **API framework**: Express 5 (artifacts/api-server) at `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Charts**: Recharts
- **Build**: esbuild (CJS bundle)

## Features

1. **Dashboard** — Balance overview, income/expense area chart, savings rate, category donut chart, AI insights, recent transactions
2. **Transactions** — Full CRUD, filter by type/category/month, recurring expense support
3. **AI Chat** — Smart financial coach that analyzes real transaction data
4. **Gamification** — XP, levels (Beginner → Financial Expert), achievement badges, streak counter
5. **Goals** — Financial goals with progress tracking and deadline countdowns

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Tables

- `transactions` — income/expense records with categories and recurring flags
- `goals` — financial goals with progress tracking
- `user_profile` — gamification profile (XP, level, streak)
- `user_badges` — earned achievement badges

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
