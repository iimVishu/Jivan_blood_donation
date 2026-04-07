import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Camp from "@/models/Camp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AuditLog from "@/models/AuditLog";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();
    const { status } = await req.json();

    const camp = await Camp.findById(id);
    if (!camp) {
      return NextResponse.json({ message: "Camp not found" }, { status: 404 });
    }

    const previousState = { status: camp.status };
    camp.status = status;
    await camp.save();

    // Log the action
    await AuditLog.create({
      action: "UPDATE_CAMP_STATUS",
      entityType: "Camp",
      entityId: camp._id,
      performedBy: session.user.id || (session.user as any)._id,
      previousState,
      newState: { status },
      ipAddress: "System",
    });

    return NextResponse.json(camp);
  } catch (error) {
    console.error("Error updating camp:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
