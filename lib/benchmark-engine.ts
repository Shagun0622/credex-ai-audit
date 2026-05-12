// lib/benchmark-engine.ts
// Computes benchmark results — imported by page as runBenchmark

import { useCaseBenchmarks, toolBenchmarks, DEFAULT_BENCHMARK } from './benchmarks';

interface AuditData {
  teamSize: number;
  useCase: string;
  tools: { name: string; monthlySpend: number }[];
}

interface AuditResults {
  totalCurrentSpend: number;
  totalSavings: number;
  annualSavings: number;
  results: {
    toolName: string;
    currentSpend: number;
    recommendedSpend: number;
    savings: number;
    recommendedAction: string;
    reason: string;
  }[];
}

export interface BenchmarkResult {
  perSeatSpend: number;
  industryAvgPerSeat: number;
  p25PerSeat: number;
  p75PerSeat: number;
  vsAverage: number;         // e.g. +38 means 38% above average, -10 means 10% below
  percentile: 'top' | 'average' | 'high';
  insight: string;
  toolInsights: {
    toolName: string;
    yourPerSeat: number;
    benchmarkAvg: number;
    efficient: number;
    status: 'good' | 'high' | 'unknown';
  }[];
}

export function runBenchmark(auditData: AuditData, auditResults: AuditResults): BenchmarkResult {
  const teamSize = Math.max(auditData.teamSize || 1, 1); // avoid divide by zero
  const totalCurrentSpend = auditResults.totalCurrentSpend || 0;
  const perSeatSpend = Math.round(totalCurrentSpend / teamSize);

  // Match use case (case-insensitive, partial match)
  const useCaseKey = Object.keys(useCaseBenchmarks).find(
    (key) => auditData.useCase?.toLowerCase().includes(key)
  ) ?? 'general';

  const ref = useCaseBenchmarks[useCaseKey] ?? DEFAULT_BENCHMARK;

  // % vs average
  const vsAverage =
    ref.avgPerSeat > 0
      ? Math.round(((perSeatSpend - ref.avgPerSeat) / ref.avgPerSeat) * 100)
      : 0;

  // Percentile bucket
  const percentile: BenchmarkResult['percentile'] =
    perSeatSpend <= ref.p25
      ? 'top'
      : perSeatSpend <= ref.avgPerSeat
      ? 'average'
      : 'high';

  // Human insight string
  let insight: string;
  if (vsAverage > 20) {
    insight = `You're spending ${vsAverage}% more per seat than similar ${useCaseKey} teams`;
  } else if (vsAverage < -10) {
    insight = `Great! You're ${Math.abs(vsAverage)}% below the industry average for ${useCaseKey} teams`;
  } else {
    insight = `Your spend is in line with industry averages for ${useCaseKey} teams`;
  }

  // Per-tool benchmark insights
  const toolInsights = auditResults.results.map((result) => {
    const toolKey = Object.keys(toolBenchmarks).find((key) =>
      result.toolName?.toLowerCase().includes(key)
    );
    const toolRef = toolKey ? toolBenchmarks[toolKey] : null;
    const yourPerSeat = teamSize > 0 ? Math.round(result.currentSpend / teamSize) : 0;

    return {
      toolName: result.toolName,
      yourPerSeat,
      benchmarkAvg: toolRef?.avgPerSeat ?? 0,
      efficient: toolRef?.efficient ?? 0,
      status: toolRef
        ? yourPerSeat > toolRef.avgPerSeat
          ? ('high' as const)
          : ('good' as const)
        : ('unknown' as const),
    };
  });

  return {
    perSeatSpend,
    industryAvgPerSeat: ref.avgPerSeat,
    p25PerSeat: ref.p25,
    p75PerSeat: ref.p75,
    vsAverage,
    percentile,
    insight,
    toolInsights,
  };
}