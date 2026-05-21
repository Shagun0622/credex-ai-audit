import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getPricingSnapshot } from '@/lib/pricing-snapshot';

const getServiceSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

type PriceValue = number | string;
type ToolPricing = Record<string, PriceValue>;
type Snapshot = Record<string, ToolPricing | string>;

interface PricingChange {
  tool: string;
  plan: string;
  old_price: string;
  new_price: string;
}

interface Audit {
  id: string;
  audit_id: string;
  email: string;
  input_stack: { tools: Array<{ name: string; plan: string; monthlySpend: number }> };
  output_result: {
    totalCurrentSpend: number;
    totalSavings: number;
    recommendations: Array<{ toolName: string; recommendation: string; savings: number }>;
  };
}

interface Lead {
  email: string;
  unsubscribed: boolean;
}

function detectChanges(oldSnapshot: Snapshot, newSnapshot: Snapshot): PricingChange[] {
  const changes: PricingChange[] = [];
  for (const tool of Object.keys(newSnapshot)) {
    if (tool === 'timestamp') continue;
    const newPlans = newSnapshot[tool] as ToolPricing;
    const oldPlans = (oldSnapshot[tool] ?? {}) as ToolPricing;
    for (const plan of Object.keys(newPlans)) {
      const oldPrice = oldPlans[plan];
      const newPrice = newPlans[plan];
      if (oldPrice === undefined) {
        changes.push({ tool, plan, old_price: 'N/A', new_price: String(newPrice) });
      } else if (String(oldPrice) !== String(newPrice)) {
        changes.push({ tool, plan, old_price: String(oldPrice), new_price: String(newPrice) });
      }
    }
    for (const plan of Object.keys(oldPlans)) {
      if (newPlans[plan] === undefined) {
        changes.push({ tool, plan, old_price: String(oldPlans[plan]), new_price: 'REMOVED' });
      }
    }
  }
  return changes;
}

// Check if an audit's tools are affected by any pricing change
function getAuditImpact(
  audit: Audit,
  changes: PricingChange[]
): PricingChange[] {
  const toolNames = audit.input_stack?.tools?.map((t) => t.name.toLowerCase()) ?? [];
  return changes.filter((c) => toolNames.includes(c.tool.toLowerCase()));
}

function buildUserEmailHtml(
  affectedAudits: Audit[],
  changes: PricingChange[],
  userEmail: string
): string {
  const unsubscribeUrl = `${APP_URL}/api/unsubscribe?email=${encodeURIComponent(userEmail)}`;

  const auditBlocks = affectedAudits
    .map((audit) => {
      const impactedChanges = getAuditImpact(audit, changes);
      const compareUrl = `${APP_URL}/audit/${audit.audit_id}/compare?email=${encodeURIComponent(userEmail)}`;
      const toolNames = [...new Set(impactedChanges.map((c) => c.tool))].join(', ');

      const changeRows = impactedChanges
        .map(
          (c) => `
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #f3f4f6">${c.tool}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #f3f4f6">${c.plan}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #f3f4f6;color:#ef4444">
              <s>$${c.old_price}</s>
            </td>
            <td style="padding:6px 10px;border-bottom:1px solid #f3f4f6;color:#10b981;font-weight:600">
              $${c.new_price}
            </td>
          </tr>`
        )
        .join('');

      return `
        <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:16px">
          <p style="margin:0 0 8px;font-weight:600;color:#1f2937">
            🔧 Affected tools: ${toolNames}
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px">
            <thead>
              <tr style="background:#f9fafb">
                <th style="padding:6px 10px;text-align:left;color:#6b7280">Tool</th>
                <th style="padding:6px 10px;text-align:left;color:#6b7280">Plan</th>
                <th style="padding:6px 10px;text-align:left;color:#6b7280">Old</th>
                <th style="padding:6px 10px;text-align:left;color:#6b7280">New</th>
              </tr>
            </thead>
            <tbody>${changeRows}</tbody>
          </table>
          <a href="${compareUrl}"
             style="background:#1A3A6B;color:white;padding:10px 20px;text-decoration:none;
                    border-radius:6px;display:inline-block;font-size:13px;font-weight:600">
            See Old vs New Audit →
          </a>
        </div>`;
    })
    .join('');

  return `
    <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#1f2937;margin:0;padding:0;background:#f3f4f6">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px">
      <div style="background:#1A3A6B;padding:24px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">📊 Your AI Audit May Have Changed</h1>
      </div>
      <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin-top:0">Hi there,</p>
        <p>Pricing has changed for tools in your AI stack. 
           Your previous savings estimates may no longer be accurate.</p>
        ${auditBlocks}
        <p style="font-size:12px;color:#9ca3af;margin-top:24px;text-align:center;border-top:1px solid #e5e7eb;padding-top:16px">
          You're receiving this because you previously ran an AI Spend Audit.<br>
          <a href="${unsubscribeUrl}" style="color:#9ca3af">Unsubscribe from pricing alerts</a>
        </p>
      </div>
    </div>
    </body></html>`;
}

function buildAdminEmailHtml(changes: PricingChange[], notifiedCount: number): string {
  const rows = changes
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${c.tool}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${c.plan}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#ef4444">$${c.old_price}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#10b981;font-weight:600">$${c.new_price}</td>
      </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#1f2937">
    <div style="max-width:640px;margin:0 auto;padding:32px 24px">
      <div style="background:#1A3A6B;padding:24px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">⚠️ Pricing Changes Detected</h1>
      </div>
      <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p><strong>${changes.length}</strong> change(s) — <strong>${notifiedCount}</strong> users notified.</p>
        <table style="width:100%;border-collapse:collapse;background:white;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
          <thead>
            <tr style="background:#1A3A6B;color:white">
              <th style="padding:10px 12px;text-align:left">Tool</th>
              <th style="padding:10px 12px;text-align:left">Plan</th>
              <th style="padding:10px 12px;text-align:left">Old</th>
              <th style="padding:10px 12px;text-align:left">New</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    </body></html>`;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const currentSnapshot = getPricingSnapshot() as Snapshot;

    const { data: lastRow } = await supabase
      .from('pricing_snapshots')
      .select('snapshot')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!lastRow) {
      await supabase.from('pricing_snapshots').insert({ snapshot: currentSnapshot });
      return NextResponse.json({
        message: 'Baseline snapshot saved. No previous data to compare.',
        changes: [],
      });
    }

    const changes = detectChanges(lastRow.snapshot as Snapshot, currentSnapshot);

    if (changes.length === 0) {
      return NextResponse.json({ message: 'No pricing changes detected.', changes: [] });
    }

    // Save new snapshot + log changes
    await supabase.from('pricing_snapshots').insert({ snapshot: currentSnapshot });
    await supabase.from('pricing_changes').insert(
      changes.map((c) => ({ tool: c.tool, plan: c.plan, old_price: c.old_price, new_price: c.new_price }))
    );

    // Fetch all audits
    const { data: audits } = await supabase
      .from('audits')
      .select('id, audit_id, email, input_stack, output_result');

    // Fetch non-unsubscribed leads
    const { data: leads } = await supabase
      .from('leads')
      .select('email, unsubscribed')
      .eq('unsubscribed', false);

    const subscribedEmails = new Set((leads as Lead[] ?? []).map((l) => l.email));

    // Group affected audits by user email — ONE email per user
    const userAuditMap = new Map<string, Audit[]>();

    for (const audit of (audits as Audit[] ?? [])) {
      if (!subscribedEmails.has(audit.email)) continue;
      const impact = getAuditImpact(audit, changes);
      if (impact.length === 0) continue;

      const existing = userAuditMap.get(audit.email) ?? [];
      userAuditMap.set(audit.email, [...existing, audit]);
    }

    let notifiedCount = 0;

    if (resend && userAuditMap.size > 0) {
      const userEmails = [...userAuditMap.entries()];
      const BATCH_SIZE = 10;

      for (let i = 0; i < userEmails.length; i += BATCH_SIZE) {
        const batch = userEmails.slice(i, i + BATCH_SIZE);

        await Promise.allSettled(
          batch.map(([email, affectedAudits]) =>
            resend!.emails.send({
              from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
              to: email,
              subject: `📊 AI tool pricing changed — your audit may be outdated`,
              html: buildUserEmailHtml(affectedAudits, changes, email),
            })
          )
        );

        notifiedCount += batch.length;
        if (i + BATCH_SIZE < userEmails.length) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    // Admin summary
    const adminEmail = process.env.ADMIN_EMAIL;
    if (resend && adminEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: adminEmail,
        subject: `⚠️ ${changes.length} price change(s) — ${notifiedCount} users notified`,
        html: buildAdminEmailHtml(changes, notifiedCount),
      });
    }

    return NextResponse.json({
      message: `${changes.length} change(s) detected. ${notifiedCount} users notified.`,
      changes,
      notifiedCount,
    });
  } catch (error) {
    console.error('Pricing change detection error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

    const { data, error } = await supabase
      .from('pricing_changes')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ changes: data });
  } catch (error) {
    console.error('Get pricing changes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}