import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { SAFE_USER_FIELDS, pickFields, errorResponse } from "@/lib/api-validation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select(SAFE_USER_FIELDS);
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const update = pickFields(body, ['name', 'phone', 'bloodGroup', 'address', 'location', 'isAvailable', 'isAnonymous', 'healthConditions']);

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select(SAFE_USER_FIELDS);

    if (!updatedUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json(updatedUser);
  } catch (error) {
    const { message, status } = errorResponse(error);
    return NextResponse.json({ message }, { status });
  }
}
