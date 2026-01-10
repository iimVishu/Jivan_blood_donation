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

export const sendEmail = async (to: string, subject: string, html: string) => {
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

export const sendAppointmentConfirmationEmail = async (
  to: string,
  donorName: string,
  date: string,
  bloodBankName: string,
  address: string,
  locationLink: string
) => {
  const subject = 'Appointment Confirmed - Jeevan Blood Donation';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Appointment Confirmed</h2>
      <p>Dear ${donorName},</p>
      <p>Your blood donation appointment has been confirmed.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        <p><strong>Blood Bank:</strong> ${bloodBankName}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Location:</strong> <a href="${locationLink}" target="_blank">View on Map</a></p>
      </div>

      <p>Please arrive 10 minutes early. Remember to stay hydrated and eat a light meal before donating.</p>
      
      <p>Thank you for saving lives!</p>
      <p>Team Jeevan</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

export const sendAppointmentRejectionEmail = async (
  to: string,
  donorName: string,
  date: string,
  bloodBankName: string,
  reason?: string
) => {
  const subject = 'Appointment Update - Jeevan Blood Donation';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Appointment Update</h2>
      <p>Dear ${donorName},</p>
      <p>We regret to inform you that your appointment scheduled for ${new Date(date).toLocaleDateString()} at ${bloodBankName} has been cancelled/rejected.</p>
      
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      
      <p>Please feel free to schedule another appointment at a different time or location.</p>
      
      <p>Thank you for your understanding.</p>
      <p>Team Jeevan</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

export const sendDonationThankYouEmail = async (
  to: string,
  amount: number,
  paymentId: string
) => {
  const subject = 'Thank You for Your Donation - Jeevan Blood Donation';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Thank You for Your Support!</h2>
      <p>Dear Donor,</p>
      <p>We have successfully received your donation of <strong>₹${amount}</strong>.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Transaction ID:</strong> ${paymentId}</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <p>Your contribution helps us organize more blood donation camps and save more lives. We truly appreciate your generosity.</p>
      
      <p>With gratitude,</p>
      <p>Team Jeevan</p>
    </div>
  `;
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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🩸 You're a Lifesaver! 🩸</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; color: #374151;">Dear <strong>${donorName}</strong>,</p>
        
        <p style="color: #4b5563; line-height: 1.6;">
          On behalf of everyone at <strong>Jeevan Blood Donation</strong> and the countless lives you've helped save, 
          we want to express our deepest gratitude for your generous blood donation!
        </p>
        
        <div style="background-color: #ffffff; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #dc2626; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #dc2626; margin-top: 0;">Donation Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Blood Group:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: bold;">${bloodGroup}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Donation Date:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: bold;">${new Date(donationDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Blood Bank:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: bold;">${bloodBankName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Total Donations:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: bold;">${donationCount} ${donationCount === 1 ? 'donation' : 'donations'} 🎉</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
          <p style="color: #dc2626; font-size: 24px; font-weight: bold; margin: 0;">
            ❤️ Your donation can save up to 3 lives! ❤️
          </p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6;">
          <strong>What happens next?</strong><br>
          Your blood will be tested, processed, and made available to patients in need. 
          You've earned <strong>50 points</strong> for this donation!
        </p>
        
        <p style="color: #4b5563; line-height: 1.6;">
          Remember to stay hydrated and take care of yourself. You'll be eligible to donate again in about 3 months.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-style: italic;">"The blood you donate gives someone another chance at life."</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #374151;">
          With heartfelt gratitude,<br>
          <strong style="color: #dc2626;">Team Jeevan</strong>
        </p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
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
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📋 New Donor Feedback</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 10px 10px;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Donor Information</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${donorName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${donorEmail}">${donorEmail}</a></p>
          <p style="margin: 5px 0;"><strong>Blood Bank:</strong> ${bloodBankName}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #374151; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Feedback Summary</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6b7280; width: 40%;">Overall Rating:</td>
              <td style="padding: 10px 0; font-size: 20px;">${starRating} (${rating}/5)</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Experience:</td>
              <td style="padding: 10px 0;">
                <span style="background-color: ${experienceColors[experience] || '#6b7280'}; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; text-transform: capitalize;">
                  ${experience}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Staff Behavior:</td>
              <td style="padding: 10px 0;">${'⭐'.repeat(staffBehavior)}${'☆'.repeat(5 - staffBehavior)} (${staffBehavior}/5)</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Cleanliness:</td>
              <td style="padding: 10px 0;">${'⭐'.repeat(cleanliness)}${'☆'.repeat(5 - cleanliness)} (${cleanliness}/5)</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Wait Time:</td>
              <td style="padding: 10px 0; text-transform: capitalize;">${waitTime.replace('-', ' ')}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Would Recommend:</td>
              <td style="padding: 10px 0;">
                <span style="background-color: ${wouldRecommend ? '#22c55e' : '#ef4444'}; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold;">
                  ${wouldRecommend ? '👍 Yes' : '👎 No'}
                </span>
              </td>
            </tr>
          </table>
        </div>
        
        ${comments ? `
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #374151; margin-top: 0;">💬 Comments</h3>
          <p style="color: #4b5563; line-height: 1.6; background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 0;">${comments}</p>
        </div>
        ` : ''}
        
        ${suggestions ? `
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #374151; margin-top: 0;">💡 Suggestions</h3>
          <p style="color: #4b5563; line-height: 1.6; background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 0;">${suggestions}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 8px;">
          <p style="color: #1d4ed8; margin: 0;">View all feedback in the Admin Dashboard → Feedback Tab</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          This is an automated notification from Jeevan Blood Donation System
        </p>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, subject, html);
};
