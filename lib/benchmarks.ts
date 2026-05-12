// lib/benchmarks.ts
// Static benchmark data — update these as you collect real user data

export const useCaseBenchmarks: Record<string, { avgPerSeat: number; p25: number; p75: number }> = {
  'coding':            { avgPerSeat: 45, p25: 30, p75: 65 },
  'content':           { avgPerSeat: 28, p25: 18, p75: 40 },
  'customer support':  { avgPerSeat: 35, p25: 22, p75: 50 },
  'research':          { avgPerSeat: 38, p25: 25, p75: 55 },
  'marketing':         { avgPerSeat: 30, p25: 20, p75: 44 },
  'design':            { avgPerSeat: 25, p25: 15, p75: 38 },
  'sales':             { avgPerSeat: 32, p25: 21, p75: 46 },
  'general':           { avgPerSeat: 32, p25: 20, p75: 45 },
};

export const toolBenchmarks: Record<string, { avgPerSeat: number; efficient: number }> = {
  'chatgpt':           { avgPerSeat: 20,  efficient: 15 },
  'github copilot':    { avgPerSeat: 19,  efficient: 19 },
  'midjourney':        { avgPerSeat: 12,  efficient: 10 },
  'notion ai':         { avgPerSeat: 10,  efficient: 8  },
  'cursor':            { avgPerSeat: 20,  efficient: 16 },
  'claude':            { avgPerSeat: 20,  efficient: 18 },
  'jasper':            { avgPerSeat: 49,  efficient: 39 },
  'grammarly':         { avgPerSeat: 15,  efficient: 12 },
  'copy.ai':           { avgPerSeat: 36,  efficient: 29 },
  'perplexity':        { avgPerSeat: 20,  efficient: 20 },
};

// Fallback if use case not found
export const DEFAULT_BENCHMARK = useCaseBenchmarks['general'];