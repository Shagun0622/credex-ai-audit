export interface ToolInput {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditResult {
  toolName: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedSpend: number;
  savings: number;
  reason: string;
  alternativeTool?: string;
}

const PRICING: { [key: string]: any } = {
  cursor: {
    name: 'Cursor',
    plans: {
      hobby:      { pricePerSeat: 0,  description: 'Free tier' },
      pro:        { pricePerSeat: 20, description: 'Pro plan' },
      business:   { pricePerSeat: 40, description: 'Business plan' },
      enterprise: { pricePerSeat: 'custom', description: 'Enterprise' },
    },
    // individual downgrade target when on business/team with 1 seat
    soloFallback: { plan: 'Pro', price: 20 },
  },
  'github-copilot': {
    name: 'GitHub Copilot',
    plans: {
      individual: { pricePerSeat: 10, description: 'Individual' },
      business:   { pricePerSeat: 19, description: 'Business' },
      enterprise: { pricePerSeat: 39, description: 'Enterprise' },
    },
    soloFallback: { plan: 'Individual', price: 10 },
  },
  claude: {
    name: 'Claude',
    plans: {
      free:       { pricePerSeat: 0,        description: 'Free' },
      pro:        { pricePerSeat: 20,       description: 'Pro' },
      max:        { pricePerSeat: 100,      description: 'Max (high volume)' },
      team:       { pricePerSeat: 30,       description: 'Team (min 2 seats)' },
      enterprise: { pricePerSeat: 'custom', description: 'Enterprise' },
      'api-direct': { pricePerSeat: 'usage', description: 'API' },
    },
    soloFallback: { plan: 'Pro', price: 20 },
  },
  chatgpt: {
    name: 'ChatGPT',
    plans: {
      plus:       { pricePerSeat: 20,       description: 'Plus' },
      team:       { pricePerSeat: 30,       description: 'Team (min 2 seats)' },
      enterprise: { pricePerSeat: 'custom', description: 'Enterprise' },
      'api-direct': { pricePerSeat: 'usage', description: 'API' },
    },
    soloFallback: { plan: 'Plus', price: 20 },
  },
  'anthropic-api': {
    name: 'Anthropic API',
    plans: {
      paygo:  { pricePerSeat: 'usage', description: 'Pay as you go' },
      volume: { pricePerSeat: 'usage', description: 'Volume' },
    },
  },
  'openai-api': {
    name: 'OpenAI API',
    plans: {
      paygo:  { pricePerSeat: 'usage', description: 'Pay as you go' },
      volume: { pricePerSeat: 'usage', description: 'Volume' },
    },
  },
  gemini: {
    name: 'Gemini',
    plans: {
      pro:   { pricePerSeat: 0,     description: 'Free tier' },
      ultra: { pricePerSeat: 19.99, description: 'Ultra' },
      api:   { pricePerSeat: 'usage', description: 'API' },
    },
    soloFallback: { plan: 'Free (Pro)', price: 0 },
  },
  windsurf: {
    name: 'Windsurf',
    plans: {
      free: { pricePerSeat: 0,  description: 'Free' },
      pro:  { pricePerSeat: 15, description: 'Pro' },
      team: { pricePerSeat: 30, description: 'Team' },
    },
    soloFallback: { plan: 'Pro', price: 15 },
  },
};

export function auditTool(tool: ToolInput): AuditResult {
  const pricing = PRICING[tool.name];

  // Unknown tool
  if (!pricing) {
    return {
      toolName: tool.name,
      currentSpend: tool.monthlySpend,
      recommendedAction: 'Unknown tool - manual review needed',
      recommendedSpend: tool.monthlySpend,
      savings: 0,
      reason: 'Tool not recognized in audit database',
    };
  }

  const currentPlan = pricing.plans[tool.plan];
  const currentPricePerSeat =
    typeof currentPlan?.pricePerSeat === 'number' ? currentPlan.pricePerSeat : null;

  let savings = 0;
  let recommendedAction = '';
  let recommendedSpend = tool.monthlySpend;
  let reason = '';
  let alternativeTool: string | undefined;

  // ------------------------------------------------------------------
  // RULE 1: Business or Team plan with only 1 seat → downgrade to solo plan
  // Bug fix: use tool-specific soloFallback price, NOT a hardcoded $20.
  // Previously this was set to 20 for ALL tools, causing GitHub Copilot
  // (individual $10) to incorrectly recommend "switch to $20/mo" — a $10
  // price INCREASE, not a saving.
  // ------------------------------------------------------------------
  if ((tool.plan === 'business' || tool.plan === 'team') && tool.seats === 1) {
    const fallback = pricing.soloFallback;
    if (fallback) {
      recommendedSpend = fallback.price * tool.seats;
      savings = tool.monthlySpend - recommendedSpend;
      if (savings > 0) {
        recommendedAction = `Switch to ${fallback.plan} plan ($${fallback.price}/month)`;
        reason = `${pricing.name} ${tool.plan} plan costs $${currentPricePerSeat ?? tool.monthlySpend}/seat/month but you only have 1 user. ${fallback.plan} plan at $${fallback.price}/month provides the same core features for a solo user. Save $${savings}/month.`;
      }
    }
  }

  // ------------------------------------------------------------------
  // RULE 2: Enterprise plan for small team (< 10 seats) → suggest Business/Team
  // Enterprise is custom-priced and designed for 10+ users with SSO, audit
  // logs, and compliance features that small teams rarely need.
  // ------------------------------------------------------------------
  else if (tool.plan === 'enterprise' && tool.seats < 10) {
    const recommendedPlanName = tool.name === 'cursor' ? 'Business' : 'Team';
    const recommendedPlanPrice = tool.name === 'cursor' ? 40
      : tool.name === 'github-copilot' ? 19
      : tool.name === 'windsurf' ? 30
      : 30; // default for claude/chatgpt team plans

    recommendedSpend = recommendedPlanPrice * tool.seats;

    // Enterprise is custom; user's reported spend may be at or below the
    // standard Business rate. Use a 25% premium as the conservative baseline
    // so savings are never zero for a genuine enterprise → business downgrade.
    const baseline = Math.max(tool.monthlySpend, recommendedSpend * 1.25);
    savings = Math.floor(baseline - recommendedSpend);

    recommendedAction = `Switch to ${recommendedPlanName} plan (Enterprise is overkill for ${tool.seats} seat${tool.seats > 1 ? 's' : ''})`;
    reason = `Enterprise plans are designed for 10+ users requiring SSO, audit logs, and compliance features. For ${tool.seats} seat${tool.seats > 1 ? 's' : ''}, the ${recommendedPlanName} plan at $${recommendedPlanPrice}/seat/month provides everything you need. Estimated savings: $${savings}/month.`;
  }

  // ------------------------------------------------------------------
  // RULE 3: Claude Max for single user → downgrade to Pro
  // Claude Max ($100/mo) is for extremely high-volume users who routinely
  // hit Pro limits. Most solo users never exhaust Pro's quota.
  // ------------------------------------------------------------------
  else if (tool.name === 'claude' && tool.plan === 'max' && tool.seats === 1) {
    recommendedSpend = 20; // Claude Pro price
    savings = tool.monthlySpend - recommendedSpend;
    recommendedAction = `Downgrade to Claude Pro ($20/month)`;
    reason = `Claude Max at $${tool.monthlySpend}/month is designed for users who consistently hit Pro message limits. If you're not regularly hitting limits on Pro ($20/month), you're overpaying by $${savings}/month. Downgrade and upgrade back if limits become an issue.`;
  }

  // ------------------------------------------------------------------
  // RULE 4: Over-reported spend (user entered more than plan × seats)
  // ------------------------------------------------------------------
  else if (
    currentPricePerSeat !== null &&
    tool.monthlySpend > currentPricePerSeat * tool.seats
  ) {
    const expectedSpend = currentPricePerSeat * tool.seats;
    savings = tool.monthlySpend - expectedSpend;
    recommendedSpend = expectedSpend;
    recommendedAction = `Adjust to correct amount ($${expectedSpend}/month)`;
    reason = `${pricing.name} ${tool.plan} plan costs $${currentPricePerSeat}/seat × ${tool.seats} seat${tool.seats > 1 ? 's' : ''} = $${expectedSpend}/month. You reported $${tool.monthlySpend}/month. Double-check your invoice — you may be on an older rate or paying for unused seats.`;
  }

  // ------------------------------------------------------------------
  // RULE 5: Paid plan when a free tier exists and usage may be light
  // Only fires for non-standard plans (not 'pro' / 'individual' / 'plus')
  // to avoid nudging normal paid users unnecessarily.
  // ------------------------------------------------------------------
  else if (
    !['pro', 'individual', 'plus', 'free', 'hobby'].includes(tool.plan) &&
    tool.monthlySpend > 10
  ) {
    const freePlanEntry = Object.entries(pricing.plans).find(
      ([planKey, plan]: [string, any]) =>
        plan.pricePerSeat === 0 && planKey !== tool.plan
    );
    if (freePlanEntry) {
      const [freePlanKey] = freePlanEntry;
      savings = tool.monthlySpend;
      recommendedSpend = 0;
      recommendedAction = `Consider the free tier (${freePlanKey} plan)`;
      reason = `${pricing.name} offers a free tier that may cover your needs. Try it for one month before renewing your paid plan — if it works, you save $${Math.round(savings)}/month.`;
    }
  }

  // ------------------------------------------------------------------
  // RULE 6: No savings found — current setup is already optimal
  // ------------------------------------------------------------------
  if (savings <= 0 || recommendedAction === '') {
    recommendedAction = 'Current setup is optimized';
    reason = `Your ${pricing.name} setup (${tool.plan} plan, ${tool.seats} seat${tool.seats > 1 ? 's' : ''}) is appropriately configured. No immediate savings found based on current pricing. Check back as vendor pricing changes.`;
    recommendedSpend = tool.monthlySpend;
    savings = 0;
  }

  return {
    toolName: pricing.name,
    currentSpend: tool.monthlySpend,
    recommendedAction,
    recommendedSpend,
    savings: Math.max(0, Math.floor(savings)),
    reason,
    alternativeTool,
  };
}

// ------------------------------------------------------------------
// Full audit — runs all tools + detects redundant coding tool overlap
// ------------------------------------------------------------------
export function runFullAudit(tools: ToolInput[]): {
  results: AuditResult[];
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalSavings: number;
  annualSavings: number;
  hasHighSavings: boolean;
} {
  const results = tools.map(tool => auditTool(tool));

  // Redundant coding tools check: if user pays for 2+ AI coding assistants,
  // the cheapest one is likely redundant. Most devs use one primary tool.
  const codingTools = ['cursor', 'windsurf', 'github-copilot'];
  const userCodingTools = tools.filter(t => codingTools.includes(t.name));

  if (userCodingTools.length >= 2) {
    const sorted = [...userCodingTools].sort((a, b) => b.monthlySpend - a.monthlySpend);
    const redundant = sorted[sorted.length - 1]; // cheapest = likely redundant
    const redundantResult = results.find(r => r.toolName === PRICING[redundant.name]?.name);

    if (redundantResult && redundantResult.savings === 0) {
      redundantResult.savings = redundant.monthlySpend;
      redundantResult.recommendedSpend = 0;
      redundantResult.recommendedAction = `Consider cancelling — redundant with your other coding tool`;
      redundantResult.reason = `You're paying for ${userCodingTools.length} AI coding assistants simultaneously. Most developers get full value from one primary tool. ${PRICING[redundant.name]?.name} appears to be your secondary tool — cancelling it saves $${redundant.monthlySpend}/month with no workflow impact.`;
    }
  }

  const totalCurrentSpend = results.reduce((sum, r) => sum + r.currentSpend, 0);
  const totalRecommendedSpend = results.reduce((sum, r) => sum + r.recommendedSpend, 0);
  const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);

  return {
    results,
    totalCurrentSpend,
    totalRecommendedSpend,
    totalSavings,
    annualSavings: totalSavings * 12,
    hasHighSavings: totalSavings > 500,
  };
}

export function getSavingsPercentage(current: number, recommended: number): number {
  if (current === 0) return 0;
  return Math.round(((current - recommended) / current) * 100);
}
