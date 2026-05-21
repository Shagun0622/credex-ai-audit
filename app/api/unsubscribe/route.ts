import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// One-click unsubscribe — linked from email footer
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return new NextResponse('Missing email', { status: 400 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return new NextResponse('Server error', { status: 500 });
  }

  const { error } = await supabase
    .from('leads')
    .update({ unsubscribed: true })
    .eq('email', email);

  if (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse('Could not unsubscribe. Please try again.', { status: 500 });
  }

  // Redirect to a confirmation page
  return NextResponse.redirect(`${APP_URL}/?unsubscribed=true`);
}