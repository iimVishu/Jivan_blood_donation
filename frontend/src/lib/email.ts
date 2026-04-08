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
  const subject = '📅 Appointment Confirmed - Jeevan Blood Donation';
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">✅ Appointment Confirmed</h1>
      </div>
      
      <div style="padding: 40px 30px; background-color: #f9fafb;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear <strong>${donorName}</strong>,</p>
        
        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
          Your blood donation appointment has been successfully scheduled and confirmed. Here are the details of your upcoming visit:
        </p>
        
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-left: 5px solid #16a34a; padding: 25px; border-radius: 8px; margin: 30px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: collapse; color: #374151;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 30%; font-size: 15px;">🗓️ Date:</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 15px;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">🏥 Center:</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 15px;">${bloodBankName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">📍 Address:</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 15px; line-height: 1.4;">${address}</td>
            </tr>
          </table>
          
          <div style="margin-top: 25px; text-align: center;">
            <a href="${locationLink}" target="_blank" style="display: inline-block; background-color: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; transition: all 0.2s;">
              📍 View Center on Map
            </a>
          </div>
        </div>

        <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
          <h4 style="color: #b45309; margin: 0 0 10px 0; font-size: 16px;">Important Reminders:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.6;">
            <li>Please arrive <strong>10 minutes early</strong> to complete the registration.</li>
            <li>Remember to bring a valid government ID.</li>
            <li>Stay well-hydrated and eat a healthy, light meal before donating.</li>
          </ul>
        </div>
        
        <p style="color: #4b5563; font-size: 16px; margin-bottom: 0;">
          Together, we are making a difference. Thank you for your commitment to saving lives!
        </p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px 0;">Warm regards,</p>
        <p style="color: #374151; font-weight: bold; font-size: 15px; margin: 0 0 15px 0;">Team Jeevan</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Jeevan Blood Donation. All rights reserved.
        </p>
      </div>
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
  const subject = '⚠️ Appointment Update - Jeevan Blood Donation';
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Appointment Update</h1>
      </div>
      
      <div style="padding: 40px 30px; background-color: #f9fafb;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear <strong>${donorName}</strong>,</p>
        
        <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
          We are writing to inform you about an update regarding your blood donation appointment scheduled for <strong>${new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</strong> at <strong>${bloodBankName}</strong>. 
          Unfortunately, this appointment has been <strong>cancelled</strong>.
        </p>
        
        ${reason ? `
        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #991b1b; margin: 0 0 8px 0; font-size: 15px;">Reason for Cancellation:</h4>
          <p style="color: #7f1d1d; margin: 0; font-size: 15px;">${reason}</p>
        </div>
        ` : ''}
        
        <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin: 25px 0;">
          We sincerely apologize for any inconvenience this may cause you. Your willingness to help the community is deeply appreciated, and we would love to see you soon.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/donor" style="background-color: #ef4444; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
            Reschedule Appointment
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 15px; text-align: center; margin-bottom: 0;">
          Thank you for your patience and understanding.
        </p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px 0;">Best regards,</p>
        <p style="color: #374151; font-weight: bold; font-size: 15px; margin: 0 0 15px 0;">Team Jeevan</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Jeevan Blood Donation. All rights reserved.
        </p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
};

export const sendDonationThankYouEmail = async (
  to: string,
  amount: number,
  paymentId: string
) => {
  const subject = '💝 Thank You for Your Generous Support - Jeevan Blood Donation';
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); padding: 35px 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 15px;">💌</div>
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Thank You For Your Support!</h1>
      </div>
      
      <div style="padding: 40px 30px; background-color: #f9fafb;">
        <p style="font-size: 18px; color: #1e293b; margin-bottom: 25px; text-align: center; font-weight: 600;">
          Your kindness fuels our mission.
        </p>
        
        <p style="color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center;">
          We are deeply grateful to inform you that we have successfully received your generous monetary donation of <strong>₹${amount.toLocaleString('en-IN')}</strong>.
        </p>
        
        <div style="background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 25px; margin: 35px 0; display: flex; flex-direction: column; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <h3 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; text-align: center;">Transaction Receipt</h3>
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px dotted #cbd5e1;">
            <span style="color: #64748b; font-size: 14px;">Amount Donated:</span>
            <span style="color: #0f172a; font-weight: 700; font-size: 16px;">₹${amount.toLocaleString('en-IN')}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px dotted #cbd5e1;">
            <span style="color: #64748b; font-size: 14px;">Transaction ID:</span>
            <span style="color: #0f172a; font-weight: 600; font-size: 13px; font-family: monospace;">${paymentId}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #64748b; font-size: 14px;">Date:</span>
            <span style="color: #0f172a; font-weight: 600; font-size: 14px;">${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        <p style="color: #4b5563; line-height: 1.6; font-size: 15px; text-align: center; font-style: italic; background-color: #f1f5f9; padding: 20px; border-radius: 8px;">
          "Your contribution directly helps us organize more lifesaving blood donation camps, upgrade storage facilities, and connect critical patients with blood donors. We truly and deeply appreciate your generosity."
        </p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">With endless gratitude,</p>
        <p style="color: #0f172a; font-weight: 700; font-size: 16px; margin: 0 0 20px 0;">Team Jeevan</p>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Jeevan Blood Donation Organization. All rights reserved.
        </p>
      </div>
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
