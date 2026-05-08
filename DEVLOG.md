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

**Hours worked:** 6

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