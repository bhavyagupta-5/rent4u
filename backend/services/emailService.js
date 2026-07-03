const nodemailer = require('nodemailer');
const axios = require('axios');

async function sendEmail({ to, subject, html }) {
  let recipient = to;
  let emailSubject = subject;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  // Resend Sandbox limitation workaround: if using onboarding@resend.dev, 
  // you can only send to the verified dashboard email.
  if (fromEmail === 'onboarding@resend.dev' && process.env.RESEND_API_KEY) {
    const verifiedEmail = process.env.VERIFIED_TEST_EMAIL || 'bhavyagupta561@gmail.com';
    if (to.toLowerCase() !== verifiedEmail.toLowerCase()) {
      console.log(`[Resend Sandbox] Redirecting mail from ${to} to verified address ${verifiedEmail} to prevent 403 restriction.`);
      recipient = verifiedEmail;
      emailSubject = `[Test Redirected from ${to}] ${subject}`;
    }
  }

  // 1. Resend API Key Integration (Port 443, safe on Render/Railway)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await axios.post('https://api.resend.com/emails', {
        from: `RentHour AI <${fromEmail}>`,
        to: [recipient],
        subject: emailSubject,
        html: html
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("Email sent successfully via Resend API:", res.data.id);
      return res.data;
    } catch (err) {
      console.error("Resend API failed, falling back to SMTP. Error:", err.response?.data || err.message);
    }
  }

  // 2. SendGrid API Key Integration (Port 443, safe on Render/Railway)
  if (process.env.SENDGRID_API_KEY) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'no-reply@renthour-ai.com';
      const res = await axios.post('https://api.sendgrid.com/v3/mail/send', {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: 'RentHour AI' },
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("Email sent successfully via SendGrid API");
      return res.data;
    } catch (err) {
      console.error("SendGrid API failed, falling back to SMTP. Error:", err.response?.data || err.message);
    }
  }

  // 3. Fallback: SMTP / Mock
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log("=== MOCK EMAIL SENT ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML length): ${html.length}`);
    console.log("=======================");
    return { messageId: 'mock-id-' + Date.now() };
  }

  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const secure = process.env.EMAIL_SECURE !== 'false';

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return await transporter.sendMail({
    from: `"RentHour AI" <${user}>`,
    to: to,
    subject: subject,
    html: html
  });
}

async function sendInterestReceivedEmail(ownerEmail, ownerName, tenantName, listingTitle, compatibilityScore) {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
      <h2 style="color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">New Tenant Interest Received!</h2>
      <p>Hi ${ownerName},</p>
      <p>A tenant, <strong>${tenantName}</strong>, has expressed interest in your room listing: <strong>"${listingTitle}"</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <span style="font-size: 16px; color: #4b5563;">AI Compatibility Match Score:</span>
        <div style="font-size: 36px; font-weight: bold; color: #10b981; margin-top: 5px;">${compatibilityScore}%</div>
      </div>
      <p>Log in to your RentHour AI Owner Dashboard to accept or decline this interest and start chatting!</p>
      <br />
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #9ca3af;">This is an automated notification from RentHour AI.</p>
    </div>
  `;

  return await sendEmail({
    to: ownerEmail,
    subject: `RentHour AI: Interest Received for "${listingTitle}"!`,
    html: htmlContent
  });
}

async function sendInterestAcceptedEmail(tenantEmail, tenantName, ownerName, ownerPhone, listingTitle) {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
      <h2 style="color: #10b981; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Interest Request Approved! 🎉</h2>
      <p>Hi ${tenantName},</p>
      <p>Great news! The owner, <strong>${ownerName}</strong>, has accepted your interest request for: <strong>"${listingTitle}"</strong>.</p>
      <p>You can now open the real-time chat room on RentHour AI to connect directly with the owner.</p>
      ${ownerPhone ? `<p>Owner contact number: <strong>${ownerPhone}</strong></p>` : ''}
      <br />
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #9ca3af;">Thank you for using RentHour AI.</p>
    </div>
  `;

  return await sendEmail({
    to: tenantEmail,
    subject: `RentHour AI: Your request for "${listingTitle}" was ACCEPTED!`,
    html: htmlContent
  });
}

async function sendInterestDeclinedEmail(tenantEmail, tenantName, listingTitle) {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
      <h2 style="color: #ef4444; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Interest Update</h2>
      <p>Hi ${tenantName},</p>
      <p>Thank you for expressing interest in <strong>"${listingTitle}"</strong>.</p>
      <p>Unfortunately, the owner has decided to decline your request at this time. Don't worry—there are plenty of other listings matching your profile on RentHour AI. Keep searching!</p>
      <br />
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #9ca3af;">Thank you for using RentHour AI.</p>
    </div>
  `;

  return await sendEmail({
    to: tenantEmail,
    subject: `RentHour AI: Interest update for "${listingTitle}"`,
    html: htmlContent
  });
}

async function sendPasswordResetEmail(userEmail, userName, resetUrl) {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
      <h2 style="color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Reset Your Password</h2>
      <p>Hi ${userName},</p>
      <p>You requested to reset your password on RentHour AI. Click the link below to set a new password. This link is valid for 10 minutes:</p>
      <div style="margin: 24px 0; text-align: center;">
        <a href="${resetUrl}" style="background-color: #e65a0f; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="word-break: break-all; color: #4b5563; font-size: 13px;">If you're having trouble clicking the button, copy and paste this URL into your browser: <br/> ${resetUrl}</p>
      <br />
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #9ca3af;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: `RentHour AI: Reset Your Password`,
    html: htmlContent
  });
}

module.exports = {
  sendInterestReceivedEmail,
  sendInterestAcceptedEmail,
  sendInterestDeclinedEmail,
  sendPasswordResetEmail,
};
