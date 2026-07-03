const nodemailer = require('nodemailer');

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return {
      sendMail: async (mailOptions) => {
        console.log("=== MOCK EMAIL SENT ===");
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Body (HTML length): ${mailOptions.html.length}`);
        console.log("=======================");
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  }

  // Use customized SMTP settings if provided (useful for Render/Railway hosting), defaulting to Gmail secure SMTP.
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const secure = process.env.EMAIL_SECURE !== 'false'; // Default to true for port 465

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      // Do not fail on invalid/self-signed certs which are common in cloud host routes
      rejectUnauthorized: false
    }
  });
}

async function sendInterestReceivedEmail(ownerEmail, ownerName, tenantName, listingTitle, compatibilityScore) {
  const transporter = getTransporter();
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

  return await transporter.sendMail({
    from: `"RentHour AI" <${process.env.EMAIL_USER || 'no-reply@renthour-ai.com'}>`,
    to: ownerEmail,
    subject: `RentHour AI: Interest Received for "${listingTitle}"!`,
    html: htmlContent,
  });
}

async function sendInterestAcceptedEmail(tenantEmail, tenantName, ownerName, ownerPhone, listingTitle) {
  const transporter = getTransporter();
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

  return await transporter.sendMail({
    from: `"RentHour AI" <${process.env.EMAIL_USER || 'no-reply@renthour-ai.com'}>`,
    to: tenantEmail,
    subject: `RentHour AI: Your request for "${listingTitle}" was ACCEPTED!`,
    html: htmlContent,
  });
}

async function sendInterestDeclinedEmail(tenantEmail, tenantName, listingTitle) {
  const transporter = getTransporter();
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

  return await transporter.sendMail({
    from: `"RentHour AI" <${process.env.EMAIL_USER || 'no-reply@renthour-ai.com'}>`,
    to: tenantEmail,
    subject: `RentHour AI: Interest update for "${listingTitle}"`,
    html: htmlContent,
  });
}

module.exports = {
  sendInterestReceivedEmail,
  sendInterestAcceptedEmail,
  sendInterestDeclinedEmail,
};
