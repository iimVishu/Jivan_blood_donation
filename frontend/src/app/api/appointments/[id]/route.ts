import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendAppointmentConfirmationEmail, sendAppointmentRejectionEmail, sendBloodDonationAppreciationEmail } from "@/lib/email";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    // Ensure models are registered for population
    await import("@/models/User");
    await import("@/models/BloodBank");

    const body = await req.json();
    const { status, healthStats, trackingStatus } = body;
    const { id } = await params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    // Allow donor to cancel, hospital/admin to confirm/complete
    if (session.user.role === 'donor' && appointment.donor.toString() !== session.user.id) {
       return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // If completing the appointment, update inventory and donor stats
    if (status === 'completed' && appointment.status !== 'completed') {
      const User = (await import("@/models/User")).default;
      const BloodBank = (await import("@/models/BloodBank")).default;

      const donor = await User.findById(appointment.donor);
      if (donor && donor.bloodGroup) {
        // Update Blood Bank Stock
        await BloodBank.findByIdAndUpdate(appointment.bloodBank, {
          $inc: { [`stock.${donor.bloodGroup}`]: 1 }
        });

        // Update Donor Stats
        await User.findByIdAndUpdate(appointment.donor, {
          $set: { lastDonationDate: new Date() },
          $inc: { donationCount: 1, points: 50 }
        });
      }
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (healthStats) updateData.healthStats = healthStats;
    if (trackingStatus) updateData.trackingStatus = trackingStatus;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('donor', 'name email')
    .populate('bloodBank', 'name address location');

    // Send Email Notifications
    if (updatedAppointment && updatedAppointment.donor && updatedAppointment.donor.email) {
      const donor = updatedAppointment.donor;
      const bank = updatedAppointment.bloodBank;
      
      try {
        if (status === 'confirmed') {
          const addressStr = `${bank.address?.street || ''}, ${bank.address?.city || ''}, ${bank.address?.state || ''} ${bank.address?.zip || ''}`;
          const mapLink = bank.location?.coordinates 
            ? `https://www.google.com/maps/search/?api=1&query=${bank.location.coordinates[1]},${bank.location.coordinates[0]}`
            : '#';
          
          await sendAppointmentConfirmationEmail(
            donor.email,
            donor.name,
            updatedAppointment.date,
            bank.name,
            addressStr,
            mapLink
          );
        } else if (status === 'cancelled' || status === 'rejected') {
          await sendAppointmentRejectionEmail(
            donor.email,
            donor.name,
            updatedAppointment.date,
            bank.name
          );
        } else if (status === 'completed') {
          // Send appreciation email when donation is completed
          const User = (await import("@/models/User")).default;
          const donorData = await User.findById(updatedAppointment.donor._id);
          
          await sendBloodDonationAppreciationEmail(
            donor.email,
            donor.name,
            donorData?.bloodGroup || 'Unknown',
            bank.name,
            updatedAppointment.date,
            donorData?.donationCount || 1
          );
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue execution, don't fail the request just because email failed
      }
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Appointment Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
