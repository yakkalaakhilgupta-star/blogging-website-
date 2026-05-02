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
- **Payments**: Stripe (stripe + stripe-replit-sync) — requires Stripe integration connected via Replit

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
- `pnpm --filter @workspace/api-server exec tsx scripts/seed-products.ts` — seed Stripe membership products (run once after connecting Stripe)

## Architecture

### Frontend (`artifacts/nature-platform`)

- `src/App.tsx` — PublicRouter (with Layout) vs AdminRouter (without Layout), separated
- `src/pages/` — all public pages (Home, Articles, ArticleReader, Species, Portfolio, Membership, etc.)
- `src/pages/admin/` — admin CMS (AdminArticles, AdminArticleEdit, AdminSpecies, AdminPortfolio, AdminTags, AdminAnalytics, AdminNewsletter, AdminComments, AdminSeries)
- `src/components/` — shared components (Navbar, Footer, ArticleCard, CookieConsentBanner, CommentsSection, SeriesNav, AuthorBio, etc.)
- `src/hooks/` — useBookmarks, useWebVitals, usePageAnalytics, useAdminAuth

### API (`artifacts/api-server`)

- `src/routes/articles.ts` — CRUD + cursor pagination + PostgreSQL tsvector full-text search
- `src/routes/newsletter.ts` — double opt-in signup + confirm endpoint + admin broadcast
- `src/routes/comments.ts` — GET/POST public comments (moderated), admin PATCH/DELETE
- `src/routes/series.ts` — article series/collections CRUD + article assignment
- `src/routes/stripe.ts` — membership checkout, status check, customer portal, products list
- `src/routes/vitals.ts` — Core Web Vitals ingestion (handles sendBeacon text/plain)
- `src/routes/analytics.ts` — page view tracking
- `src/lib/migrations.ts` — startup migrations (all schema changes applied here)
- `src/middlewares/adminAuth.ts` — Bearer token admin auth (ADMIN_SECRET env var)
- `src/stripeClient.ts` — fetches Stripe credentials from Replit connector API
- `src/webhookHandlers.ts` — Stripe webhook processor (registered BEFORE express.json())
- `src/stripeStorage.ts` — queries stripe.* schema tables
- `scripts/seed-products.ts` — creates Verdant Page membership products in Stripe

### Database Schema

Tables: `articles`, `categories`, `tags`, `article_tags`, `species`, `portfolio_items`, `newsletter_subscribers`, `page_views`, `web_vitals`, `contact_messages`, `series`, `comments`, `members`

Stripe-managed tables (in `stripe` schema, auto-created by stripe-replit-sync): `stripe.products`, `stripe.prices`, `stripe.customers`, `stripe.subscriptions`

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

Pages: Articles list/edit, Species list/edit, Portfolio list, Tags, Analytics dashboard, Newsletter subscribers + broadcast, Comments moderation, Series management.

## Membership (Stripe)

The `/membership` page shows pricing plans fetched from Stripe. When Stripe is not connected, it shows a "coming soon" state gracefully.

**Setup steps (once):**
1. Connect Stripe via Replit Integrations tab
2. Run `pnpm --filter @workspace/api-server exec tsx scripts/seed-products.ts` to create products
3. Restart the API Server workflow — `syncBackfill()` will sync products to the DB

**Routes:**
- `GET /api/membership/products` — list active products + prices
- `POST /api/membership/checkout` — create Stripe Checkout session (`{ priceId, email? }`)
- `GET /api/membership/status?email=` — check if email has active subscription
- `POST /api/membership/portal` — create customer portal session (`{ customerId }`)
- `POST /api/stripe/webhook` — Stripe webhook (registered BEFORE express.json())

**Frontend pages:**
- `/membership` — pricing page with plan selection + member status checker
- `/membership/success` — post-checkout success
- `/membership/cancel` — post-checkout cancel

## Known Notes

- `useMutation` from @tanstack/react-query is not used — direct fetch + useState for all mutations
- `@uiw/react-md-editor` is lazy-loaded and included in `optimizeDeps` + `resolve.dedupe` to prevent double-React
- Newsletter email sending silently skips if `RESEND_API_KEY` is not configured
- Health endpoint is at `/api/healthz` (not `/api/health`)
- Comments are moderated (approved=FALSE by default); admin must approve at `/admin/comments`
- Stripe webhook route registered BEFORE `express.json()` in `app.ts` — critical for Buffer payload
- Stripe gracefully degrades: all /api/membership/* endpoints return `stripe_not_configured` error when integration is not connected
