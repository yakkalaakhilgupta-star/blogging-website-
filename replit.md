# The Verdant Page — Nature Writing Platform

## Overview

A production-ready nature writing platform (React + Vite frontend + Express API + PostgreSQL/Drizzle ORM), built in a pnpm workspace monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Email**: Resend (graceful skip if RESEND_API_KEY not set)
- **Analytics**: Custom page views + Core Web Vitals (web-vitals)
- **Charts**: Recharts (admin dashboard)

## Running Services

| Service | Workflow | Port |
|---|---|---|
| Express API | `API Server` | 8080 |
| React frontend | `artifacts/nature-platform: web` | 22885 |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Architecture

### Frontend (`artifacts/nature-platform`)

- `src/App.tsx` — PublicRouter (with Layout) vs AdminRouter (without Layout), separated
- `src/pages/` — all public pages (Home, Articles, ArticleReader, Species, Portfolio, etc.)
- `src/pages/admin/` — admin CMS (AdminArticles, AdminArticleEdit, AdminSpecies, AdminPortfolio, AdminTags, AdminAnalytics, AdminNewsletter)
- `src/components/` — shared components (Navbar, Footer, ArticleCard, CookieConsentBanner, etc.)
- `src/hooks/` — useBookmarks, useWebVitals, usePageAnalytics, useAdminAuth

### API (`artifacts/api-server`)

- `src/routes/articles.ts` — CRUD + cursor pagination + PostgreSQL tsvector full-text search
- `src/routes/newsletter.ts` — double opt-in signup + confirm endpoint + admin broadcast
- `src/routes/vitals.ts` — Core Web Vitals ingestion (handles sendBeacon text/plain)
- `src/routes/analytics.ts` — page view tracking
- `src/lib/migrations.ts` — startup migrations (confirmed/confirm_token columns, web_vitals table)
- `src/middlewares/adminAuth.ts` — Bearer token admin auth (ADMIN_SECRET env var)

### Database Schema

Tables: `articles`, `categories`, `tags`, `article_tags`, `species`, `portfolio_items`, `newsletter_subscribers` (+ confirmed/confirm_token columns via migration), `page_views`, `web_vitals`, `contact_messages`

## Security

- Helmet (full security headers including CSP, HSTS, X-Frame-Options)
- CORS with configurable origins (ALLOWED_ORIGINS env var)
- Rate limiting: 300 req / 15 min per IP
- HPP (HTTP Parameter Pollution protection)
- Admin routes protected by Bearer token middleware
- Input validation via Zod on all routes

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_SECRET` | Yes | Admin CMS login password |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `RESEND_API_KEY` | No | Email sending (gracefully skipped if absent) |
| `SITE_URL` | No | Base URL for email links (defaults to https://theverdantpage.com) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins for production |

## Admin CMS

Navigate to `/admin` and enter the `ADMIN_SECRET` value to log in.

Pages: Articles list/edit, Species list/edit, Portfolio list, Tags, Analytics dashboard, Newsletter subscribers + broadcast.

## Known Notes

- `useMutation` from @tanstack/react-query is not used — direct fetch + useState for all mutations
- `@uiw/react-md-editor` is lazy-loaded and included in `optimizeDeps` + `resolve.dedupe` to prevent double-React
- Newsletter email sending silently skips if `RESEND_API_KEY` is not configured
- Health endpoint is at `/api/healthz` (not `/api/health`)
