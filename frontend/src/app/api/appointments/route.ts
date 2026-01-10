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
    
    let query = {};
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

    const appointments = await Appointment.find(query)
      .populate("bloodBank", "name address")
      .populate("donor", "name bloodGroup phone")
      .sort({ date: 1 });

    return NextResponse.json(appointments);
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
