
import { describe, it, expect } from 'vitest';
import { auditTool, runFullAudit, getSavingsPercentage } from '../lib/audit-engine';

describe('Audit Engine Tests', () => {
  
  // Test 1: Business plan with single user should suggest Pro
  it('should suggest Pro plan for single user on Cursor Business', () => {
    const result = auditTool({
      name: 'cursor',
      plan: 'business',
      monthlySpend: 40,
      seats: 1,
    });
    
    expect(result.savings).toBeGreaterThan(0);
    expect(result.recommendedAction).toContain('Pro');
    expect(result.recommendedSpend).toBeLessThan(result.currentSpend);
  });
  
  // Test 2: Team plan with single user should suggest individual plan
  it('should suggest individual plan for single user on ChatGPT Team', () => {
    const result = auditTool({
      name: 'chatgpt',
      plan: 'team',
      monthlySpend: 30,
      seats: 1,
    });
    
    expect(result.savings).toBeGreaterThan(0);
    expect(result.recommendedAction).toContain('Plus') || expect(result.recommendedAction).toContain('Pro');
  });
  
  // Test 3: Enterprise plan for small team (<10) should suggest downgrade
  it('should suggest downgrade for Enterprise plan with 5 seats', () => {
    const result = auditTool({
      name: 'cursor',
      plan: 'enterprise',
      monthlySpend: 200,
      seats: 5,
    });
    
    expect(result.savings).toBeGreaterThan(0);
    expect(result.recommendedAction).toContain('Business');
  });
  
  // Test 4: Correct pricing calculation
  it('should calculate expected spend correctly for Pro plan', () => {
    const result = auditTool({
      name: 'cursor',
      plan: 'pro',
      monthlySpend: 40,
      seats: 2,
    });
    
    // Pro = $20/seat × 2 seats = $40 expected
    expect(result.savings).toBe(0);
    expect(result.currentSpend).toBe(40);
  });
  
  // Test 5: Over-reported spend should be corrected
  it('should flag over-reported monthly spend', () => {
    const result = auditTool({
      name: 'github-copilot',
      plan: 'individual',
      monthlySpend: 50,
      seats: 1,
    });
    
    expect(result.savings).toBeGreaterThan(0);
    expect(result.recommendedAction).toContain('Adjust');
  });
  
  // Test 6: Free tier recommendation when paying for premium
  it('should suggest considering free tier for Gemini Ultra when spend > $10', () => {
    const result = auditTool({
      name: 'gemini',
      plan: 'ultra',
      monthlySpend: 19.99,
      seats: 1,
    });
    
    // Check if it suggests free tier OR has some savings recommendation
    const hasRecommendation = result.recommendedAction.toLowerCase().includes('free') || 
                              result.savings > 0;
    expect(hasRecommendation).toBe(true);
  });
  
  // Test 7: Full audit with multiple tools
  it('should calculate total savings across multiple tools', () => {
    const tools = [
      { name: 'cursor', plan: 'business', monthlySpend: 40, seats: 1 },
      { name: 'github-copilot', plan: 'individual', monthlySpend: 10, seats: 1 },
      { name: 'chatgpt', plan: 'team', monthlySpend: 30, seats: 1 },
    ];
    
    const result = runFullAudit(tools);
    
    expect(result.totalSavings).toBeGreaterThan(0);
    expect(result.totalCurrentSpend).toBe(80);
    expect(result.results).toHaveLength(3);
  });
  
  // Test 8: Savings percentage calculation
  it('should calculate correct savings percentage', () => {
    expect(getSavingsPercentage(100, 60)).toBe(40);
    expect(getSavingsPercentage(50, 50)).toBe(0);
    expect(getSavingsPercentage(0, 0)).toBe(0);
  });
  
  // Test 9: Unknown tool handling
  it('should handle unknown tools gracefully', () => {
    const result = auditTool({
      name: 'unknown-tool',
      plan: 'pro',
      monthlySpend: 100,
      seats: 1,
    });
    
    expect(result.savings).toBe(0);
    expect(result.recommendedAction).toContain('manual review');
  });
  
  // Test 10: High savings detection
  it('should detect high savings over $500', () => {
    const tools = [
      { name: 'cursor', plan: 'enterprise', monthlySpend: 2000, seats: 10 },
      { name: 'openai-api', plan: 'paygo', monthlySpend: 1000, seats: 1 },
    ];
    
    const result = runFullAudit(tools);
    expect(result.hasHighSavings).toBe(true);
    expect(result.totalSavings).toBeGreaterThan(500);
  });
});