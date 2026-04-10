import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import Request from "@/models/Request";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "30d";

    let dateQuery = {};
    if (range === "30d") {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      dateQuery = { createdAt: { $gte: date } };
    }

    // 1. Blood Group Distribution
    const bloodGroupData = await User.aggregate([
      { $match: { role: "donor", bloodGroup: { $exists: true, $ne: null } } },
      { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 2. Appointments / Donations over time (last 30 days grouping)
    const appointmentsOverTime = await Appointment.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Request Demands by Urgency
    const requestsUrgency = await Request.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$urgency", count: { $sum: 1 } } }
    ]);

    // 4. Role composition
    const roleStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      bloodGroupData: bloodGroupData.map(d => ({ name: d._id, value: d.count })),
      appointmentsOverTime: appointmentsOverTime.map(d => ({ date: d._id, Total: d.total, Completed: d.completed })),
      requestsUrgency: requestsUrgency.map(d => ({ name: d._id, value: d.count })),
      roleStats: roleStats.map(d => ({ name: d._id || "unknown", value: d.count }))
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
