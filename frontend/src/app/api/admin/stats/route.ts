import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BloodBank from "@/models/BloodBank";
import Appointment from "@/models/Appointment";
import Request from "@/models/Request";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [
      totalDonors,
      totalBloodBanks,
      totalAppointments,
      pendingAppointments,
      totalRequests,
      pendingRequests
    ] = await Promise.all([
      User.countDocuments({ role: 'donor' }),
      BloodBank.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'pending' })
    ]);

    return NextResponse.json({
      totalDonors,
      totalBloodBanks,
      totalAppointments,
      pendingAppointments,
      totalRequests,
      pendingRequests
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
