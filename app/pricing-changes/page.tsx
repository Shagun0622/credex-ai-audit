// app/pricing-changes/page.tsx
import { createClient } from '@supabase/supabase-js';
import { TrendingDown, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Server component - fetches data directly
async function getPricingChanges() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: changes, error } = await supabase
    .from('pricing_changes')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('Error fetching changes:', error);
    return [];
  }
  
  return changes || [];
}

// Group changes by date
function groupByDate(changes: any[]) {
  const grouped: { [key: string]: any[] } = {};
  
  changes.forEach(change => {
    const date = new Date(change.detected_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(change);
  });
  
  return grouped;
}

export default async function PricingChangesPage() {
  const changes = await getPricingChanges();
  const groupedChanges = groupByDate(changes);
  const dates = Object.keys(groupedChanges).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      {/* Header */}
      <div className="border-b border-[#E2E0DB] bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-[#1A3A6B]" />
            <span className="text-base font-semibold tracking-tight text-[#0F0E0D]">AI Spend Audit</span>
          </div>
          <Link href="/" className="text-sm text-[#6B6A66] hover:text-[#1A3A6B]">
            ← Back to Audit
          </Link>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#0F0E0D] mb-3">
            📊 What Changed This Week
          </h1>
          <p className="text-lg text-[#6B6A66] max-w-2xl mx-auto">
            Track pricing changes across AI tools. Stay informed about updates 
            that could affect your team's spending.
          </p>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-[#E2E0DB] rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#1A3A6B] mb-1">
              {changes.length}
            </div>
            <div className="text-sm text-[#8C8A86]">Total Changes</div>
          </div>
          <div className="bg-white border border-[#E2E0DB] rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#1A3A6B] mb-1">
              {new Set(changes.map(c => c.tool)).size}
            </div>
            <div className="text-sm text-[#8C8A86]">Tools Affected</div>
          </div>
          <div className="bg-white border border-[#E2E0DB] rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-[#1A3A6B] mb-1">
              {dates.length}
            </div>
            <div className="text-sm text-[#8C8A86]">Days with Changes</div>
          </div>
        </div>
        
        {/* Changes by Date */}
        {changes.length === 0 ? (
          <div className="bg-white border border-[#E2E0DB] rounded-xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#0F0E0D] mb-2">No Pricing Changes Yet</h2>
            <p className="text-[#6B6A66]">
              Pricing data is being monitored. Check back soon for updates!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {dates.map(date => (
              <div key={date} className="bg-white border border-[#E2E0DB] rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-[#E2E0DB]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#1A3A6B]" />
                    <h2 className="text-lg font-semibold text-[#0F0E0D]">{date}</h2>
                  </div>
                </div>
                <div className="divide-y divide-[#E2E0DB]">
                  {groupedChanges[date].map((change, idx) => (
                    <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-[#0F0E0D] text-lg">
                              {change.tool}
                            </span>
                            <span className="text-xs bg-gray-100 text-[#8C8A86] px-2 py-0.5 rounded-full">
                              {change.plan}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-red-500 line-through text-sm">
                              ${change.old_price}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-green-600 font-semibold">
                              ${change.new_price}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {change.new_price === 'REMOVED' ? (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              Plan Removed
                            </span>
                          ) : parseFloat(change.new_price) > parseFloat(change.old_price) ? (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              ⬆ Price Increase
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              ⬇ Price Decrease
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Link href="/">
            <button className="bg-[#1A3A6B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#152e58] transition-all">
              Run Your Free Audit →
            </button>
          </Link>
          <p className="text-sm text-[#8C8A86] mt-4">
            See how these changes affect your AI tool spending
          </p>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#E2E0DB] text-center text-sm text-[#8C8A86]">
          <p>AI Spend Audit — Real-time pricing updates for AI tools</p>
          <p className="mt-1">
            <Link href="/" className="hover:underline">Audit Tool</Link>
            {' • '}
            <Link href="/admin/dashboard" className="hover:underline">Admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}