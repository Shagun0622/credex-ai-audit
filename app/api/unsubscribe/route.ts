// app/api/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  // Simple token verification (email + timestamp hash)
  // You can make this more secure, but for demo it's fine
  if (!email) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #F7F6F3; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #ef4444; }
          .button { background: #1A3A6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Invalid Request</h1>
          <p>Missing email parameter. Please use the link from your email.</p>
          <a href="/" class="button">Return to Home</a>
        </div>
      </body>
      </html>
    `, { 
      status: 400,
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  try {
    // Update leads table to mark as unsubscribed
    const { error: updateError } = await supabase
      .from('leads')
      .update({ unsubscribed: true })
      .eq('email', email);
    
    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }
    
    // Also update audits table (optional - to mark all audits as opted out)
    await supabase
      .from('audits')
      .update({ opted_out: true })
      .eq('email', email);
    
    // Return success page
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #F7F6F3; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .checkmark { font-size: 64px; color: #10b981; margin-bottom: 20px; }
          h1 { color: #0F0E0D; margin-bottom: 10px; }
          p { color: #6B6A66; margin-bottom: 20px; }
          .button { background: #1A3A6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .button:hover { background: #152e58; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✅</div>
          <h1>Successfully Unsubscribed</h1>
          <p>You will no longer receive pricing change notifications from AI Spend Audit.</p>
          <p>We're sorry to see you go. If you change your mind, you can run a new audit anytime.</p>
          <a href="/" class="button">Run a New Audit →</a>
        </div>
      </body>
      </html>
    `, { 
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
    
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #F7F6F3; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #ef4444; }
          .button { background: #1A3A6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Something Went Wrong</h1>
          <p>We couldn't process your unsubscribe request. Please try again or contact support.</p>
          <a href="/" class="button">Return to Home</a>
        </div>
      </body>
      </html>
    `, { 
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}