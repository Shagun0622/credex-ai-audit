
# Round 2 Reflection

## What went well
The pricing detection logic works correctly, grouping audits by user to send only one email per person. The diff view page shows side-by-side comparison clearly.

## What was hardest
The email configuration with Resend's domain restriction was frustrating. The email logic is correct, but testing with multiple emails required domain verification.

## What I'd do differently
I'd use Brevo SMTP from the start to avoid domain restrictions. I'd also add click tracking for better analytics.

## What I learned
Grouping audits by email prevents spam. Pricing snapshots must be captured at audit time, not detection time.
