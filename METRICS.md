
# Metrics - AI Spend Audit

## North Star Metric

**"Monthly active audits"** - Number of unique audits completed per month where users saw their savings report.

**Why this metric:**
- Represents real user engagement (they completed the full flow)
- Directly tied to lead generation (each audit is a potential lead)
- Leads to Credex's business goal (more audits = more high-savings leads)
- Easy to measure (one database query)

## 3 Input Metrics That Drive the North Star

### 1. Conversion Rate (Visit → Audit)
**Definition:** % of visitors who complete an audit
**Target:** 60%
**How to improve:** Simplify form, reduce friction, better onboarding

### 2. Viral Coefficient
**Definition:** Average number of new users generated per existing user
**Target:** >1.0
**How to improve:** Better shareable reports, referral incentives, social sharing buttons

### 3. Retention Rate
**Definition:** % of users who run a second audit within 30 days
**Target:** 20%
**How to improve:** Email reminders when prices change, new tool notifications

## What I'd Instrument First

| Event | Properties | Why |
| :--- | :--- | :--- |
| `audit_started` | tool_count, team_size | Track drop-off |
| `audit_completed` | savings_amount, tool_count | North Star metric |
| `email_captured` | email, savings_amount | Lead quality |
| `report_shared` | platform (twitter/linkedin), share_url | Viral growth |
| `consultation_booked` | company_size, savings_amount | Revenue indicator |

**Implementation:** Add analytics tracking (PostHog free tier or Vercel Analytics) to capture these events without collecting PII.

## What Number Triggers a Pivot

| Scenario | Trigger | Pivot Action |
| :--- | :--- | :--- |
| **Low conversion** | <40% visit → audit | Simplify form, reduce to 3 tools minimum |
| **Low viral coefficient** | <0.5 shares per user | Add stronger referral incentives (discounts) |
| **Low high-savings rate** | <5% of audits >$500 | Add more tools, expand API coverage |
| **Low consultation rate** | <5% of high-savings → consult | Add stronger CTA, pre-fill consultation form |
| **CAC > LTV** | Customer acquisition cost > lifetime value | Pivot to organic channels only |

## Dashboard (Weekly Review)

| Metric | Current | Target | Status |
| :--- | :--- | :--- | :--- |
| Weekly audits | (measure after launch) | 1,000 | 🔄 |
| Conversion rate | (measure) | 60% | 🔄 |
| High-savings rate | 10% (built into logic) | 10% | ✅ |
| Share rate | (measure) | 20% | 🔄 |
| Email capture rate | (measure) | 15% | 🔄 |

## Success Criteria for Credex

The tool is successful if:

1. **Within 30 days:** 500 audits, 50 high-savings leads, 5 consultations
2. **Within 90 days:** 5,000 audits, 500 high-savings leads, 50 consultations
3. **Within 12 months:** 60,000 audits, driving $500K+ in attributed revenue

**If any of these fail by 50%, pivot immediately.** If conversion rate is the issue, focus on UX. If high-savings rate is low, focus on adding more tools. If consultations are low, focus on sales follow-up.
