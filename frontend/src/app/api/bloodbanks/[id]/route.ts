import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodBank from "@/models/BloodBank";
import User from "@/models/User";
import { objectId, canManageBank, pickFields, errorResponse } from "@/lib/api-validation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    objectId(id);
    const bank = await BloodBank.findById(id);
    if (!bank) {
      return NextResponse.json({ message: "Blood Bank not found" }, { status: 404 });
    }
    return NextResponse.json(bank);
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
    const { id } = await params;
    objectId(id);
    
    // Check if user is system admin or hospital admin linked to this blood bank
    const bloodBank = await BloodBank.findById(id);
    if (!bloodBank) {
      return NextResponse.json({ message: "Blood Bank not found" }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (!user || !canManageBank({ id: session.user.id, role: user.role, hospitalId: user.hospitalId, hospitalIds: user.hospitalIds }, id, bloodBank.admins)) {
      return NextResponse.json(
        { message: "You don't have permission to update this blood bank" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const update = pickFields(body, ['name', 'email', 'phone', 'address', 'location', 'stock', 'status', ...(user.role === 'admin' ? ['admins'] : [])]);

    const updatedBank = await BloodBank.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedBank) {
      return NextResponse.json({ message: "Blood Bank not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBank);
  } catch (error) {
    const { message, status } = errorResponse(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const deletedBank = await BloodBank.findByIdAndDelete(id);

    if (!deletedBank) {
      return NextResponse.json({ message: "Blood Bank not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blood Bank deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
