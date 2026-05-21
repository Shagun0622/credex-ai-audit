# Re-audit on Pricing Change System

## Summary

AI tool pricing changes constantly — Cursor raised prices in 2024, Claude added new tiers in 2025, Copilot restructured plans. Stale audits mislead users. This PR adds a full detection-to-notification pipeline so users are automatically alerted when their savings estimates change, without having to re-run audits manually.

---

## Features

### Core (required)

| # | Feature | Route / Location |
|---|---|---|
| 1 | **Audit storage** — every audit saved with full pricing snapshot | `audits` table |
| 2 | **Change detection** — diffs current prices against last stored snapshot | `POST /api/check-pricing-changes` |
| 3 | **Email notifications** — one consolidated email per user (not one per audit) | Resend via detection API |
| 4 | **Diff view** — old vs new recommendations side-by-side with savings delta | `/audit/[id]/compare` |

### Bonus (all 4 above completed first)

| # | Feature | Route / Location |
|---|---|---|
| 5 | **One-click unsubscribe** — updates `leads.unsubscribed` instantly | `GET /api/unsubscribe` |
| 6 | **Admin dashboard** — audits, leads, weekly activity, pricing change log | `/admin/dashboard` |
| 7 | **Public pricing page** — all detected changes, acts as a growth surface | `/pricing-changes` |
| 8 | **Scheduled cron** — daily detection at 9am via Vercel Cron | `vercel.json` |

---

## How it works

```
User runs audit
    ↓
Audit + pricing snapshot saved to Supabase (audits table)
    ↓
Cron (or manual POST) triggers /api/check-pricing-changes
    ↓
API diffs current pricing against last stored snapshot
    ↓
Changes found → log to pricing_changes table
              → fetch all affected audits
              → group by email (one email per user, not per audit)
              → send notification via Resend
    ↓
User clicks "See Old vs New Audit →"
    ↓
/audit/[id]/compare re-runs audit with current prices
Shows side-by-side diff, highlights changed rows, savings delta as headline
```

---

## Database changes

```sql
-- New tables
CREATE TABLE pricing_snapshots ( ... );   -- stores each snapshot for diffing
CREATE TABLE pricing_changes ( ... );     -- audit log of every detected change

-- New columns
ALTER TABLE leads ADD COLUMN unsubscribed boolean DEFAULT false;
ALTER TABLE audits ADD COLUMN opted_out boolean DEFAULT false;
ALTER TABLE audits ADD COLUMN last_notified_at timestamptz;
```

All tables have RLS enabled. API routes use the service role key — anon key is never used server-side.

---

## How to test

```bash
# 1. Run an audit and submit your email at:
https://round-2-reaudit.vercel.app

# 2. Simulate a price change in lib/pricing-snapshot.ts
# e.g. change Cursor Pro: 20 → 35

# 3. Trigger detection
curl -X POST https://round-2-reaudit.vercel.app/api/check-pricing-changes \
  -H "Authorization: Bearer <CRON_SECRET>"

# 4. Check your inbox — notification email should arrive

# 5. Click the compare link in the email → side-by-side diff view

# 6. Check /admin/dashboard for analytics

# 7. Check /pricing-changes for the public change log
```

---

## Checklist

- [x] Audits save to `audits` table with full pricing snapshot
- [x] Detection correctly identifies changed, added, and removed plans
- [x] One consolidated email per user (not one per affected audit)
- [x] Compare page shows old vs new side-by-side with savings delta
- [x] Unsubscribe link updates `leads.unsubscribed` and shows confirmation page
- [x] Admin dashboard shows correct metrics (uses service role key, not anon)
- [x] Public pricing changes page live
- [x] Vercel Cron scheduled at 9am daily
- [x] All new tables have RLS enabled
- [x] Build passes on Vercel

---

## What was cut

- **Click tracking** — needs an additional `email_clicks` table; out of scope
- **Slack notifications** — out of scope for this sprint
- **Real unsubscribe token hashing** — currently email-only; sufficient for demo scale