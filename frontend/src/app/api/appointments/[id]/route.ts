import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BloodBank from "@/models/BloodBank";
import { ApiError, objectId, canManageBank, errorResponse } from "@/lib/api-validation";
import { updateAppointmentWorkflow } from "@/lib/appointment-workflow";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    objectId(id);
    const body = await req.json();
    const { status, healthStats, trackingStatus, date, timeSlot } = body;
    await dbConnect();
    const appointment = await Appointment.findById(id).select("donor bloodBank status");

    if (!appointment) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    if (session.user.role === "donor" && appointment.donor.toString() !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (session.user.role === 'donor') {
      if (status !== 'cancelled' || Object.keys(body).some((key) => key !== 'status')) {
        throw new ApiError('Donors can only cancel appointments', 403);
      }
    } else {
      const user = await User.findById(session.user.id);
      const bank = await BloodBank.findById(appointment.bloodBank).select('admins');
      if (!user || !canManageBank({ id: session.user.id, role: user.role, hospitalId: user.hospitalId, hospitalIds: user.hospitalIds }, appointment.bloodBank, bank?.admins)) {
        throw new ApiError('Forbidden', 403);
      }
    }

    const updatedAppointment = await updateAppointmentWorkflow({
      id,
      status,
      trackingStatus,
      healthStats,
      date,
      timeSlot,
      performedBy: session.user.id,
      performedByRole: session.user.role,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("remote-addr") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Appointment Update Error:", error);
    const { message, status } = errorResponse(error);
    return NextResponse.json({ message }, { status });
  }
}
