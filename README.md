# AI Spend Audit

**Find hidden savings in your team's AI tool spending**

A free web app that analyzes your AI tool stack — Cursor, GitHub Copilot, Claude, ChatGPT, and more — and shows exactly where you can cut costs. No signup required. Results in seconds.

**Live:** [credex-ai-audit-orcin.vercel.app](https://credex-ai-audit-orcin.vercel.app)

---

## Screenshots

| Form | Results | Breakdown |
|---|---|---|
| ![Form](./public/screenshot-form.png) | ![Results](./public/screenshot-results.png) | ![Breakdown](./public/screenshot-breakdown.png) |

---

## Features

### Round 1 — Core MVP

| Feature | Details |
|---|---|
| **8 AI Tools** | Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf |
| **Smart Audit Engine** | 6 rule types with defensible savings logic |
| **AI-Generated Summary** | Personalized insights via Groq API (with fallback) |
| **Shareable URLs** | Base64-encoded links with Open Graph previews |
| **Email Capture** | After showing value — never before |
| **LocalStorage Persistence** | Form data survives page refresh |

### Round 1 — Bonus

PDF export · CSV export · Benchmark mode · Embeddable widget · Referral system · Toast notifications · Loading skeletons

### Round 2 — Re-audit on Pricing Change

| Feature | Details |
|---|---|
| **Audit Storage** | Every audit saved with a full pricing snapshot |
| **Change Detection** | Diffs current prices against last stored snapshot |
| **Email Notifications** | One consolidated email per user when their tools change |
| **Diff View** | `/audit/[id]/compare` — old vs new recommendations side-by-side |
| **One-Click Unsubscribe** | Instantly updates database, no login required |
| **Admin Dashboard** | `/admin/dashboard` — audits, leads, weekly activity, pricing log |
| **Public Pricing Page** | `/pricing-changes` — all detected changes as a growth surface |
| **Scheduled Cron** | Daily detection at 9am via Vercel Cron |

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| AI Summary | Groq API — Llama 3.3 70B |
| Email | Resend |
| Testing | Vitest (10 tests) |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

---

## Quick Start

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/Shagun0622/credex-ai-audit.git
cd credex-ai-audit
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-side only — never expose client-side

# AI + Email
GROQ_API_KEY=
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=              # e.g. https://yourapp.vercel.app
ADMIN_EMAIL=                      # receives pricing change alerts
CRON_SECRET=                      # protects /api/check-pricing-changes
```

---

## API Reference

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/capture-lead` | POST | — | Save email + audit metadata |
| `/api/save-audit` | POST | — | Save full audit to database |
| `/api/generate-summary` | POST | — | Generate AI summary via Groq |
| `/api/check-pricing-changes` | POST | `CRON_SECRET` | Detect changes, notify users |
| `/api/check-pricing-changes` | GET | — | Fetch recent pricing changes |
| `/api/get-audit` | GET | — | Fetch stored audit by ID + email |
| `/api/unsubscribe` | GET | — | One-click unsubscribe |
| `/api/admin/stats` | GET | `ADMIN_PASSWORD` | Dashboard metrics |
| `/api/widget` | GET | — | Embeddable widget script |

---

## How Pricing Detection Works

```
User runs audit
    ↓
Saved to audits table with full pricing snapshot
    ↓
Cron (daily 9am) triggers POST /api/check-pricing-changes
    ↓
API diffs current pricing against last stored snapshot
    ↓
Changes found → log to pricing_changes table
              → group affected audits by email
              → send one consolidated email per user
    ↓
User clicks "See Old vs New Audit →"
    ↓
/audit/[id]/compare re-runs with current prices
Shows changed rows highlighted, savings delta as headline
```

---

## Project Structure

```
credex-ai-audit/
├── app/
│   ├── api/
│   │   ├── admin/stats/          # Dashboard metrics (service role)
│   │   ├── capture-lead/         # Email capture
│   │   ├── check-pricing-changes/# Detection + notifications
│   │   ├── generate-summary/     # AI summary
│   │   ├── get-audit/            # Fetch stored audit
│   │   ├── save-audit/           # Persist audit
│   │   ├── unsubscribe/          # One-click unsubscribe
│   │   └── widget/               # Embeddable widget
│   ├── admin/dashboard/          # Admin analytics page
│   ├── audit/[id]/
│   │   ├── page.tsx              # Results page
│   │   └── compare/page.tsx      # Diff view
│   ├── pricing-changes/          # Public pricing log
│   └── page.tsx                  # Main form
├── lib/
│   ├── audit-engine.ts           # Core savings logic
│   ├── pricing-snapshot.ts       # Current pricing data
│   ├── benchmarks.ts             # Industry benchmarks
│   └── supabase.ts               # Anon client (client-side only)
├── tests/                        # Vitest — 10 tests
├── types/
└── vercel.json                   # Cron schedule
```

---

## Tests

```bash
npm run test          # run all
npm run test:watch    # watch mode
npm run test:ui       # UI mode
```

10 tests covering the audit engine:

```
✓ Business plan → Individual downgrade
✓ Team plan → Plus downgrade
✓ Enterprise overkill detection
✓ Multi-seat optimal detection
✓ Over-reported spend correction
✓ Free tier suggestion
✓ Combined audit calculation
✓ Savings percentage math
✓ Unknown tool handling
✓ High savings (>$500) detection

Test Files  1 passed (1)
     Tests  10 passed (10)  32ms
```

---

## Key Design Decisions

1. **Next.js over CRA** — needed API routes for backend logic and server-side OG image generation for shareable links.

2. **Groq over Anthropic for summaries** — 14,400 free requests/day vs paid tier. Latency ~1.2s vs ~2.5s. Quality comparable for this use case.

3. **Service role key server-side only** — all Supabase writes in API routes use the service role key. The anon key is only used for client-side reads where RLS permits.

4. **URL encoding for share links** — no database read required to view a shared audit. Base64-encoded tool config keeps it stateless and PII-free.

5. **One email per user (not per audit)** — if a user has 3 audits affected by a price change, they get one consolidated email, not three.

---

## Security

- RLS enabled on all Supabase tables
- Service role key never exposed client-side
- Rate limiting on all API endpoints (5 req/min per IP)
- `CRON_SECRET` protects the pricing detection endpoint
- No PII in shareable URLs

---

## Embeddable Widget

```html
<script src="https://credex-ai-audit-orcin.vercel.app/api/widget"></script>
```

---

## Author

Built by **Shagun** for the Credex WebDev Internship — Round 1 + Round 2.

- GitHub: [Shagun0622](https://github.com/Shagun0622)
- Repo: [credex-ai-audit](https://github.com/Shagun0622/credex-ai-audit)
- Live: [credex-ai-audit-orcin.vercel.app](https://credex-ai-audit-orcin.vercel.app)