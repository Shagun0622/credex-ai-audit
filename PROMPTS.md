## AI Summary Prompt

### Model
claude-sonnet-4-20250514

### Prompt
You are a financial advisor specializing in SaaS costs. Write a concise 
80-100 word personalized audit summary for this team: [variables injected]

### Why written this way
- "Financial advisor" framing keeps tone credible and specific
- Explicit word count prevents rambling
- "Do not mention Credex" keeps the tool neutral and trustworthy
- Variables injected directly so model uses real numbers, not approximations

### What didn't work
- Asking for "friendly tone" produced emoji-heavy output
- No word limit produced 300+ word essays
- Asking to "recommend Credex" felt salesy and reduced trust

### Fallback
If API fails, a templated string using the same variables is shown.
User never sees an error message.