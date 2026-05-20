'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ReferralSection from '@/components/ui/ReferralSection';
import {
  TrendingDown,
  Shield,
  Zap,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Download,
  Share2,
  Mail,
  Sparkles,
  Award
} from 'lucide-react';
import { downloadPDF } from '@/lib/downloadPDF';

// Import audit engine
import { runFullAudit, ToolInput } from '@/lib/audit-engine';

// Import benchmark
import { runBenchmark } from '@/lib/benchmark-engine';

import { getPricingSnapshot } from '@/lib/pricing-snapshot';
// Types
interface AuditData {
  tools: ToolInput[];
  teamSize: number;
  useCase: string;
}

export default function AuditResultPage() {
  const params = useParams();
  const id = params.id as string;

  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [auditResults, setAuditResults] = useState<any>(null);
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Decode audit data from URL
  useEffect(() => {
    try {
      const decodedData = JSON.parse(atob(decodeURIComponent(id)));
      setAuditData(decodedData);

      // Run audit
      const results = runFullAudit(decodedData.tools);
      setAuditResults(results);

      // Run benchmark
      const benchmark = runBenchmark(decodedData, results);
      setBenchmarkResults(benchmark);

      // Generate AI summary (with fallback)
      generateAISummary(decodedData, results);

    } catch (error) {
      console.error('Failed to decode audit data', error);
      toast.error('Failed to load audit data. Please try again.');
    }
  }, [id]);

  // Generate AI summary or fallback
  const generateAISummary = async (data: AuditData, results: any) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditData: data, auditResults: results }),
      });

      if (response.ok) {
        const { summary } = await response.json();
        setAiSummary(summary);
      } else {
        setAiSummary(generateFallbackSummary(data, results));
      }
    } catch (error) {
      setAiSummary(generateFallbackSummary(data, results));
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback summary (no AI needed)
  const generateFallbackSummary = (data: AuditData, results: any): string => {
    const savingsPercent = Math.round((results.totalSavings / results.totalCurrentSpend) * 100);

    if (results.totalSavings === 0) {
      return `Your AI spending is well-optimized! Based on your ${data.teamSize}-person team focusing on ${data.useCase}, your current setup of $${results.totalCurrentSpend}/month is efficient. No immediate savings found, but check back as pricing changes.`;
    }

    if (results.totalSavings < 100) {
      return `Good news! We found $${results.totalSavings}/month in potential savings (${savingsPercent}% of your budget). Your ${data.teamSize}-person team can save $${results.annualSavings}/year by adjusting ${results.results.filter((r: any) => r.savings > 0).length} of your ${data.tools.length} tools.`;
    }

    return `🚨 Significant savings found! Your ${data.teamSize}-person team could save $${results.totalSavings}/month ($${results.annualSavings}/year) by optimizing your AI tool stack. We found ${results.results.filter((r: any) => r.savings > 0).length} opportunities across ${data.tools.length} tools. ${results.hasHighSavings ? 'Book a consultation with Credex to capture even more savings.' : 'Review your personalized recommendations below.'}`;
  };

  // Handle email capture
  const handleEmailCapture = async () => {
  if (!email) return;
  
  setIsEmailSending(true);
  
  try {
    const response = await fetch('/api/capture-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        auditData,
        auditResults,
        url: window.location.href,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setEmailSent(true);
      toast.success('Report sent! Check your inbox.');
      
      // SAVE AUDIT TO DATABASE HERE
      await saveAuditToDatabase(email);
      
    } else {
      toast.error(`Failed to send: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    toast.error('Network error. Please try again.');
  } finally {
    setIsEmailSending(false);
  }
};
  // Save audit to database when email is captured
const saveAuditToDatabase = async (userEmail: string) => {
  try {
    const pricingSnapshot = getPricingSnapshot();
    
    const response = await fetch('/api/save-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auditId: id,  // The same ID from URL
        email: userEmail,
        inputStack: auditData,
        outputResult: auditResults,
        pricingSnapshot: pricingSnapshot,
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to save audit to database');
    }
  } catch (error) {
    console.error('Error saving audit:', error);
  }
};
  // Handle CSV Export
const downloadCSV = () => {
  // Create CSV headers
  const headers = ['Tool', 'Current Spend', 'Recommended Spend', 'Savings', 'Action', 'Reason'];
  
  // Create CSV rows
  const rows = auditResults.results.map((result: any) => [
    result.toolName,
    `$${result.currentSpend}/mo`,
    `$${result.recommendedSpend}/mo`,
    `$${result.savings}/mo`,
    result.recommendedAction,
    result.reason,
  ]);
  
  // Add summary row
  rows.push([
    'TOTAL',
    `$${auditResults.totalCurrentSpend}/mo`,
    `$${auditResults.totalRecommendedSpend}/mo`,
    `$${auditResults.totalSavings}/mo`,
    'Annual Savings',
    `$${auditResults.annualSavings}/year`,
  ]);
  
  // Combine headers and rows
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  // Add BOM for UTF-8 encoding (handles special characters)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-spend-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Show success toast
  toast.success('CSV downloaded!', {
    duration: 2000,
    position: 'top-right',
    icon: '📊',
  });
};
  // Handle share
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!', {
      duration: 3000,
      position: 'top-right',
      icon: '📋',
    });
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (auditData && auditResults) {
      downloadPDF(auditData, auditResults);
      toast.success('PDF downloaded!', {
        duration: 2000,
        position: 'top-right',
        icon: '📄',
      });
    }
  };

  if (!auditData || !auditResults) {
    return (
      <LoadingSkeleton/>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      {/* Header */}
      <div className="border-b border-[#E2E0DB] bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-[#1A3A6B]" />
            <span className="text-base font-semibold tracking-tight text-[#0F0E0D]">AI Spend Audit</span>
          </div>

          {/* Header buttons - Share and Download */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-[#6B6A66] hover:text-[#1A3A6B] transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share report
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-sm text-[#6B6A66] hover:text-[#1A3A6B] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
              <button
    onClick={downloadCSV}
    className="flex items-center gap-2 text-sm text-[#6B6A66] hover:text-[#1A3A6B] transition-colors"
  >
    <Download className="w-4 h-4" />
    CSV
  </button>

          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Hero Savings Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center mb-12 p-8 rounded-2xl ${
            auditResults.totalSavings > 500
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
              : auditResults.totalSavings > 0
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50'
              : 'bg-gray-50'
          }`}
        >
          {auditResults.totalSavings > 500 && (
            <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-1.5 mb-4">
              <Award className="w-4 h-4 text-green-700" />
              <span className="text-sm font-semibold text-green-700">High Savings Opportunity!</span>
            </div>
          )}

          <p className="text-sm font-semibold tracking-wider uppercase text-[#8C8A86] mb-3">
            Your estimated savings
          </p>

          <p className="text-6xl md:text-7xl font-bold text-[#0F0E0D] mb-2">
            ${auditResults.totalSavings.toLocaleString()}
            <span className="text-2xl font-normal text-[#8C8A86] ml-2">/month</span>
          </p>

          <p className="text-2xl text-[#1A3A6B] font-semibold mb-4">
            ${auditResults.annualSavings.toLocaleString()}/year
          </p>

          <p className="text-[#6B6A66] max-w-md mx-auto">
            Based on your {auditData.teamSize}-person team using {auditData.tools.length} AI tools
          </p>
        </motion.div>

        {/* Industry Benchmark Section */}
        {benchmarkResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white border border-[#E2E0DB] rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-[#0F0E0D] mb-4">Industry Benchmark</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-[#8C8A86] mb-1">Your per-seat spend</p>
                <p className="text-2xl font-bold text-[#0F0E0D]">
                  ${benchmarkResults.perSeatSpend}
                  <span className="text-sm font-normal text-[#8C8A86]">/mo</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8C8A86] mb-1">Industry average</p>
                <p className="text-2xl font-bold text-[#0F0E0D]">
                  ${benchmarkResults.industryAvgPerSeat}
                  <span className="text-sm font-normal text-[#8C8A86]">/mo</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8C8A86] mb-1">vs. average</p>
                <p className={`text-2xl font-bold ${benchmarkResults.vsAverage > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {benchmarkResults.vsAverage > 0 ? '+' : ''}{benchmarkResults.vsAverage}%
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                benchmarkResults.percentile === 'top'
                  ? 'bg-green-100 text-green-700'
                  : benchmarkResults.percentile === 'average'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {benchmarkResults.percentile === 'top'
                  ? '✓ Top 25% spender'
                  : benchmarkResults.percentile === 'average'
                  ? '~ Average spender'
                  : '↑ Above average spender'}
              </span>
            </div>
          </motion.div>
        )}

        {/* High Savings CTA (only if >$500) */}
        {auditResults.hasHighSavings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-[#1A3A6B] to-[#0F2B4F] rounded-xl p-6 text-white"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Want to capture even more savings?</h3>
                <p className="text-white/80">
                  Credex provides discounted AI infrastructure credits. Book a consultation to learn how.
                </p>
              </div>
              <button className="bg-white text-[#1A3A6B] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2">
                Book consultation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Per-Tool Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-[#0F0E0D] mb-4">Per-tool breakdown</h2>
          <div className="space-y-3">
            {auditResults.results.map((result: any, index: number) => (
              <div
                key={index}
                className="bg-white border border-[#E2E0DB] rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#0F0E0D]">{result.toolName}</h3>
                      {result.savings > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Save ${result.savings}/mo
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-[#8C8A86] text-xs">Current spend</p>
                        <p className="font-semibold text-[#0F0E0D]">${result.currentSpend}/mo</p>
                      </div>
                      <div>
                        <p className="text-[#8C8A86] text-xs">Recommended</p>
                        <p className="font-semibold text-green-700">${result.recommendedSpend}/mo</p>
                      </div>
                      <div>
                        <p className="text-[#8C8A86] text-xs">Savings</p>
                        <p className="font-semibold text-green-700">${result.savings}/mo</p>
                      </div>
                    </div>

                    <p className="text-sm text-[#6B6A66] mt-3">
                      <span className="font-medium">→</span> {result.recommendedAction}
                    </p>
                    <p className="text-xs text-[#8C8A86] mt-2">{result.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-[#0F0E0D] mb-2">AI Insights</h3>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[#6B6A66]">Generating personalized insights...</p>
                </div>
              ) : (
                <p className="text-[#4A4845] leading-relaxed">{aiSummary}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Email Capture Section */}
               {/* Email Capture Section */}
        {!emailSent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-[#E2E0DB] rounded-xl p-6"
          >
            {!showEmailGate ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-[#0F0E0D] mb-2">Save this report</h3>
                <p className="text-[#6B6A66] mb-4">Get a copy of this audit sent to your inbox</p>
                <button
                  onClick={() => setShowEmailGate(true)}
                  className="bg-[#1A3A6B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#152e58] transition-all flex items-center gap-2 mx-auto"
                >
                  <Mail className="w-4 h-4" />
                  Get full report
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-[#0F0E0D] mb-2">Enter your email</h3>
                <p className="text-[#6B6A66] text-sm mb-4">We'll send you a detailed report and notify you of new savings opportunities</p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-1 px-4 py-3 border border-[#E2E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
                  />
                  <button
                    onClick={handleEmailCapture}
                    disabled={isEmailSending}
                    className="bg-[#1A3A6B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#152e58] transition-all disabled:opacity-50"
                  >
                    {isEmailSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
                <p className="text-xs text-[#8C8A86] mt-3 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  We never share your email. Unsubscribe anytime.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#0F0E0D] mb-2">Report sent!</h3>
            <p className="text-[#6B6A66]">Check your inbox for your detailed AI spend audit.</p>
          </motion.div>
        )}

        {/* Referral Section - Shows only after email sent */}
        <ReferralSection 
          savings={auditResults.totalSavings} 
          emailSent={emailSent} 
        />

        {/* Footer Stats */}
        <div className="mt-8 pt-6 border-t border-[#E2E0DB] flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#8C8A86]">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> No credit card required</span>
          <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Results are instant</span>
          <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Savings calculated based on official pricing</span>
        </div>
      </div>

      {/* Toaster for notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}