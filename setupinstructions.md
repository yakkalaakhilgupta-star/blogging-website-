# The Verdant Page — Setup Instructions

A nature writing platform built with React + Vite (frontend), Express 5 (API), and PostgreSQL (database), all managed in a pnpm workspace monorepo.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [First-time Setup](#first-time-setup)
3. [Running the Project](#running-the-project)
4. [Project Structure](#project-structure)
5. [Environment Variables](#environment-variables)
6. [API Endpoints](#api-endpoints)
7. [Admin CMS](#admin-cms)
8. [Features & How They Work](#features--how-they-work)
9. [Database](#database)
10. [Stripe Membership (Optional)](#stripe-membership-optional)
11. [Email (Optional)](#email-optional)
12. [SEO](#seo)
13. [Deployment](#deployment)

---

## Prerequisites

- **Node.js** v24+
- **pnpm** v9+ (the only supported package manager — npm and yarn are blocked)
- **PostgreSQL** database (Replit provides one automatically via the Database integration)

---

## First-time Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set environment variables

The minimum required variables are `DATABASE_URL` and `ADMIN_SECRET`. On Replit these are set via the Secrets panel. See [Environment Variables](#environment-variables) for the full list.

### 3. Start the services

On Replit, two workflows handle this automatically:

| Workflow | What it runs | Port |
|---|---|---|
| `API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 |
| `artifacts/nature-platform: web` | `pnpm --filter @workspace/nature-platform run dev` | 22885 |

To start them manually from the terminal:

```bash
# Terminal 1 — API
PORT=8080 pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
PORT=22885 BASE_PATH=/ pnpm --filter @workspace/nature-platform run dev
```

The frontend proxies all `/api/*` requests to port 8080 via Vite's `server.proxy` config.

---

## Running the Project

### Development

```bash
# Typecheck the whole monorepo
pnpm run typecheck

# Build everything (typecheck + compile)
pnpm run build
```

### Regenerate API client (after changing the OpenAPI spec)

```bash
pnpm --filter @workspace/api-spec run codegen
```

This reads `lib/api-spec/src/openapi.yaml` and regenerates:
- `lib/api-client-react/` — React Query hooks
- `lib/api-zod/` — Zod validation schemas

### Database schema changes (development only)

```bash
pnpm --filter @workspace/db run push
```

> **Warning:** This compares your Drizzle schema against the live database and will offer to drop columns/tables for anything removed. Always choose "No, abort" unless you are certain — several critical columns (`confirmed`, `confirm_token`, `series_id`, `series_order`) are managed by startup migrations, not the schema file.

For production schema changes, add a migration to `artifacts/api-server/src/lib/migrations.ts` instead. Migrations run automatically on server startup.

---

## Project Structure

```
/
├── artifacts/
│   ├── nature-platform/        # React + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/          # All public-facing pages
│   │   │   │   ├── admin/      # Admin CMS pages
│   │   │   ├── components/     # Shared UI components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   └── lib/            # Utilities (query client, sentry, etc.)
│   │   ├── public/             # Static files (robots.txt, opengraph.jpg, favicon)
│   │   └── index.html          # Entry HTML with base meta tags
│   │
│   └── api-server/             # Express 5 API
│       ├── src/
│       │   ├── routes/         # All route handlers (one file per resource)
│       │   ├── lib/            # Logger, migrations, email, email templates
│       │   ├── middlewares/    # Admin auth middleware
│       │   ├── app.ts          # Express app setup (middleware, routes)
│       │   ├── index.ts        # Server entry point (reads PORT, runs migrations)
│       │   ├── stripeClient.ts # Fetches Stripe keys from Replit connector
│       │   ├── stripeStorage.ts# Stripe DB queries
│       │   └── webhookHandlers.ts # Stripe webhook event processor
│       └── scripts/
│           └── seed-products.ts # One-time Stripe product seeder
│
├── lib/
│   ├── api-spec/               # OpenAPI 3.0 spec (source of truth for API shape)
│   ├── api-client-react/       # Auto-generated React Query hooks (do not edit)
│   ├── api-zod/                # Auto-generated Zod schemas (do not edit)
│   └── db/                     # Drizzle ORM schema + database connection pool
│
├── scripts/
│   └── post-merge.sh           # Post-merge setup script (runs after task merges)
│
├── pnpm-workspace.yaml         # Workspace package roots
├── tsconfig.base.json          # Shared TypeScript config
└── replit.md                   # Persistent architecture notes for this project
```

---

## Environment Variables

Set these in the Replit Secrets panel (or a `.env` file for local development).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_SECRET` | Yes | Password for the admin CMS at `/admin` |
| `RESEND_API_KEY` | No | Enables email sending (newsletter confirmations, broadcasts). Gracefully skipped if absent. |
| `SITE_URL` | No | Base URL used in email links and the sitemap. Defaults to `https://theverdantpage.com`. Set this to your deployed domain. |
| `ALLOWED_ORIGINS` | No | Comma-separated list of allowed CORS origins for production (e.g. `https://yourdomain.com`). |

---

## API Endpoints

The API runs at `http://localhost:8080` in development. All routes are prefixed with `/api`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Returns `{ status: "ok" }` |

### Articles

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/articles` | List articles. Query params: `q` (search), `category`, `tag`, `limit`, `cursor` |
| `GET` | `/api/articles/featured` | Get featured articles for the homepage |
| `GET` | `/api/articles/stats` | Total article count + category breakdown |
| `GET` | `/api/articles/:slug` | Get single article by slug |
| `POST` | `/api/articles` | Create article (admin) |
| `PATCH` | `/api/articles/:id` | Update article (admin) |
| `DELETE` | `/api/articles/:id` | Delete article (admin) |

### Series

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/series` | List all series |
| `GET` | `/api/series/:id` | Get series with its articles |
| `POST` | `/api/series` | Create series (admin) |
| `PATCH` | `/api/series/:id` | Update series (admin) |
| `DELETE` | `/api/series/:id` | Delete series (admin) |

### Comments

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/articles/:slug/comments` | Get approved comments for an article |
| `POST` | `/api/articles/:slug/comments` | Submit a comment (pending approval) |
| `PATCH` | `/api/comments/:id` | Approve/reject comment (admin) |
| `DELETE` | `/api/comments/:id` | Delete comment (admin) |

### Species

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/species` | List species. Query params: `q`, `kingdom`, `conservationStatus` |
| `GET` | `/api/species/:slug` | Get single species profile |
| `POST` | `/api/species` | Create species (admin) |
| `PATCH` | `/api/species/:id` | Update species (admin) |
| `DELETE` | `/api/species/:id` | Delete species (admin) |

### Newsletter

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/newsletter` | Subscribe with email (sends confirmation email) |
| `GET` | `/api/newsletter/confirm?token=` | Confirm subscription via token from email |
| `GET` | `/api/newsletter/unsubscribe?token=` | Unsubscribe via token |
| `GET` | `/api/newsletter/subscribers` | List all subscribers (admin) |
| `POST` | `/api/newsletter/broadcast` | Send broadcast email to confirmed subscribers (admin) |

### Portfolio

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/portfolio` | List all portfolio clips |
| `POST` | `/api/portfolio` | Create clip (admin) |
| `PATCH` | `/api/portfolio/:id` | Update clip (admin) |
| `DELETE` | `/api/portfolio/:id` | Delete clip (admin) |

### Contact

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/contact` | Submit a contact message (saved to DB + optional email notification) |
| `GET` | `/api/contact/messages` | List all contact messages (admin) |

### Analytics

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/analytics/pageview` | Record a page view |
| `GET` | `/api/analytics/pageviews` | Get page view data (admin) |
| `POST` | `/api/analytics/vitals` | Ingest Core Web Vitals (also accepts `text/plain` for `sendBeacon`) |

### SEO

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/sitemap.xml` | XML sitemap with all articles, species, and static pages |
| `GET` | `/api/feed.xml` | RSS 2.0 feed with all published articles |

### Membership (Stripe)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/membership/products` | List active membership plans |
| `POST` | `/api/membership/checkout` | Create Stripe Checkout session (`{ priceId, email? }`) |
| `GET` | `/api/membership/status?email=` | Check if an email has an active subscription |
| `POST` | `/api/membership/portal` | Open Stripe customer portal (`{ customerId }`) |
| `POST` | `/api/stripe/webhook` | Stripe webhook receiver |

---

## Admin CMS

Navigate to `/admin` and enter the value of `ADMIN_SECRET` to log in.

The secret is stored in `localStorage` under the key `verdant_admin_secret` and sent as a `Bearer` token on all admin API requests.

### Admin pages

| Path | What you can do |
|---|---|
| `/admin/articles` | List, create, edit, publish/unpublish articles |
| `/admin/articles/:id/edit` | Full article editor (Markdown, SEO fields, cover image, tags, series) |
| `/admin/species` | Manage species profiles |
| `/admin/portfolio` | Manage portfolio clips |
| `/admin/tags` | Create and delete article tags |
| `/admin/series` | Create series and assign articles to them |
| `/admin/comments` | Approve or delete reader comments |
| `/admin/newsletter` | View subscribers, send broadcast emails |
| `/admin/analytics` | Page view charts and Core Web Vitals |
| `/admin/messages` | View contact form submissions |

---

## Features & How They Work

### Article Search

Full-text search is powered by PostgreSQL `tsvector`. The `articles` table has a `search_vector` column populated from `title`, `excerpt`, and content. Searching via `GET /api/articles?q=keyword` runs a `tsquery` against this column. Results support cursor-based pagination via the `cursor` query parameter.

### Comments (Moderated)

Readers submit comments on articles. All comments default to `approved = false` and are invisible until an admin approves them at `/admin/comments`. The frontend polls `/api/articles/:slug/comments` which only returns approved comments.

### Article Series

Articles can be grouped into a named series (e.g. "Ocean Dispatches"). Each article in a series has a `series_order` position. The `SeriesNav` component renders automatically at the bottom of any article that belongs to a series, showing previous/next entries.

### Newsletter (Double Opt-in)

1. Reader enters their email on the homepage subscribe form
2. API saves the subscriber with `confirmed = false` and generates a `confirm_token`
3. A confirmation email is sent via Resend (skipped if `RESEND_API_KEY` is not set)
4. Reader clicks the link → `GET /api/newsletter/confirm?token=...` sets `confirmed = true`
5. Admin can broadcast to all confirmed subscribers from `/admin/newsletter`

### Reading List (Bookmarks)

Bookmarks are stored entirely in `localStorage` — no account required. The `useBookmarks` hook manages the list. The `/reading-list` page displays all bookmarked articles.

### Analytics

Two types of events are tracked:
- **Page views** — logged on every route change via `usePageAnalytics` hook
- **Core Web Vitals** — captured by `useWebVitals` hook using the `web-vitals` library, sent via `navigator.sendBeacon` on page unload

Both are stored in the `page_views` and `web_vitals` tables. The admin analytics dashboard (`/admin/analytics`) renders charts using Recharts.

### Security

The API server uses:
- **Helmet** — sets all standard security headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** — restricted to origins in `ALLOWED_ORIGINS` (or permissive in development)
- **Rate limiting** — 300 requests per 15 minutes per IP
- **HPP** — HTTP Parameter Pollution protection
- **Zod** — all request bodies and query params are validated before processing

---

## Database

The database layer lives in `lib/db/` and uses **Drizzle ORM** with a connection pool.

### Tables

| Table | Purpose |
|---|---|
| `articles` | All articles (title, slug, content, excerpt, image, SEO fields, series, published state) |
| `categories` | Article categories |
| `tags` | Article tags |
| `article_tags` | Many-to-many join between articles and tags |
| `series` | Article series/collections |
| `species` | Species profiles (common name, scientific name, kingdom, conservation status, description) |
| `portfolio_items` | Published clips (title, publication, URL, category, date) |
| `newsletter_subscribers` | Email addresses with `confirmed` flag and `confirm_token` |
| `contact_messages` | Contact form submissions |
| `comments` | Reader comments with `approved` flag |
| `page_views` | Page view events (path, timestamp, referrer) |
| `web_vitals` | Core Web Vitals events (LCP, FID, CLS, etc.) |
| `members` | Stripe membership records synced by stripe-replit-sync |

### Migrations

Schema changes in production are handled via the startup migration system in `artifacts/api-server/src/lib/migrations.ts`. Every time the API server starts, it runs any pending migrations. To add a new migration, append a new entry to the migrations array in that file.

Do **not** use `pnpm --filter @workspace/db run push` against production — it may drop columns.

---

## Stripe Membership (Optional)

The membership feature is fully built but requires a Stripe account to activate. Until then, all `/api/membership/*` endpoints return a `stripe_not_configured` response and the frontend shows a "coming soon" state gracefully.

### Activation steps

1. Connect Stripe via the **Replit Integrations** tab in the sidebar
2. Seed the membership products (run once):
   ```bash
   pnpm --filter @workspace/api-server exec tsx scripts/seed-products.ts
   ```
3. Restart the API Server workflow — `syncBackfill()` will sync Stripe products into the database
4. The `/membership` page will now show the pricing plans

### Stripe webhook

For the webhook to work in production, register your deployed URL in the Stripe dashboard:

```
https://yourdomain.com/api/stripe/webhook
```

The webhook handler is registered **before** `express.json()` in `app.ts` — this is required so the raw `Buffer` body is available for Stripe signature verification. Do not change this order.

---

## Email (Optional)

Email is sent via **Resend**. If `RESEND_API_KEY` is not set, all email operations silently succeed without sending anything — the platform is fully functional without email.

### What sends emails

| Trigger | Email sent |
|---|---|
| Newsletter signup | Confirmation link email |
| Admin broadcast | Newsletter to all confirmed subscribers |
| Contact form submission | Optional notification to site owner |

Email templates live in `artifacts/api-server/src/lib/emailTemplates.ts`. The sending wrapper is at `artifacts/api-server/src/lib/email.ts`.

---

## SEO

Every public page has a full set of meta tags injected via `react-helmet-async`:

- `<title>` and `<meta name="description">`
- `<link rel="canonical">` — absolute URL
- Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`)
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- JSON-LD structured data (schema.org)

### JSON-LD schemas by page

| Page | Schema type |
|---|---|
| Home | `WebSite` + `SearchAction` (enables Google sitelinks search box) |
| About | `Person` (expertise, memberships, education, location) |
| Services | `ProfessionalService` + `OfferCatalog` |
| Contact | `ContactPage` |
| Articles | `CollectionPage` |
| Portfolio | `CollectionPage` |
| Species | `CollectionPage` |
| Article pages | `Article` (title, author, dates, image, description) |

### Sitemap & RSS

- **Sitemap**: `GET /api/sitemap.xml` — includes all published articles, species, and static pages. Referenced in `robots.txt`.
- **RSS feed**: `GET /api/feed.xml` — RSS 2.0 feed. Autodiscovery `<link>` tag is injected on every page via `Layout.tsx`.
- **robots.txt**: Located at `public/robots.txt`. Blocks `/admin/` and `/api/` from crawlers but explicitly allows `/api/sitemap.xml`.

### OG image

The default Open Graph image is at `public/opengraph.jpg`. Article pages use the article's own cover image when available.

---

## Deployment

This project is designed to deploy on **Replit**.

### Steps

1. Click **Deploy** (or **Publish**) in the Replit header
2. Replit builds and hosts both services behind its proxy
3. Set `SITE_URL` in Secrets to your live domain so email links and the sitemap use the correct URL
4. Set `ALLOWED_ORIGINS` to your domain to lock down CORS

### Production vs development

The API server reads `NODE_ENV` to toggle certain behaviours (logging verbosity, CORS permissiveness). The Replit deployment workflow sets `NODE_ENV=production` automatically.

### Checking production logs

Use the Replit deployment panel to view live server logs. The API uses structured JSON logging via `pino` — logs include request method, URL, status code, and response time for every request.
