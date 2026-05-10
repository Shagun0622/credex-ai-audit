
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { auditData, auditResults } = await request.json();
    
    // If no API key, use fallback
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ 
        summary: generateFallbackSummary(auditData, auditResults) 
      });
    }
    
    // Create prompt for Groq
    const prompt = `You are an AI spending analyst. Generate a VERY SHORT (max 100 words), helpful, actionable summary for this company's AI tool spending:

Company Info:
- Team size: ${auditData.teamSize} people
- Primary use case: ${auditData.useCase}
- Number of AI tools used: ${auditData.tools.length}

Spending Data:
- Current monthly spend: $${auditResults.totalCurrentSpend}
- Potential monthly savings: $${auditResults.totalSavings}
- Potential annual savings: $${auditResults.annualSavings}
- Number of optimizations found: ${auditResults.results.filter((r: any) => r.savings > 0).length}

${
  auditResults.totalSavings === 0 
    ? "Their spending is already optimized. Reassure them and suggest checking back later."
    : "Give specific, actionable advice. Be encouraging but honest. Mention exact dollar amounts."
}

Write a friendly, professional paragraph. Do not use markdown. Keep it under 100 words.`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful financial analyst specializing in AI tool spending optimization. Be concise and actionable.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 200,
    });

    const summary = completion.choices[0]?.message?.content || generateFallbackSummary(auditData, auditResults);
    
    return NextResponse.json({ summary });
    
  } catch (error) {
    console.error('Groq API error:', error);
    // Fallback summary on error
    const { auditData, auditResults } = await request.json();
    return NextResponse.json({ 
      summary: generateFallbackSummary(auditData, auditResults) 
    });
  }
}

// Fallback summary (no AI needed)
function generateFallbackSummary(auditData: any, auditResults: any): string {
  const savingsPercent = auditResults.totalCurrentSpend > 0 
    ? Math.round((auditResults.totalSavings / auditResults.totalCurrentSpend) * 100)
    : 0;
  
  if (auditResults.totalSavings === 0) {
    return `Your AI spending is well-optimized! Based on your ${auditData.teamSize}-person team focusing on ${auditData.useCase}, your current setup of $${auditResults.totalCurrentSpend}/month is efficient. No immediate savings found, but check back as pricing changes.`;
  }
  
  if (auditResults.totalSavings < 100) {
    return `Good news! We found $${auditResults.totalSavings}/month in potential savings (${savingsPercent}% of your budget). Your ${auditData.teamSize}-person team can save $${auditResults.annualSavings}/year by adjusting ${auditResults.results.filter((r: any) => r.savings > 0).length} of your ${auditData.tools.length} tools. Focus on the recommendations above to start saving immediately.`;
  }
  
  return `🚨 Significant savings found! Your ${auditData.teamSize}-person team could save $${auditResults.totalSavings}/month ($${auditResults.annualSavings}/year) by optimizing your AI tool stack. We found ${auditResults.results.filter((r: any) => r.savings > 0).length} opportunities across ${auditData.tools.length} tools. ${auditResults.hasHighSavings ? 'Book a consultation with Credex to capture even more savings.' : 'Review your personalized recommendations above to start saving.'}`;
}
