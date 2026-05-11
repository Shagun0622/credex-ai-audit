import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Service role client — bypasses RLS, server-side only, never expose to client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting store (simple in-memory for demo)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  rateLimit.set(ip, record);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const { email, auditData, auditResults, url } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Save to Supabase
    const { data, error: supabaseError } = await supabase
      .from('leads')
      .insert({
        email: email,
        company_name: auditData.companyName || null,
        team_size: auditData.teamSize,
        total_current_spend: auditResults.totalCurrentSpend,
        total_savings: auditResults.totalSavings,
        tool_count: auditData.tools.length,
        audit_url: url,
      })
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // Send confirmation email (if Resend API key exists)
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'AI Spend Audit <onboarding@resend.dev>',
          to: email,
          subject: 'Your AI Spend Audit Report',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1A3A6B; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .savings { font-size: 24px; color: #10b981; font-weight: bold; }
                .button { background: #1A3A6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>AI Spend Audit Report</h1>
                </div>
                <div class="content">
                  <h2>Your Audit Results</h2>
                  <p>Based on your ${auditData.teamSize}-person team using ${auditData.tools.length} AI tools:</p>

                  <p class="savings">Potential Savings: $${auditResults.totalSavings}/month</p>
                  <p class="savings">$${auditResults.annualSavings}/year</p>

                  <h3>Next Steps:</h3>
                  <ul>
                    <li>Review the per-tool recommendations in your report</li>
                    ${auditResults.hasHighSavings ? '<li>Book a consultation with Credex for discounted credits</li>' : ''}
                    <li>Share this report with your team</li>
                  </ul>

                  <p style="margin-top: 30px;">
                    <a href="${url}" class="button">View Your Full Report</a>
                  </p>
                </div>
                <div class="footer">
                  <p>AI Spend Audit · Helping teams optimize AI tool spending</p>
                  <p><a href="${url}">Unsubscribe</a> | <a href="https://credex.rocks">About Credex</a></p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: data.id,
    });

  } catch (error) {
    console.error('Capture lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}