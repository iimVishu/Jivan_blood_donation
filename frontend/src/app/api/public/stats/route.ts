import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import Request from "@/models/Request";
import Camp from "@/models/Camp";

export async function GET() {
  try {
    await dbConnect();

    // Calculate Units Shortage: Sum of 'units' in all pending requests
    const pendingRequests = await Request.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, totalUnits: { $sum: "$units" } } }
    ]);
    const unitsShortage = pendingRequests.length > 0 ? pendingRequests[0].totalUnits : 0;

    // Calculate Units Collected & Annual Supply: Number of completed appointments
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const unitsCollected = completedAppointments;
    const annualSupply = completedAppointments; // Or derive a projection

    // Medical standard: 1 pint of blood can save up to 3 lives.
    const livesSaved = unitsCollected * 3;

    // Camps deployed
    const campsDeployed = await Camp.countDocuments({ status: { $in: ["approved", "completed"] } });

    return NextResponse.json({
      unitsShortage,
      unitsCollected,
      annualSupply,
      livesSaved,
      campsDeployed,
    });
  } catch (error) {
    console.error("Public stats error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
