import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Camp from "@/models/Camp";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Basic validation
    const requiredFields = ['organizerName', 'organizationName', 'email', 'phone', 'expectedDonors', 'proposedDate', 'venue', 'city'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const newCamp = await Camp.create(body);

    return NextResponse.json(newCamp, { status: 201 });
  } catch (error) {
    console.error("Error creating camp request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const camps = await Camp.find({}).sort({ createdAt: -1 });
        return NextResponse.json(camps);
    } catch (error) {
        console.error("Error fetching camps:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
