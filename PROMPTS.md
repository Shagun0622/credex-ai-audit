# PROMPTS.md

## Overview

This document contains all LLM prompts used in the AI Spend Audit tool, why they were written this way, what was tried and failed, and the fallback strategy.

---

## Where AI Is Used

Only one feature uses AI: the personalized summary paragraph on the results page (~100 words). The audit engine itself uses hardcoded rules — knowing when NOT to use AI is intentional. Financial calculations must be deterministic and auditable.

---

## Production Prompt (Groq — Llama 3.3 70B)

### System Prompt
```
You are a helpful financial analyst specializing in AI tool spending optimization. Be concise and actionable.
```

### User Prompt
```
Generate a VERY SHORT (max 100 words) personalized summary for this team's AI tool audit:

Team size: {teamSize} people
Primary use case: {useCase}
Current monthly spend: ${totalCurrentSpend}
Potential monthly savings: ${totalSavings}
Potential annual savings: ${annualSavings}
Tools audited: {toolCount}
Optimizations found: {optimizationCount}

{conditionalInstruction}

Rules:
- Plain text only. No markdown, no bullet points, no headers.
- Under 100 words.
- Mention exact dollar amounts from the data above.
- End with one clear action the user should take.
```

### Conditional Instruction (injected based on results)

**When savings = $0:**
```
Their spending is already optimized. Reassure them and suggest 
checking back as vendor pricing changes frequently.
```

**When savings < $100:**
```
Give specific, actionable advice. Be encouraging but honest. 
Mention the exact dollar amounts. Focus on the top optimization above.
```

**When savings >= $100:**
```
Highlight the significant opportunity. Be direct and urgent. 
Mention exact monthly and annual savings. If savings exceed $500/month, 
mention that Credex offers discounted AI credits for additional savings.
```

---

## Model Selection

| Model | Latency | Cost per 1K calls | Free Tier |
|-------|---------|-------------------|-----------|
| Groq Llama 3.3 70B | 1.2s | $0 | 14,400 req/day |
| Claude Sonnet | 2.5s | ~$0.15 | No |
| GPT-4o Mini | 2.8s | ~$0.10 | No |
| Gemini 1.5 Flash | 1.8s | ~$0.05 | Limited |

**Selected: Groq Llama 3.3 70B** — fastest response (1.2s), generous free tier (14,400 requests/day), good enough quality for a ~100 word summary. Claude is preferred if Groq rate limits are hit.

---

## Why This Prompt Was Written This Way

**1. Structured input over free-form**
All numbers are injected explicitly. The model cannot hallucinate values it doesn't have — teamSize, totalSavings, etc. are all passed in. This makes the output verifiable.

**2. Hard word limit**
"VERY SHORT (max 100 words)" appears twice — once in caps. Without this, the model writes 300+ word essays that push the per-tool breakdown below the fold on mobile.

**3. Conditional instruction based on savings tier**
A $0 savings user and a $600 savings user need completely different tones. One needs reassurance. The other needs urgency. A single generic prompt produces wrong tone for at least one of them.

**4. No markdown rule**
The summary renders in a plain `<p>` tag. Markdown characters appear raw (`**bold**`, `- list`) and look broken to the user.

**5. Financial analyst persona**
Without a system prompt, the model sometimes responds in first person as the user ("I think I'm spending too much..."). The persona anchors the tone correctly.

---

## What Didn't Work

**Attempt 1 — No system prompt**
The model responded as the user, not as an analyst. Output: *"I think I should switch from ChatGPT to Claude..."*

**Attempt 2 — Allowing markdown**
Users saw raw `**$500 savings**` characters instead of bold text. Explicitly added "No markdown" rule.

**Attempt 3 — No length limit**
Summaries were 200-300 words. Users had to scroll past the summary to reach the per-tool breakdown. Added "max 100 words" and moved it to the top of the instruction.

**Attempt 4 — Same prompt for all savings tiers**
For $0 savings users the model still said "Great savings opportunity!" which erodes trust. For $500+ users it said "you might consider..." which lacks urgency. Conditional instructions fixed this.

**Attempt 5 — Requesting JSON output**
Tried `{ "summary": "...", "urgency": "high" }` format. The model added trailing commas, extra fields, and occasional malformed JSON that crashed the parser. Switched to plain text only.

**Attempt 6 — Passing full tool breakdown to the model**
Sent each tool's name, plan, savings to the model. Prompt exceeded 3,000 tokens, latency jumped to 5s, and the model repeated information already shown in the UI. Now only summary totals are passed.

---

## Fallback Strategy

If the API call fails for any reason (rate limit, timeout, invalid key, network error), the UI falls back to a templated string using the same variables. The user never sees an error.

```typescript
function buildFallback(auditData: any, auditResults: any): string {
  const savingsPercent = auditResults.totalCurrentSpend > 0
    ? Math.round((auditResults.totalSavings / auditResults.totalCurrentSpend) * 100)
    : 0;

  if (auditResults.totalSavings === 0) {
    return `Your ${auditData.teamSize}-person team's AI spend of $${auditResults.totalCurrentSpend}/month 
is well-configured for ${auditData.useCase} work. No immediate savings found across your 
${auditData.tools.length} tools. Revisit this audit when you add new tools or your team grows.`;
  }

  if (auditResults.totalSavings < 100) {
    return `We found $${auditResults.totalSavings}/month in savings (${savingsPercent}% of your budget) 
for your ${auditData.teamSize}-person ${auditData.useCase} team. Adjusting 
${auditResults.results.filter((r: any) => r.savings > 0).length} tools saves 
$${auditResults.annualSavings}/year. Start with the highest-saving recommendation above.`;
  }

  return `Your ${auditData.teamSize}-person team is overspending by $${auditResults.totalSavings}/month — 
that is $${auditResults.annualSavings}/year. We found 
${auditResults.results.filter((r: any) => r.savings > 0).length} optimizations across 
${auditData.tools.length} tools. Act on the top recommendation this week to start saving immediately.`;
}
```

---

## Prompt Version History

| Version | Change | Reason |
|---------|--------|--------|
| v1 | No system prompt, no limit | Initial test — failed |
| v2 | Added financial analyst system prompt | Better tone |
| v3 | Added "max 100 words" | Prevented long essays |
| v4 | Added "no markdown" rule | Fixed raw character rendering |
| v5 | Added conditional instructions | Different tone per savings tier |
| v6 | Removed tool-level detail from input | Faster, less repetitive output |
| v7 (current) | Switched to Groq for speed | 1.2s avg vs 2.5s on Claude |

---

## Future Improvements

- Pass top 1-2 tool names with highest savings for more specific advice
- A/B test urgency levels on the $100-500 savings tier
- Add industry benchmarks ("teams your size average $X/developer")
- Multi-language support based on browser locale