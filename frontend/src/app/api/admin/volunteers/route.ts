import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Volunteer from "@/models/Volunteer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const range = searchParams.get("range");
    const parsedDays = Number(daysParam);
    const shouldApplyDateFilter = range !== "all" && Number.isFinite(parsedDays) && parsedDays > 0;

    const query: any = {};
    if (shouldApplyDateFilter) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parsedDays);
      query.createdAt = { $gte: cutoffDate };
    }

    const volunteers = await Volunteer.find(query).sort({ createdAt: -1 });
    return NextResponse.json(volunteers);
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
