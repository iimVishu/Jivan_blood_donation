import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const urgency = searchParams.get("urgency");
    const status = searchParams.get("status");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") || 10000; // default 10km
    const userId = searchParams.get("userId");

    let query: any = {};

    if (userId) query.requester = userId;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius as string),
        },
      };
    }

    const requests = await Request.find(query)
      .populate("requester", "name email phone")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const newRequest = await Request.create({
      ...body,
      requester: session.user.id,
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
