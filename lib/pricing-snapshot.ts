export function getPricingSnapshot(): any {
  return {
    cursor: { hobby: 0, pro: 40, business: 40, enterprise: 'custom' },
    'github-copilot': { individual: 10, business: 19, enterprise: 39 },
    claude: { free: 0, pro: 20, max: 50, team: 30, enterprise: 'custom', 'api-direct': 'usage' },
    chatgpt: { plus: 20, team: 30, enterprise: 'custom', 'api-direct': 'usage' },
    'anthropic-api': { paygo: 'usage', volume: 'usage' },
    'openai-api': { paygo: 'usage', volume: 'usage' },
    gemini: { pro: 0, ultra: 19.99, api: 'usage' },
    windsurf: { free: 0, pro: 15, team: 30 },
    timestamp: new Date().toISOString(),
  };
}