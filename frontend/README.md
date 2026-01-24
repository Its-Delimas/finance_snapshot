# Finance Snapshot - AI generated

A lightweight, privacy‑focused personal finance dashboard built with the MERN stack. Finance Snapshot helps users track cash flow, categorize transactions, and see quick monthly summaries — perfect as a portfolio piece to show full‑stack skills and as a small product that can be turned into a paid Pro tier.

Repository name : `finance-snapshot`

Goals

- Showcase MERN skills (auth, data modeling, aggregation, CSV import, charts, background jobs).
- Ship a mobile-first, privacy-aware MVP fast.
- Provide easy upgrade paths for monetization (multi-account sync, advanced reports, CSV export).

MVP (must-have)

- Email/phone signup + basic auth (JWT)
- Manual transaction creation + CSV import/export
- Categories & tagging
- Monthly summary dashboard with charts (income, expenses, net)
- Simple recurring transactions
- Basic settings: currency (KES default), timezone

Why this project

- Demonstrates backend aggregation queries and performant read patterns with MongoDB.
- Shows frontend skills with React/Next.js and charting libraries.
- Integrates common product concerns: file upload, background processing, auth, deployment.
- Easy to demo and iterate; good for client acquisition or small paid features.

Tech stack

- Frontend: Next.js (React) + Tailwind CSS (mobile-first)
- Backend: Node.js + Express (REST) or Next.js API routes (you can choose serverful or serverless)
- Database: MongoDB Atlas
- Background jobs: BullMQ + Redis (optional, for heavy imports/processing)
- Storage: S3 / DigitalOcean Spaces (for uploaded CSVs)
- Auth: JWT with refresh tokens (or Auth0 if you prefer hosted)
- Charts: Chart.js / Recharts
- Payments (optional Pro features): Stripe (with support for M-Pesa connector if you later add Kenyan payments)
- SMS / Notifications (optional): Africa's Talking / Twilio
- CI/CD: GitHub Actions, deploy frontend to Vercel, API to Render/Fly.io/Railway

Repo structure (suggested)

- /web — Next.js frontend
- /api — Express backend (or /api in Next.js for serverless APIs)
- /packages — shared libs (ui-components, utils, api-client)
- /docs — design decisions, API docs, onboarding checklist
- /scripts — local dev helpers, seed scripts

Quick start (local)

1. Clone the repo
2. Copy environment file templates:
   - cp .env.example .env
3. Start services (choose serverful or serverless approach)

If using Node/Express API + Next frontend:

- Start MongoDB (or use Atlas)
- Start Redis (optional)
- Start backend:
  - cd api && npm install && npm run dev
- Start frontend:
  - cd web && npm install && npm run dev

Environment variables (example)

- MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/finance-snapshot?retryWrites=true&w=majority
- NEXT_PUBLIC_API_URL=http://localhost:4000/api
- JWT_SECRET=replace_with_strong_secret
- JWT_REFRESH_SECRET=replace_with_strong_refresh_secret
- SMTP_HOST=smtp.example.com
- SMTP_PORT=587
- SMTP_USER=you@example.com
- SMTP_PASS=yourpassword
- REDIS_URL=redis://localhost:6379
- S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
- S3_BUCKET=finance-snapshot
- S3_KEY=...
- S3_SECRET=...
- NODE_ENV=development
- SENTRY_DSN=

API overview (REST examples)

- POST /api/auth/signup — { email, phone, password } -> creates user
- POST /api/auth/login — { email, password } -> { accessToken, refreshToken }
- GET /api/me — user profile
- GET /api/transactions?start=YYYY-MM-DD&end=YYYY-MM-DD&category= — list + filters
- POST /api/transactions — create transaction { date, amount, currency, description, category, tags }
- POST /api/import/csv — upload CSV file (background process to parse)
- GET /api/reports/monthly?year=YYYY&month=MM — aggregated summary (income/expenses/net, by category)
- GET /api/categories — list categories
- POST /api/categories — add custom category

Data model (high level)

- User
  - \_id, email, phone, hashedPassword, preferences (currency, timezone), createdAt
- Account (optional — multiple bank accounts / wallets)
  - \_id, userId, name, type, last4, metadata
- Transaction
  - \_id, userId, accountId, date, amount (stored in cents), currency, description, categoryId, tags[], importedFrom, merchant, createdAt
- Category
  - \_id, userId, name, type (income|expense), color
- ImportJob (for CSV imports)
  - \_id, userId, status (pending|processing|done|failed), fileUrl, importedCount, errors[]

Frontend highlights

- Mobile-first public dashboard + signed-in dashboard
- Transaction list with quick add and inline edit
- Monthly summary with charts (income vs expenses, category breakdown, trend line)
- CSV import UI with mapping step (map CSV columns to transaction fields)
- Simple onboarding flow and a demo dataset

CSV import notes

- Accept common bank export formats (CSV)
- Present mapping UI on first import: date column, amount column (detect debit/credit), description column
- Run import in background (BullMQ) and notify user when done for large files

Security & privacy

- Store only minimum personal data. Consider allowing users to delete their data.
- Sanitize CSV input; validate numeric fields and dates.
- Hash passwords with bcrypt / argon2. Use HTTPS in production.
- Rate limit auth endpoints and file uploads.

Deployment tips

- Frontend: Vercel is ideal for Next.js — easy previews + automatic deploys from branches.
- API: Render / Railway / Fly.io for a small persistent server to handle webhooks and background jobs; or use serverless functions if you prefer.
- Database: MongoDB Atlas (start with free tier). Use a separate DB user for the app.
- Redis: Upstash for serverless Redis or small Render/Railway instance for BullMQ.
- Storage: DigitalOcean Spaces is cost-effective in Kenya timezone; S3 also works.

Monetization ideas

- Freemium: Free tier with limits (e.g., 500 transactions / 6 months of data)
- Pro: CSV export, multi-account sync, custom reports (monthly/annual), PDF reports for accountants
- One-off: Setup fee for migrating bank CSVs or bespoke reporting
- White‑label / consultancy: Offer a setup + recurring hosting for small local accountants

Roadmap (4-week MVP cadence)
Week 1 — Plan & skeleton

- Create repo structure, auth, DB models, basic UI shell, seed demo data

Week 2 — Core features

- Transactions CRUD, categories, CSV import API and mapping UI (simple sync)

Week 3 — Dashboard & charts

- Aggregation endpoints, monthly summary, charting UI, mobile UX polish

Week 4 — Polish & launch

- CSV export, email confirmations, small landing page, deploy to Vercel/Render, invite beta testers

Monitoring & analytics

- Sentry for error tracking
- Basic usage metrics: unique users, monthly active users, transactions imported, CSV imports processed
- Simple product analytics: conversion from signup -> add first transaction

Testing

- Unit tests for critical backend aggregation functions
- Integration tests for import pipeline (mock files)
- E2E smoke tests for signup -> add transaction -> view dashboard

Contributing

- Please open issues for feature requests or bugs.
- Follow the code style (ESLint + Prettier). Tests required for critical paths.
- Add a clear PR description and link the issue you’re resolving.

Sample README badges (optional)

- Build / CI status
- Coverage
- License

License

- MIT (or pick a license you prefer)

Contact / maintainer

- delimas-source (GitHub) — include email or link as you prefer

Appendix: Quick dev checklist

- [ ] Create cluster on MongoDB Atlas and add connection string
- [ ] Add .env values and run `npm run dev` (api & web)
- [ ] Seed demo data and verify dashboard shows sample charts
- [ ] Test CSV import with one exported bank CSV
- [ ] Deploy frontend to Vercel & API to Render, set production env vars

If you want, I can:

- Scaffold the repo layout (web + api + packages) with working auth, transaction model, and a sample dashboard.
- Provide a Postman collection for the API and a small demo CSV for testing imports.
- Generate landing page copy and a simple pricing page for the Pro tier.

Which one do you want next — scaffolded repo (code) or landing page + pricing copy?
