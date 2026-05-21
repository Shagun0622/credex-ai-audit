// app/audit/[id]/compare/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingDown, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { runFullAudit } from '@/lib/audit-engine';
import {  getPricingSnapshot } from '@/lib/pricing-snapshot';

interface AuditData {
  id: string;
  audit_id: string;
  email: string;
  input_stack: any;
  output_result: any;
  pricing_snapshot: any;
  created_at: string;
}

export default function CompareAuditPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const auditId = params.id as string;
  const email = searchParams.get('email');

  const [oldAudit, setOldAudit] = useState<AuditData | null>(null);
  const [newAudit, setNewAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAudits() {
      try {
        setLoading(true);
        
        // 1. Fetch old audit from database
        const { data: oldData, error: oldError } = await supabase
          .from('audits')
          .select('*')
          .eq('audit_id', auditId)
          .single();
        
        if (oldError || !oldData) {
          setError('Audit not found');
          setLoading(false);
          return;
        }
        
        setOldAudit(oldData);
        
        // 2. Re-run audit with current pricing
        const currentPricing = getPricingSnapshot();
        const newResults = runFullAudit(oldData.input_stack.tools);
        
        setNewAudit({
          results: newResults,
          totalCurrentSpend: newResults.totalCurrentSpend,
          totalSavings: newResults.totalSavings,
          annualSavings: newResults.annualSavings,
          pricingSnapshot: currentPricing,
        });
        
      } catch (err) {
        console.error('Error loading audits:', err);
        setError('Failed to load audit data');
      } finally {
        setLoading(false);
      }
    }
    
    if (auditId) {
      loadAudits();
    }
  }, [auditId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1A3A6B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B6A66]">Loading comparison...</p>
        </div>
      </div>
    );
  }
  
  if (error || !oldAudit) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#0F0E0D] mb-2">Audit Not Found</h2>
          <p className="text-[#6B6A66] mb-4">{error || 'The audit you\'re looking for doesn\'t exist.'}</p>
          <Link href="/" className="text-[#1A3A6B] hover:underline">
            ← Run a new audit
          </Link>
        </div>
      </div>
    );
  }
  
  const oldResults = oldAudit.output_result;
  const oldTotalSavings = oldResults.totalSavings;
  const newTotalSavings = newAudit.totalSavings;
  const savingsDelta = newTotalSavings - oldTotalSavings;
  
  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      {/* Header */}
      <div className="border-b border-[#E2E0DB] bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-[#1A3A6B]" />
            <span className="text-base font-semibold tracking-tight text-[#0F0E0D]">AI Spend Audit</span>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-[#6B6A66] hover:text-[#1A3A6B]">
            <ArrowLeft className="w-4 h-4" />
            New Audit
          </Link>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F0E0D] mb-2">Pricing Update Comparison</h1>
          <p className="text-[#6B6A66]">
            See how pricing changes affect your potential savings
          </p>
        </div>
        
        {/* Savings Delta Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center mb-8 p-8 rounded-2xl ${
            savingsDelta > 0 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
              : savingsDelta < 0
              ? 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200'
              : 'bg-gray-50'
          }`}
        >
          <p className="text-sm font-semibold tracking-wider uppercase mb-3">
            {savingsDelta > 0 ? '🎉 YOU CAN SAVE MORE!' : savingsDelta < 0 ? '⚠️ SAVINGS DECREASED' : 'NO CHANGE IN SAVINGS'}
          </p>
          <p className="text-5xl font-bold text-[#0F0E0D] mb-2">
            {savingsDelta > 0 ? '+' : ''}{savingsDelta > 0 ? savingsDelta : savingsDelta}
            <span className="text-2xl font-normal text-[#8C8A86] ml-2">/month change</span>
          </p>
          <p className="text-[#6B6A66]">
            Your potential savings went from <strong>${oldTotalSavings}/month</strong> to <strong>${newTotalSavings}/month</strong>
          </p>
        </motion.div>
        
        {/* Side-by-Side Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Old Audit Column */}
          <div className="bg-white border border-[#E2E0DB] rounded-xl overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b border-[#E2E0DB]">
              <h2 className="text-lg font-semibold text-[#0F0E0D]">📅 Previous Audit</h2>
              <p className="text-xs text-[#8C8A86]">{new Date(oldAudit.created_at).toLocaleDateString()}</p>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-[#8C8A86]">Total Savings</p>
                <p className="text-2xl font-bold text-[#0F0E0D]">${oldResults.totalSavings}/month</p>
              </div>
              
              <h3 className="font-semibold text-[#0F0E0D] mb-3">Per-Tool Recommendations</h3>
              <div className="space-y-3">
                {oldResults.results?.map((result: any, index: number) => (
                  <div key={index} className="border-b border-[#E2E0DB] pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-[#0F0E0D]">{result.toolName}</span>
                      {result.savings > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Save ${result.savings}/mo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B6A66] mt-1">{result.recommendedAction}</p>
                    <p className="text-xs text-[#8C8A86] mt-1">{result.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* New Audit Column */}
          <div className="bg-white border border-[#E2E0DB] rounded-xl overflow-hidden">
            <div className="bg-[#1A3A6B] text-white px-6 py-4">
              <h2 className="text-lg font-semibold">🔄 Updated Audit</h2>
              <p className="text-xs text-white/70">With current pricing</p>
            </div>
            <div className="p-6">
              <div className={`mb-4 p-3 rounded-lg ${savingsDelta > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                <p className="text-sm text-[#8C8A86]">Total Savings</p>
                <p className={`text-2xl font-bold ${savingsDelta > 0 ? 'text-green-700' : 'text-[#0F0E0D]'}`}>
                  ${newAudit.totalSavings}/month
                </p>
              </div>
              
              <h3 className="font-semibold text-[#0F0E0D] mb-3">Updated Recommendations</h3>
              <div className="space-y-3">
                {newAudit.results?.map((result: any, index: number) => {
                  const oldResult = oldResults.results?.find((r: any) => r.toolName === result.toolName);
                  const isDifferent = oldResult && (result.savings !== oldResult.savings || result.recommendedAction !== oldResult.recommendedAction);
                  
                  return (
                    <div key={index} className={`border-b border-[#E2E0DB] pb-3 last:border-0 ${isDifferent ? 'bg-yellow-50/30 -mx-2 px-2 rounded' : ''}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-[#0F0E0D]">{result.toolName}</span>
                        {result.savings > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDifferent ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}`}>
                            {isDifferent ? '⚠️ Changed' : `Save $${result.savings}/mo`}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#6B6A66] mt-1">{result.recommendedAction}</p>
                      <p className="text-xs text-[#8C8A86] mt-1">{result.reason}</p>
                      {isDifferent && (
                        <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Recommendation changed due to pricing update
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="text-center mt-8">
          <Link href="/">
            <button className="bg-[#1A3A6B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#152e58] transition-all">
              Run a New Audit →
            </button>
          </Link>
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#E2E0DB] text-center text-sm text-[#8C8A86]">
          <p>AI Spend Audit — Helping you stay on top of AI tool pricing changes</p>
        </div>
      </div>
    </div>
  );
}