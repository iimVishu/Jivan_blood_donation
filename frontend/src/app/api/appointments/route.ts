import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Appointment from "@/models/Appointment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    await dbConnect();
    const body = await req.json();
    const { bloodBank, date, time, notes } = body;

    if (!bloodBank || !date || !time) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newAppointment = await Appointment.create({
      donor: session.user.id,
      bloodBank,
      date: new Date(date),
      timeSlot: time,
      notes: notes || "",
      status: 'pending'
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
