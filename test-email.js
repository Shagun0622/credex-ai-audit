const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY); // GOOD

async function sendTestEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'your-email@gmail.com',  // Replace with your email
      subject: 'Test Email from AI Spend Audit',
      html: '<p>This is a test email! Your email sending is working.</p>',
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('✅ Email sent! Check your inbox.');
      console.log('Email ID:', data.id);
    }
  } catch (error) {
    console.error('Failed to send:', error);
  }
}

sendTestEmail();