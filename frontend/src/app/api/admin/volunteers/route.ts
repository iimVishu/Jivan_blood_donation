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
    const volunteers = await Volunteer.find({}).sort({ createdAt: -1 });
    return NextResponse.json(volunteers);
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
