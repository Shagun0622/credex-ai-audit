# AGENTS.md - AI Coding Assistant Instructions

## Project Overview

**AI Spend Audit** - A free web app that helps startups find savings in their AI tool spending.

**Tech Stack:**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS for styling
- Supabase for database
- Groq API for AI summaries
- Resend for emails

## Project Structure

```
credex-ai-audit/
├── app/
│   ├── api/                  # API routes
│   │   ├── capture-lead/     # Email capture endpoint
│   │   ├── generate-summary/ # AI summary endpoint
│   │   └── widget/           # Embeddable widget
│   ├── audit/[id]/           # Results page (dynamic route)
│   └── page.tsx              # Main form page
├── components/               # Reusable React components
├── lib/                      # Utilities and business logic
│   ├── audit-engine.ts       # Core savings calculation
│   ├── benchmarks.ts         # Industry benchmark data
│   ├── referral.ts           # Referral code utilities
│   └── supabase.ts           # Database client
├── tests/                    # Vitest test files
├── types/                    # TypeScript interfaces
└── public/                   # Static assets
```

## Coding Conventions

### TypeScript
- Always use explicit types (avoid `any`)
- Prefer `interface` over `type` for object shapes
- Use `export` for functions/interfaces used outside the file

### React Components
- Use functional components with hooks
- Client components need `'use client'` directive
- Server components are default (no directive needed)

### Imports Order
1. React/Next.js imports
2. Third-party libraries
3. Local imports (`@/components`, `@/lib`, etc.)
4. Type imports
5. CSS imports

### Styling
- Use Tailwind CSS classes
- Custom colors use the palette: navy (`#1A3A6B`), green (`#10b981`), amber (`#f59e0b`)
- Prefer `flex` and `grid` over custom CSS

### State Management
- Use `useState` and `useEffect` for local state
- Use `localStorage` for persisted form data
- No global state management libraries needed

## Environment Variables

Required variables (add to `.env.local`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# APIs
GROQ_API_KEY=
RESEND_API_KEY=
```

**Never commit `.env.local`** - it's already in `.gitignore`.

## Git Guidelines

**Commit message format:**

```
type(scope): description
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting only |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance |

**Example:**
```
feat(audit): add enterprise plan detection logic
```

## Testing

- Tests are in `/tests` using Vitest
- Run tests: `npm test`
- Minimum 10 tests for audit engine
- Each test should be independent

## Common Tasks

### Adding a New AI Tool

1. Add to `TOOLS_META` in `app/page.tsx` (form dropdown)
2. Add pricing to `PRICING` in `lib/audit-engine.ts`
3. Add pricing source to `PRICING_DATA.md`
4. Add test case in `tests/audit-engine.test.ts`

### Adding a New API Route

1. Create folder: `app/api/[route-name]/route.ts`
2. Export HTTP method (`GET`, `POST`, etc.)
3. Add proper error handling
4. Add rate limiting if needed

### Debugging

1. Check browser console (`F12`)
2. Check server terminal for API logs
3. Run `npm run test` to verify logic
4. Check Supabase logs for database issues

## Important Notes for AI

- **Never suggest committing `.env.local`** — it contains secrets
- **Never hardcode API keys** — always use environment variables
- **Audit logic must be hardcoded rules** — no AI for pricing math
- **Email gate AFTER results** — required by assignment spec
- **All tools must be selectable** — 8 tools minimum

## Build & Deploy

- Build: `npm run build` (must pass before deploy)
- Deploy: Vercel (connected to GitHub)
- Preview: Vercel creates preview URLs for PRs

## Useful Commands

```bash
npm run dev      # Start dev server
npm run test     # Run tests
npm run build    # Production build
npm run lint     # Check linting
```