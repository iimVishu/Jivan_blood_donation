import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string, attachments?: { filename: string, content: Buffer }[]) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not found. Email not sent.');
      console.log('Email details:', { to, subject, html });
      return;
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Jeevan Blood Donation" <noreply@jeevan.com>',
      to,
      subject,
      html,
      attachments,
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const verifySmtpConnection = async () => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return { success: false, error: 'SMTP credentials missing in environment variables' };
    }
    await transporter.verify();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const buildEmailTemplate = (title: string, content: string, headerColor: string = '#dc2626') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f5; width: 100%; margin: 0; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${headerColor}; padding: 35px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">${title}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px; color: #3f3f46; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px 35px; text-align: center; border-top: 1px solid #e4e4e7;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <div style="width: 40px; height: 40px; background-color: #fee2e2; border-radius: 50%; line-height: 40px; font-size: 20px;">🩸</div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 5px 0; color: #52525b; font-size: 14px;">Warm regards,</p>
                    <p style="margin: 0 0 15px 0; color: #18181b; font-weight: 600; font-size: 16px;">Team Jeevan</p>
                    <p style="margin: 0; color: #a1a1aa; font-size: 12px;">&copy; ${new Date().getFullYear()} Jeevan Blood Donation. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendAppointmentConfirmationEmail = async (
  to: string,
  donorName: string,
  date: string,
  bloodBankName: string,
  address: string,
  locationLink: string
) => {
  const subject = '📅 Appointment Confirmed - Jeevan Blood Donation';
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 18px; color: #18181b;">Dear <strong>${donorName}</strong>,</p>
    <p style="margin: 0 0 25px 0; color: #52525b;">Your blood donation appointment has been successfully scheduled and confirmed. Thank you for your commitment to saving lives.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
      <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Appointment Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="30%" style="padding: 6px 0; color: #64748b; font-weight: 500;">Date</td>
          <td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Center</td>
          <td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${bloodBankName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-weight: 500; vertical-align: top;">Address</td>
          <td style="padding: 6px 0; color: #1e293b; font-weight: 600; line-height: 1.4;">${address}</td>
        </tr>
      </table>
      
      <div style="margin-top: 20px; text-align: left;">
        <a href="${locationLink}" target="_blank" style="display: inline-block; background-color: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">📍 View on Map</a>
      </div>
    </div>

    <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 10px; border-top: 3px solid #f59e0b;">
      <h4 style="color: #b45309; margin: 0 0 10px 0; font-size: 15px;">Important Reminders:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.6;">
        <li>Please arrive <strong>10 minutes early</strong>.</li>
        <li>Bring a valid government-issued ID.</li>
        <li>Stay well-hydrated and eat a light meal before donating.</li>
      </ul>
    </div>
  `;
  const html = buildEmailTemplate('✅ Appointment Confirmed', content, '#10b981');
  return sendEmail(to, subject, html);
};

export const sendAppointmentRejectionEmail = async (
  to: string,
  donorName: string,
  date: string,
  bloodBankName: string,
  reason?: string
) => {
  const subject = '⚠️ Appointment Update - Jeevan Blood Donation';
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 18px; color: #18181b;">Dear <strong>${donorName}</strong>,</p>
    <p style="margin: 0 0 20px 0; color: #52525b;">We are writing to inform you about an update regarding your blood donation appointment scheduled for <strong>${new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</strong> at <strong>${bloodBankName}</strong>. Unfortunately, this appointment has been <strong>cancelled</strong>.</p>
    
    ${reason ? `
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #991b1b; margin: 0 0 8px 0; font-size: 15px;">Reason for Cancellation:</h4>
      <p style="color: #7f1d1d; margin: 0; font-size: 15px;">${reason}</p>
    </div>
    ` : ''}

    <p style="margin: 0 0 30px 0; color: #52525b;">We sincerely apologize for any inconvenience. Your willingness to help the community is deeply appreciated, and we would love to see you soon.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/donor" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Reschedule Appointment</a>
    </div>
  `;
  const html = buildEmailTemplate('Appointment Update', content, '#ef4444');
  return sendEmail(to, subject, html);
};

export const sendDonationThankYouEmail = async (
  to: string,
  amount: number,
  paymentId: string
) => {
  const subject = '💝 Thank You for Your Generous Support - Jeevan Blood Donation';
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 48px; margin-bottom: 15px;">💌</div>
      <p style="font-size: 20px; color: #1e293b; margin: 0; font-weight: 600;">Your kindness fuels our mission.</p>
    </div>

    <p style="margin: 0 0 20px 0; color: #52525b; text-align: center;">We are deeply grateful to inform you that we have successfully received your generous monetary donation.</p>

    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 30px; margin: 30px 0;">
      <h3 style="color: #0f172a; margin: 0 0 20px 0; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">Transaction Receipt</h3>
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; max-width: 400px;">
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px dotted #cbd5e1;">Amount Donated:</td>
          <td align="right" style="padding: 10px 0; color: #0f172a; font-weight: 700; font-size: 18px; border-bottom: 1px dotted #cbd5e1;">₹${amount.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; border-bottom: 1px dotted #cbd5e1;">Transaction ID:</td>
          <td align="right" style="padding: 10px 0; color: #0f172a; font-weight: 600; font-size: 13px; font-family: monospace; border-bottom: 1px dotted #cbd5e1;">${paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Date:</td>
          <td align="right" style="padding: 10px 0; color: #0f172a; font-weight: 600; font-size: 14px;">${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0; color: #4b5563; font-size: 15px; text-align: center; font-style: italic; background-color: #f1f5f9; padding: 20px; border-radius: 8px;">"Your contribution directly helps us organize more lifesaving blood donation camps, upgrade facilities, and connect critical patients with donors. We truly appreciate you."</p>
  `;
  const html = buildEmailTemplate('Thank You For Your Support!', content, '#0ea5e9');
  return sendEmail(to, subject, html);
};

// Blood Donation Appreciation Email - Sent when donation is confirmed/completed
export const sendBloodDonationAppreciationEmail = async (
  to: string,
  donorName: string,
  bloodGroup: string,
  bloodBankName: string,
  donationDate: string,
  donationCount: number
) => {
  const subject = '🩸 Thank You for Saving Lives! - Jeevan Blood Donation';
  const content = `
    <p style="margin: 0 0 20px 0; font-size: 18px; color: #18181b;">Dear <strong>${donorName}</strong>,</p>
    <p style="margin: 0 0 25px 0; color: #52525b;">On behalf of everyone at <strong>Jeevan Blood Donation</strong> and the countless lives you've helped save, we want to express our deepest gratitude for your generous blood donation!</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #dc2626; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
      <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Donation Summary</h3>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td width="35%" style="padding: 6px 0; color: #64748b;">Blood Group:</td><td style="padding: 6px 0; color: #1e293b; font-weight: 700;">${bloodGroup}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Donation Date:</td><td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${new Date(donationDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Blood Bank:</td><td style="padding: 6px 0; color: #1e293b; font-weight: 600;">${bloodBankName}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Total Donations:</td><td style="padding: 6px 0; color: #1e293b; font-weight: 600; color: #dc2626;">${donationCount} ${donationCount === 1 ? 'donation' : 'donations'} 🎉</td></tr>
      </table>
    </div>

    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 0 0 25px 0; text-align: center; border: 1px solid #fecaca;">
      <p style="color: #b91c1c; font-size: 18px; font-weight: 700; margin: 0;">❤️ Your donation can save up to 3 lives! ❤️</p>
    </div>

    <p style="margin: 0 0 15px 0; color: #52525b;"><strong>What happens next?</strong><br>Your blood will be tested, processed, and made available to patients in need. You've earned <strong>50 points</strong> for this donation!</p>
    <p style="margin: 0 0 30px 0; color: #52525b;">Remember to stay hydrated and take care of yourself. You'll be eligible to donate again in about 3 months.</p>

    <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 25px;">
      <p style="color: #6b7280; font-style: italic; margin: 0;">"The blood you donate gives someone another chance at life."</p>
    </div>
  `;
  const html = buildEmailTemplate('You\'re a Lifesaver! 🩸', content, '#dc2626');
  return sendEmail(to, subject, html);
};

export const sendCertificateEmail = async (
  to: string,
  donorName: string,
  date: string,
  patientName: string,
  pdfBuffer?: Buffer
) => {
  const subject = `🏆 Your Blood Donation Certificate - Thank You ${donorName}!`;
  const content = `
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="font-size: 56px; margin-bottom: 10px;">🏆</div>
      <h2 style="color: #111827; margin: 0; font-size: 24px;">You Are A True Hero!</h2>
    </div>
    
    <p style="margin: 0 0 20px 0; font-size: 18px; color: #18181b; text-align: center;">Dear <strong>${donorName}</strong>,</p>
    
    <p style="margin: 0 0 20px 0; color: #52525b; text-align: center; line-height: 1.6;">In recognition of your selfless act of donating blood for <strong>${patientName}</strong>, we want to express our deepest gratitude.</p>
    
    <p style="margin: 0 0 30px 0; color: #52525b; text-align: center; line-height: 1.6;">Your contribution has directly helped save a life and brought hope in a time of critical need. Your generosity and commitment to humanity do not go unnoticed.</p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="font-size: 32px; margin-bottom: 10px;">📄</div>
      <h4 style="color: #991b1b; margin: 0 0 10px 0; font-size: 18px;">Official Certificate Attached</h4>
      <p style="color: #7f1d1d; margin: 0; font-size: 15px;">We have securely attached an official, high-quality PDF <strong>Certificate of Appreciation</strong> to this email. You can download and print it as a testament to your lifesaving contribution.</p>
    </div>
    
    <p style="margin: 0; color: #52525b; text-align: center; font-size: 15px;">Thank you for standing up when it mattered most.</p>
  `;

  const html = buildEmailTemplate('Certificate of Appreciation', content, '#dc2626');
  const attachments = pdfBuffer ? [{ filename: 'Jeevan-Donation-Certificate.pdf', content: pdfBuffer }] : undefined;

  return sendEmail(to, subject, html, attachments);
};

// Feedback notification email to Admin
export const sendFeedbackNotificationToAdmin = async (
  adminEmail: string,
  donorName: string,
  donorEmail: string,
  bloodBankName: string,
  rating: number,
  experience: string,
  staffBehavior: number,
  cleanliness: number,
  waitTime: string,
  wouldRecommend: boolean,
  comments?: string,
  suggestions?: string
) => {
  const subject = `📋 New Donor Feedback Received - ${rating}/5 Stars`;
  
  const starRating = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  const experienceColors: Record<string, string> = {
    'excellent': '#22c55e',
    'good': '#84cc16',
    'average': '#eab308',
    'poor': '#f97316',
    'bad': '#ef4444'
  };
  
	const content = `
    <div style="margin-bottom: 25px;">
      <h3 style="color: #0f172a; margin: 0 0 15px 0; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; text-transform: uppercase;">Donor Information</h3>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td width="30%" style="padding: 5px 0; color: #64748b;">Name:</td><td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${donorName}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">Email:</td><td style="padding: 5px 0;"><a href="mailto:${donorEmail}" style="color: #2563eb; text-decoration: none;">${donorEmail}</a></td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">Blood Bank:</td><td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${bloodBankName}</td></tr>
      </table>
    </div>

    <div style="margin-bottom: 25px;">
      <h3 style="color: #0f172a; margin: 0 0 15px 0; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; text-transform: uppercase;">Feedback Summary</h3>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="40%" style="padding: 8px 0; color: #64748b;">Overall Rating:</td>
          <td style="padding: 8px 0; font-size: 18px;">${starRating} (${rating}/5)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Experience:</td>
          <td style="padding: 8px 0;">
            <span style="background-color: ${experienceColors[experience] || '#64748b'}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 13px; text-transform: uppercase;">${experience}</span>
          </td>
        </tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Staff Behavior:</td><td style="padding: 8px 0; color: #1e293b;">${'⭐'.repeat(staffBehavior)}${'☆'.repeat(5 - staffBehavior)} (${staffBehavior}/5)</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Cleanliness:</td><td style="padding: 8px 0; color: #1e293b;">${'⭐'.repeat(cleanliness)}${'☆'.repeat(5 - cleanliness)} (${cleanliness}/5)</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Wait Time:</td><td style="padding: 8px 0; color: #1e293b; text-transform: capitalize;">${waitTime.replace('-', ' ')}</td></tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Would Recommend:</td>
          <td style="padding: 8px 0;">
            <span style="background-color: ${wouldRecommend ? '#22c55e' : '#ef4444'}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 13px;">${wouldRecommend ? '👍 Yes' : '👎 No'}</span>
          </td>
        </tr>
      </table>
    </div>

    ${comments ? `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #0f172a; margin: 0 0 10px 0; font-size: 15px;">💬 Comments</h3>
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; color: #334155; line-height: 1.5; border-left: 3px solid #cbd5e1;">${comments}</div>
    </div>
    ` : ''}

    ${suggestions ? `
    <div style="margin-bottom: 25px;">
      <h3 style="color: #0f172a; margin: 0 0 10px 0; font-size: 15px;">💡 Suggestions</h3>
      <div style="background-color: #fef9c3; padding: 15px; border-radius: 8px; color: #854d0e; line-height: 1.5; border-left: 3px solid #facc15;">${suggestions}</div>
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #64748b; font-size: 14px; margin: 0;">Please log in to the admin dashboard to review all feedback.</p>
    </div>
  `;
  
  const html = buildEmailTemplate('New Donor Feedback', content, '#2563eb');
  return sendEmail(adminEmail, subject, html);
};
