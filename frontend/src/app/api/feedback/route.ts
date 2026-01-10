import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback";
import Appointment from "@/models/Appointment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendFeedbackNotificationToAdmin } from "@/lib/email";

// Get feedback for a user's appointments
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');
    const isAdmin = session.user.role === 'admin';

    // If admin is requesting all feedback
    if (isAdmin && searchParams.get('all') === 'true') {
      const feedbacks = await Feedback.find({})
        .populate('donor', 'name email bloodGroup phone')
        .populate({
          path: 'appointment',
          populate: { path: 'bloodBank', select: 'name address' }
        })
        .sort({ createdAt: -1 });
      return NextResponse.json(feedbacks);
    }

    if (appointmentId) {
      // Get feedback for specific appointment
      const feedback = await Feedback.findOne({ appointment: appointmentId, donor: session.user.id });
      return NextResponse.json(feedback);
    }

    // Get all feedback for user
    const feedbacks = await Feedback.find({ donor: session.user.id })
      .populate('appointment', 'date bloodBank status')
      .sort({ createdAt: -1 });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

// Submit feedback for a donation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { appointmentId, rating, experience, staffBehavior, cleanliness, waitTime, wouldRecommend, comments, suggestions } = body;

    // Validate required fields
    if (!appointmentId || !rating || !experience || !staffBehavior || !cleanliness || !waitTime || wouldRecommend === undefined) {
      return NextResponse.json({ error: "All feedback fields are required" }, { status: 400 });
    }

    // Verify appointment belongs to user and is completed
    const BloodBank = (await import("@/models/BloodBank")).default;
    const User = (await import("@/models/User")).default;
    
    const appointment = await Appointment.findOne({ 
      _id: appointmentId, 
      donor: session.user.id,
      status: 'completed'
    }).populate('bloodBank', 'name');

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or not completed" }, { status: 404 });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ appointment: appointmentId });
    if (existingFeedback) {
      return NextResponse.json({ error: "Feedback already submitted for this donation" }, { status: 400 });
    }

    // Create feedback
    const feedback = await Feedback.create({
      donor: session.user.id,
      appointment: appointmentId,
      rating,
      experience,
      staffBehavior,
      cleanliness,
      waitTime,
      wouldRecommend,
      comments,
      suggestions
    });

    // Mark appointment as having feedback
    await Appointment.findByIdAndUpdate(appointmentId, { feedbackSubmitted: true });

    // Send feedback notification email to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (adminEmail) {
        const donor = await User.findById(session.user.id);
        const bloodBankName = appointment.bloodBank?.name || 'Unknown Blood Bank';
        
        await sendFeedbackNotificationToAdmin(
          adminEmail,
          donor?.name || session.user.name || 'Anonymous Donor',
          donor?.email || session.user.email || 'No email',
          bloodBankName,
          rating,
          experience,
          staffBehavior,
          cleanliness,
          waitTime,
          wouldRecommend,
          comments,
          suggestions
        );
      }
    } catch (emailError) {
      console.error("Failed to send feedback notification email:", emailError);
      // Don't fail the request just because email failed
    }

    return NextResponse.json(feedback, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Feedback already submitted for this donation" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
