import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client using service role key (bypasses RLS)
// Never use SUPABASE_SERVICE_ROLE_KEY in client-side code or NEXT_PUBLIC_ variables
const getServiceSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function POST(request: NextRequest) {
  try {
    const { auditId, email, inputStack, outputResult, pricingSnapshot } = await request.json();

    if (!auditId || !email || !inputStack || !outputResult || !pricingSnapshot) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    if (!supabase) {
      console.error('Supabase service role client not configured');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // upsert: insert on first save, update on retry — no duplicate key errors
    const { error } = await supabase
      .from('audits')
      .upsert(
        {
          audit_id: auditId,
          email: email,
          input_stack: inputStack,
          output_result: outputResult,
          pricing_snapshot: pricingSnapshot,
        },
        { onConflict: 'audit_id' }
      );

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save audit' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, auditId });

  } catch (error) {
    console.error('Save audit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}