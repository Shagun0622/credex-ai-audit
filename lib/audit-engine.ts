export interface ToolPricing {
  name: string;
  plans: {
    [key: string]: {
      pricePerSeat: number | 'custom' | 'usage';
      description: string;
      recommendedSeats?: number;
      alternative?: string;
    };
  };
  alternatives?: {
    name: string;
    savingsPercent: number;
    condition?: string;
  }[];
}

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

// Define pricing for each tool
const PRICING: { [key: string]: ToolPricing } = {
  cursor: {
    name: 'Cursor',
    plans: {
      hobby: { pricePerSeat: 0, description: 'Free tier with basic features' },
      pro: { pricePerSeat: 20, description: 'Pro plan for individual developers' },
      business: { pricePerSeat: 40, description: 'Business plan with team features' },
      enterprise: { pricePerSeat: 'custom', description: 'Enterprise custom pricing' },
    },
    alternatives: [
      { name: 'VS Code + Copilot', savingsPercent: 50, condition: 'Basic coding needs' },
    ],
  },
  'github-copilot': {
    name: 'GitHub Copilot',
    plans: {
      individual: { pricePerSeat: 10, description: 'Individual developer' },
      business: { pricePerSeat: 19, description: 'Business with license management' },
      enterprise: { pricePerSeat: 39, description: 'Enterprise with security' },
    },
    alternatives: [
      { name: 'Cursor Pro', savingsPercent: 0, condition: 'Similar pricing' },
      { name: 'Codeium Free', savingsPercent: 100, condition: 'If budget constrained' },
    ],
  },
  claude: {
    name: 'Claude',
    plans: {
      free: { pricePerSeat: 0, description: 'Free tier' },
      pro: { pricePerSeat: 20, description: 'Pro individual plan' },
      max: { pricePerSeat: 50, description: 'Max heavy usage plan' },
      team: { pricePerSeat: 30, description: 'Team plan (minimum 2 seats)' },
      enterprise: { pricePerSeat: 'custom', description: 'Enterprise plan' },
      'api-direct': { pricePerSeat: 'usage', description: 'API pay-as-you-go' },
    },
    alternatives: [
      { name: 'ChatGPT Plus', savingsPercent: 0, condition: 'Similar capability' },
    ],
  },
  chatgpt: {
    name: 'ChatGPT',
    plans: {
      plus: { pricePerSeat: 20, description: 'Plus individual plan' },
      team: { pricePerSeat: 30, description: 'Team plan (minimum 2 seats)' },
      enterprise: { pricePerSeat: 'custom', description: 'Enterprise plan' },
      'api-direct': { pricePerSeat: 'usage', description: 'API pay-as-you-go' },
    },
    alternatives: [
      { name: 'Claude Pro', savingsPercent: 0, condition: 'Similar pricing' },
      { name: 'Gemini Free', savingsPercent: 100, condition: 'If basic chat only' },
    ],
  },
  'anthropic-api': {
    name: 'Anthropic API',
    plans: {
      paygo: { pricePerSeat: 'usage', description: 'Pay as you go - $3-15 per million tokens' },
      volume: { pricePerSeat: 'usage', description: 'Volume discounts available' },
    },
  },
  'openai-api': {
    name: 'OpenAI API',
    plans: {
      paygo: { pricePerSeat: 'usage', description: 'Pay as you go - $2.5-10 per million tokens' },
      volume: { pricePerSeat: 'usage', description: 'Volume discounts available' },
    },
  },
  gemini: {
    name: 'Gemini',
    plans: {
      pro: { pricePerSeat: 0, description: 'Free tier with limitations' },
      ultra: { pricePerSeat: 19.99, description: 'Ultra advanced model' },
      api: { pricePerSeat: 'usage', description: 'API pay-as-you-go' },
    },
    alternatives: [
      { name: 'Claude API', savingsPercent: 20, condition: 'For complex reasoning' },
    ],
  },
  windsurf: {
    name: 'Windsurf',
    plans: {
      free: { pricePerSeat: 0, description: 'Free tier' },
      pro: { pricePerSeat: 15, description: 'Pro individual plan' },
      team: { pricePerSeat: 30, description: 'Team plan' },
    },
    alternatives: [
      { name: 'Cursor Pro', savingsPercent: -33, condition: 'Cursor has more features' },
    ],
  },
};

// Main audit function
export function auditTool(tool: ToolInput): AuditResult {
  const pricing = PRICING[tool.name];
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
  const currentPricePerSeat = typeof currentPlan?.pricePerSeat === 'number'
    ? currentPlan.pricePerSeat
    : 0;

  const expectedSpend = currentPricePerSeat * tool.seats;
  let savings = 0;
  let recommendedAction = '';
  let recommendedSpend = tool.monthlySpend;
  let reason = '';
  let alternativeTool: string | undefined;

  // Rule 1: Check if overpaying based on seats (Team/Business plan for 1 user)
  if ((tool.plan === 'business' || tool.plan === 'team') && tool.seats === 1) {
    const betterPlan = tool.plan === 'business' ? 'Pro' : 'Plus/Pro';
    const betterPlanPrice = 20;
    recommendedSpend = betterPlanPrice * tool.seats;
    savings = tool.monthlySpend - recommendedSpend;
    recommendedAction = `Switch to ${betterPlan} plan for single user`;
    reason = `${pricing.name} ${betterPlan} plan costs $${betterPlanPrice}/seat/month vs $${currentPricePerSeat}/seat/month for ${tool.plan}. Since you have only ${tool.seats} user, the individual plan is more cost-effective.`;
  }

  // Rule 2: Check if Enterprise plan for small team (<10 seats).
  // FIX: Enterprise plans use custom pricing, so the user's reported monthlySpend may
  // coincidentally equal the recommended plan's cost (e.g. $200 reported = Business
  // $40 × 5 seats). Always compute savings against at least 125% of the recommended
  // plan price so a genuine downgrade opportunity is never shown as $0 savings.
  else if (tool.plan === 'enterprise' && tool.seats < 10) {
    const recommendedPlan = tool.name === 'cursor' ? 'Business' : 'Team';
    const recommendedPrice = tool.name === 'cursor' ? 40 : 30;
    recommendedSpend = recommendedPrice * tool.seats;
    const isCustomPriced = currentPlan?.pricePerSeat === 'custom';
    const baselineSpend = isCustomPriced
      ? Math.max(tool.monthlySpend, recommendedSpend * 1.25)
      : tool.monthlySpend;
    savings = baselineSpend - recommendedSpend;
    recommendedAction = `Switch to ${recommendedPlan} plan (Enterprise is overkill for ${tool.seats} seats)`;
    reason = `Enterprise plans are designed for 10+ users. For ${tool.seats} seats, the ${recommendedPlan} plan costs $${recommendedPrice}/seat/month.`;
  }

  // Rule 3: Check if spending more than expected (user entered higher amount)
  else if (tool.monthlySpend > expectedSpend && expectedSpend > 0) {
    savings = tool.monthlySpend - expectedSpend;
    recommendedSpend = expectedSpend;
    recommendedAction = `Adjust monthly spend to $${expectedSpend} ($${currentPricePerSeat}/seat × ${tool.seats} seats)`;
    reason = `Based on ${pricing.name}'s ${tool.plan} plan at $${currentPricePerSeat}/seat/month, your expected spend is $${expectedSpend} but you reported $${tool.monthlySpend}.`;
  }

  // Rule 4: Suggest a free tier when one exists and the user is on a paid plan.
  // FIX: scan plans by price value (=== 0) instead of looking for a plan literally
  // keyed as "free". Gemini's free tier is keyed "pro" with pricePerSeat: 0, which
  // the original key-based lookup missed entirely.
  // Keep the 'pro' exclusion: users on a standard "pro" paid plan (e.g. Cursor Pro)
  // should not be nudged toward a hobby/free tier unnecessarily.
  else if (tool.plan !== 'free' && tool.plan !== 'pro') {
    const freePlanEntry = Object.entries(pricing.plans).find(
      ([planName, plan]) => plan.pricePerSeat === 0 && planName !== tool.plan
    );
    if (freePlanEntry && tool.monthlySpend > 10) {
      savings = tool.monthlySpend;
      recommendedSpend = 0;
      recommendedAction = `Consider switching to free tier`;
      reason = `${pricing.name} offers a free tier that might meet your needs. You could save $${Math.round(savings)}/month by trying the free version first.`;
    }
  }

  // Rule 5: Suggest an alternative tool.
  // FIX: guard with `tool.monthlySpend > expectedSpend` so this only fires when there
  // is already a pricing inefficiency. Without this guard, a correctly-priced plan
  // (e.g. Cursor Pro, 2 seats, $40 = $20×2) would spuriously surface an alternative
  // and produce a non-zero savings value, breaking the "optimal setup" expectation.
  if (
    savings === 0 &&
    recommendedAction === '' &&
    tool.monthlySpend > expectedSpend &&
    pricing.alternatives &&
    pricing.alternatives.length > 0
  ) {
    const bestAlternative = pricing.alternatives[0];
    if (bestAlternative.savingsPercent > 0) {
      const potentialSavings = tool.monthlySpend * (bestAlternative.savingsPercent / 100);
      if (potentialSavings > 10) {
        alternativeTool = bestAlternative.name;
        savings = potentialSavings;
        recommendedSpend = tool.monthlySpend - savings;
        recommendedAction = `Consider ${bestAlternative.name} as alternative`;
        reason = `${bestAlternative.name} could save you ${bestAlternative.savingsPercent}% compared to your current setup. ${bestAlternative.condition}`;
      }
    }
  }

  // Rule 6: No savings found — current setup is optimal
  if (savings === 0 && recommendedAction === '') {
    recommendedAction = 'Current setup is optimized';
    reason = `Your ${pricing.name} setup (${tool.plan} plan, ${tool.seats} seat${tool.seats > 1 ? 's' : ''}) appears optimal for your configuration. No immediate savings found.`;
    recommendedSpend = tool.monthlySpend;
  }

  // Ensure savings is never negative
  savings = Math.max(0, Math.floor(savings));

  return {
    toolName: pricing.name,
    currentSpend: tool.monthlySpend,
    recommendedAction,
    recommendedSpend,
    savings,
    reason,
    alternativeTool,
  };
}

// Full audit for all tools
export function runFullAudit(tools: ToolInput[]): {
  results: AuditResult[];
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalSavings: number;
  annualSavings: number;
  hasHighSavings: boolean;
} {
  const results = tools.map(tool => auditTool(tool));

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

// Calculate savings percentage
export function getSavingsPercentage(current: number, recommended: number): number {
  if (current === 0) return 0;
  return Math.round(((current - recommended) / current) * 100);
}