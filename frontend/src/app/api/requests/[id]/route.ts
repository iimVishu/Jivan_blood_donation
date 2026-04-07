import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import AuditLog from "@/models/AuditLog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const request = await Request.findById(id).populate("requester", "name email phone");
    
    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { id } = await params;

    const existingReq = await Request.findById(id);
    if (!existingReq) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    // Role-based access control for request status changes
    const statusChanges = ['approved', 'rejected', 'fulfilled'];
    if (body.status && statusChanges.includes(body.status)) {
      // Only admin or hospital can approve/reject/fulfill requests
      if (session.user.role !== 'admin' && session.user.role !== 'hospital') {
        return NextResponse.json(
          { message: "Only administrators or hospitals can change request status" },
          { status: 403 }
        );
      }
    }

    const previousState = { status: existingReq.status };
    
    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    );

    // Create Audit Log if status changed
    if (body.status && body.status !== previousState.status) {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr') || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      await AuditLog.create({
        action: 'STATUS_CHANGED',
        entityType: 'Request',
        entityId: updatedRequest._id,
        performedBy: session.user.id,
        performedByRole: session.user.role,
        previousState,
        newState: { status: updatedRequest.status },
        ipAddress: ip,
        userAgent
      });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("PUT Request error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const request = await Request.findById(id);

    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    // Only allow requester or admin to delete
    if (request.requester.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Request.findByIdAndDelete(id);

    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
