import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodBank from "@/models/BloodBank";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
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
    
    // Check if user is system admin or hospital admin linked to this blood bank
    const bloodBank = await BloodBank.findById(id);
    if (!bloodBank) {
      return NextResponse.json({ message: "Blood Bank not found" }, { status: 404 });
    }

    const isSystemAdmin = session.user.role === 'admin';
    const isHospitalAdmin = session.user.role === 'hospital' && 
      (bloodBank.admins?.includes(session.user.id) || 
       session.user.hospitalIds?.includes(id) ||
       session.user.hospitalId?.toString() === id);
    
    if (!isSystemAdmin && !isHospitalAdmin) {
      return NextResponse.json(
        { message: "You don't have permission to update this blood bank" },
        { status: 403 }
      );
    }
    
    const body = await req.json();

    const updatedBank = await BloodBank.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    );

    if (!updatedBank) {
      return NextResponse.json({ message: "Blood Bank not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBank);
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
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
