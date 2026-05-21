import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function GET(request: NextRequest) {
  // Protect with admin password
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  // Run all queries in parallel
  const [auditsRes, leadsRes, changesRes] = await Promise.all([
    supabase
      .from('audits')
      .select('email, input_stack, output_result, created_at, last_notified_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('leads')
      .select('email, unsubscribed'),
    supabase
      .from('pricing_changes')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(20),
  ]);

  if (auditsRes.error) {
    console.error('Audits fetch error:', auditsRes.error);
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
  }

  const audits = auditsRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const changes = changesRes.data ?? [];

  // Unique users by email
  const uniqueEmails = new Set(audits.map((a) => a.email));

  // Total savings across all audits
  const totalSavings = audits.reduce(
    (sum, a) => sum + (a.output_result?.totalSavings ?? 0),
    0
  );

  // Emails sent = audits that have been notified
  const emailsSent = audits.filter((a) => a.last_notified_at).length;

  // Weekly activity — last 7 days
  const weeklyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = audits.filter((a) => {
      const createdAt = new Date(a.created_at);
      return createdAt >= date && createdAt < nextDate;
    }).length;

    weeklyActivity.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      count,
    });
  }

  return NextResponse.json({
    totalAudits: audits.length,
    totalLeads: leads.length,
    uniqueUsers: uniqueEmails.size,
    totalSavings,
    emailsSent,
    clickThroughs: Math.floor(emailsSent * 0.35), // placeholder until real click tracking
    recentAudits: audits.slice(0, 5),
    recentChanges: changes,
    weeklyActivity,
  });
}