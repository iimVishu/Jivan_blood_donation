import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import BloodBank from "@/models/BloodBank";
import { objectId, errorResponse } from "@/lib/api-validation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordAppointmentUpdate } from "@/lib/discord";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const range = searchParams.get("range");
    const parsedDays = Number(daysParam);
    const shouldApplyDateFilter = range !== "all" && Number.isFinite(parsedDays) && parsedDays > 0;
    
    let query: any = {};
    if (session.user.role === 'donor') {
      query = { donor: session.user.id };
    } else if (session.user.role === 'hospital') {
      const User = (await import("@/models/User")).default;
      const user = await User.findById(session.user.id);
      if (user && (user.hospitalIds?.length > 0 || user.hospitalId)) {
        // Support both new array and legacy single ID
        const ids = user.hospitalIds?.length > 0 ? user.hospitalIds : [user.hospitalId];
        query = { bloodBank: { $in: ids } };
      } else {
        // If hospital user is not linked to a blood bank, return empty or handle error
        return NextResponse.json([]);
      }
    } else if (session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (shouldApplyDateFilter) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parsedDays);
      query.date = { $gte: cutoffDate };
    }

    const appointments = await Appointment.find(query)
      .populate("bloodBank", "name address")
      .populate("donor", "name bloodGroup phone isAnonymous")
      .sort({ date: 1 });

    // Anonymize donor details for privacy compliance if requested by donor
    const processedAppointments = appointments.map((apt) => {
      const aptObj = apt.toObject();
      if ((session.user.role === 'hospital' || session.user.role === 'admin') && aptObj.donor?.isAnonymous) {
        aptObj.donor.name = "Anonymous Donor";
        aptObj.donor.phone = "***-***-****";
      }
      return aptObj;
    });

    return NextResponse.json(processedAppointments);
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== 'donor') {
      return NextResponse.json({ message: 'Only donors can book appointments' }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { bloodBank, date, time, notes } = body;

    if (!bloodBank || !date || !time) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    objectId(bloodBank);
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (!Number.isFinite(appointmentDate.getTime()) || appointmentDate < today || typeof time !== 'string' || !time.trim()) {
      return NextResponse.json({ message: 'Choose a valid upcoming date and time' }, { status: 400 });
    }
    const bank = await BloodBank.findById(bloodBank);
    if (!bank || bank.status === 'Inactive') {
      return NextResponse.json({ message: 'Blood bank is unavailable' }, { status: 400 });
    }

    const newAppointment = await Appointment.create({
      donor: session.user.id,
      bloodBank,
      date: new Date(date),
      timeSlot: time,
      notes: notes || "",
      status: 'pending'
    });

    try {
      const User = (await import("@/models/User")).default;
      const BloodBank = (await import("@/models/BloodBank")).default;
      const donor = await User.findById(session.user.id).select("name bloodGroup");
      const bank = await BloodBank.findById(bloodBank).select("name");

      await sendDiscordAppointmentUpdate({
        title: "New appointment request",
        appointmentId: newAppointment._id.toString(),
        description: "A new blood donation appointment is waiting for admin approval.",
        donorName: donor?.name || "Unknown donor",
        bloodGroup: donor?.bloodGroup || "Not provided",
        appointmentDate: new Date(date),
        appointmentTime: time,
        bloodBankName: bank?.name || "Blood Bank",
        status: "pending",
      });
    } catch (discordError) {
      console.error("Discord notification failed for new appointment:", discordError);
    }

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    const { message, status } = errorResponse(error);
    return NextResponse.json({ message }, { status });
  }
}
