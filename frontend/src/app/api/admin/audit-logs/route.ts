import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    await import("@/models/User");

    // Fetch the 100 most recent audit logs
    const logs = await AuditLog.find()
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 })
      .limit(100);

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
