import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    await import("@/models/User");

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const range = searchParams.get("range");
    const parsedDays = Number(daysParam);
    const shouldApplyDateFilter = range !== "all" && Number.isFinite(parsedDays) && parsedDays > 0;

    const query: any = {};
    if (shouldApplyDateFilter) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parsedDays);
      query.timestamp = { $gte: cutoffDate };
    }

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
