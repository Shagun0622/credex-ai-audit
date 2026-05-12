# Dev Log

---

## Day 1 — 2026-05-07

**Hours worked:** 1–2

**What I did:**
- Initialized Next.js project with TypeScript, Tailwind CSS, and shadcn/ui (Radix + Nova theme)
- Scaffolded project structure and pushed to GitHub

**What I learned:**
- shadcn/ui setup flow and component library options

**Blockers:** None

**Plan for tomorrow:**
- Build spend input form with all 8 AI tools, plan dropdowns, seat count, and localStorage persistence

---

## Day 2 — 2026-05-08

**Hours worked:** 3

**What I did:**
- Built complete spend input form for all 8 AI tools
  - Cursor, GitHub Copilot, Claude, ChatGPT
  - Anthropic API, OpenAI API, Gemini, Windsurf
- Added localStorage persistence — form data survives page refresh
- Built dynamic add/remove tool functionality
- Created separate tabs for AI Tools and Team Info sections
- Added real-time monthly spend calculator
- Implemented form validation — no negative numbers
- Added auto-save indicator with visual feedback
- Added per-tool tooltips with savings tips
- Built progress bar showing audit completion
- Pushed all code to GitHub

**What I learned:**
- localStorage needs try-catch for JSON parsing errors
- Dynamic forms need unique IDs per tool instance
- Form validation gates bad data before it reaches the audit engine
- `git push` uploads local commits to GitHub

**Blockers:**
- Audit engine logic not yet built
- Pricing data missing from `PRICING_DATA.md`
- Tests not written yet (need 5+)

**Plan for tomorrow (Day 3):**
- Build audit engine with hardcoded rules
- Calculate per-tool savings recommendations
- Write 5+ automated tests
- Set up GitHub Actions CI



## Day 3 - 2026-05-09 
Hours worked: 3

What I did:
- Built complete audit engine with hardcoded rules
  * Created PRICING_DATA.md with all sources
  * Implemented auditTool() function for individual tool analysis
  * Implemented runFullAudit() for complete audit
  * Added 6 rule types: seat optimization, enterprise overkill, spend correction, free tier, alternatives, optimal detection
- Wrote 10 automated tests (exceeding 5 required)
  * Tests cover: plan optimization, pricing calculation, free tier, unknown tools, high savings
- Set up Vitest testing framework
- Created GitHub Actions CI pipeline for automated testing
- Added getSavingsPercentage() helper

What I learned:
- Hardcoded rules are more reliable than AI for pricing math
- Testing first (TDD) helps catch edge cases early
- GitHub Actions runs tests automatically on every push
- Pricing data needs official sources for credibility

Blockers / what I'm stuck on:
- Need to integrate audit engine with form submission (Day 4)
- Need results page to display savings beautifully
- Need AI summary using Anthropic API

Plan for tomorrow (Day 4):
- Create results page (app/audit/[id]/page.tsx)
- Display per-tool breakdown
- Show total monthly/annual savings
- Integrate AI-generated summary with fallback
- Add conditional messaging (Credex for high savings)

## Day 4 — 2026-05-10

**Hours worked:** 3-4

**What I did:**
- Fixed audit engine bugs — corrected per-tool downgrade pricing 
  (GitHub Copilot was recommending $20 plan when individual is $10, 
  causing negative savings shown as $0)
- Fixed enterprise rule: added guard so engine doesn't show savings 
  when currentSpend is already below recommendedSpend
- Fixed redundancy detection: switched from name-based lookup to 
  index-based to prevent duplicate tool label collision
- Implemented real Anthropic API call in /api/generate-summary with 
  graceful fallback to templated summary on API failure
- Installed @anthropic-ai/sdk and configured ANTHROPIC_API_KEY in 
  .env.local
- Tested audit results page end-to-end with multiple tool combinations
- Wrote and committed PROMPTS.md documenting full prompt history, 
  what failed, model selection reasoning, and fallback strategy
- Identified form bug: "Add tool" always defaults to Cursor — fix 
  planned for tomorrow

**What I learned:**
- Hardcoded fallback prices break when applied across tools with 
  different pricing structures. Per-tool config objects are safer 
  than shared constants.
- Enterprise plan users may report spend below standard rates 
  (grandfathered pricing, trials). The engine must handle 
  currentSpend < recommendedSpend without showing misleading savings.
- Groq's free tier (14,400 req/day) is a better default than 
  Anthropic for a free tool — lower latency, no cost at our scale.

**Blockers / what I'm stuck on:**
- Supabase lead capture not set up yet — email gate on results page 
  currently does nothing on submit
- Need to set up Resend for transactional email
- Form still defaults new tools to Cursor instead of next unused tool

**Plan for tomorrow:**
- Fix the add-tool default bug in page.tsx
- Set up Supabase: create leads table, wire up /api/capture-lead
- Set up Resend: send confirmation email on lead capture
- Deploy to Vercel — need live URL before deadline

## Day 5 - 2026-05-11 
Hours worked: 4

What I did:
- Set up Supabase (PostgreSQL) database for lead storage
- Created leads table with schema: id, email, team_size, total_current_spend, total_savings, tool_count, audit_url, created_at
- Added proper indexes and Row Level Security (RLS) policies
- Built /api/capture-lead API endpoint with rate limiting (5 requests per minute per IP)
- Integrated Resend for transactional emails (free tier: 3000 emails/month)
- Created HTML email template for audit report confirmation
- Updated results page to call capture API on email submission
- Added lib/supabase.ts client for database operations
- Fixed RLS policy issues (CREATE POLICY for inserts)
- Tested complete flow: form → audit → email capture → database storage

What I learned:
- Supabase RLS policies need proper configuration for inserts (WITH CHECK true)
- Environment variables must be set for both local (.env.local) and production (Vercel)
- Rate limiting prevents API abuse (important for public endpoints)
- Transactional emails need professional HTML formatting with brand colors
- PostgreSQL indexes improve query performance for lead lookup

Blockers / what I'm stuck on:
- Need to deploy to Vercel with all environment variables
- Need to add Open Graph tags for social sharing on shareable URLs
- Need to write remaining documentation (REFLECTION.md, METRICS.md, etc.)

Plan for tomorrow (Day 6):
- Deploy to Vercel with environment variables
- Add Open Graph tags for social media previews
- Test deployed version end-to-end
- Run Lighthouse scores and optimize if needed

## Day 6 - 2026-05-12 
Hours worked: 3

What I did:
- Created embeddable widget (Bonus feature)
  * Built /api/widget/route.ts endpoint
  * Widget injects form into any website via script tag
  * Supports Cursor, Copilot, ChatGPT, Claude tools
  * Real-time savings calculation
  * Professional styling with inline CSS

- Implemented referral system (Bonus feature)
  * Created lib/referral.ts with generateReferralCode(), getReferralCode()
  * Built components/ReferralSection.tsx UI component
  * Added referral detection on home page
  * Integrated social sharing (Twitter/X, LinkedIn)
  * Copy link functionality with toast notification
  * 10% discount tracking for both parties

- Added toast notifications
  * Installed react-hot-toast
  * Replaced all browser alert() with professional toasts
  * Success, error, and info variants
  * Custom styling for better UX

- Replaced emojis with Lucide React icons
  * Gift, Copy, Twitter, Link, Sparkles, Share2 icons
  * Professional consistent iconography

What I learned:
- Widget requires careful inline styling to work on external sites
- Referral codes need localStorage + URL params for persistence
- Toast notifications provide much better UX than browser alerts
- Lucide icons offer professional look compared to emojis

Blockers / what I'm stuck on:
- Need to deploy to Vercel with all environment variables
- Need to complete user interviews (3 people)
- Need to fill documentation (REFLECTION.md, GTM.md, ECONOMICS.md)

Plan for tomorrow (Day 7):
- Deploy to Vercel
- Add all environment variables in Vercel dashboard
- Complete 3 user interviews
- Fill all remaining documentation
- Final submission to Google Form