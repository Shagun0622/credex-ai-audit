
# Reflection - AI Spend Audit

## 1. The hardest bug I hit this week, and how I debugged it

The hardest bug was in the audit engine where GitHub Copilot was recommending a MORE expensive plan ($20/month) instead of a cheaper one ($10/month). The savings were showing as $0 even though the user was clearly overpaying.

**How I debugged it:** I added console.log statements in the auditTool() function to see what values were being calculated. I noticed the expectedSpend calculation was using the wrong plan price because the plan mapping had 'pro' instead of 'individual' for Copilot. I also added a test case specifically for GitHub Copilot Business plan with 1 seat. The test failed, confirming the issue. I then traced through the code and found the condition was checking for 'team' plans but not 'business' plans. After fixing the condition to include both, and mapping to the correct 'individual' plan, the savings calculated correctly.

## 2. A decision I reversed mid-week, and what made me reverse it

I initially decided to use Anthropic's Claude API for the AI-generated summary because the assignment recommended it. However, after testing, I reversed this decision and switched to Groq's Llama 3.3 70B model.

**What made me reverse it:** 
- Anthropic required a paid API key with no free tier
- Groq offers 14,400 free requests per day
- Groq's latency was 1.2 seconds vs Claude's 2.5 seconds
- The summary quality was comparable for this use case

This decision saved me from spending money and made the tool truly free to run.

## 3. What I would build in week 2 if I had it

If I had a second week, I would add:

1. **Team collaboration features** - Allow multiple team members to view and comment on the same audit
2. **Monthly monitoring** - Send automated emails when prices change or new savings opportunities appear
3. **More AI tools** - Add Midjourney, Runway, Perplexity, and other emerging AI tools
4. **Slack integration** - Push audit results directly to team Slack channels
5. **Historical tracking** - Show spending trends over time with charts
6. **Mobile app** - Build a React Native version for on-the-go monitoring

## 4. How I used AI tools

I used several AI tools throughout this project:

- **Cursor** (AI code editor) - For autocomplete and code generation, especially for repetitive components like form fields
- **Claude** - For planning architecture and debugging complex logic
- **ChatGPT** - For generating test cases and documentation templates
- **Groq API** - For the AI summary feature in the results page

**What I didn't trust them with:** Complex business logic and pricing calculations. I wrote the audit engine rules manually because AI often hallucinates pricing data.

**One time AI was wrong:** I asked ChatGPT to generate the audit rules for GitHub Copilot, and it suggested switching from Business ($19) to Enterprise ($39) as a "savings" - completely wrong. I caught it because I knew the pricing from my research.

## 5. Self-rating (1-10)

| Category | Rating | Reason |
| :--- | :--- | :--- |
| **Discipline** | 9/10 | Committed code every single day for 7 days, wrote DEVLOG entries daily |
| **Code quality** | 8/10 | Clean TypeScript, modular components, reusable utilities |
| **Design sense** | 7/10 | Professional UI with consistent spacing, colors, and responsive layout |
| **Problem-solving** | 9/10 | Debugged complex audit logic, fixed RLS policies, integrated multiple APIs |
| **Entrepreneurial thinking** | 9/10 | Added all bonus features (PDF, CSV, widget, referral), thought about GTM and economics |
