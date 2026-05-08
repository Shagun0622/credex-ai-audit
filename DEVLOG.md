## Day 1 — 2026-05-07

**Hours worked:** 1-2

**What I did:** Initialized Next.js project with TypeScript, 
Tailwind CSS, and shadcn/ui (Radix + Nova theme). Scaffolded 
project structure and pushed to GitHub.

**What I learned:** shadcn/ui setup flow and component library options.

**Blockers / what I'm stuck on:** None yet.

**Plan for tomorrow:** Build spend input form with all 8 AI tools, 
plan dropdowns, seat count, and localStorage persistence.

*** Day 2 - 2026-05-08 ***
Hours worked: 6

What I did:
- Built complete spend input form with all 8 AI tools
  * Cursor, GitHub Copilot, Claude, ChatGPT
  * Anthropic API, OpenAI API, Gemini, Windsurf
- Added localStorage persistence (form data survives page refresh)
- Created dynamic add/remove tool functionality
- Built separate tabs for AI Tools and Team Info sections
- Added real-time monthly spend calculator
- Implemented form validation (no negative numbers)
- Added auto-save indicator with visual feedback
- Added tooltips with savings tips for each tool
- Created progress bar showing audit completion
- Pushed all code to GitHub repository

What I learned:
- localStorage needs try-catch for JSON parsing errors
- Dynamic forms need unique IDs for each tool
- Form validation prevents bad data before audit
- Git push uploads local code to GitHub cloud

Blockers / what I'm stuck on:
- Need to build audit engine logic for Day 3
- Need to add pricing data to PRICING_DATA.md
- Need to write 5+ tests for audit engine

Plan for tomorrow (Day 3):
- Build audit engine with hardcoded rules
- Calculate savings for each tool
- Write 5+ automated tests
- Setup GitHub Actions CI