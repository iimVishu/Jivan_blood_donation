import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch top 10 donors sorted by points
    const topDonors = await User.find({ role: "donor" })
      .sort({ points: -1, donationCount: -1 })
      .limit(10)
      .select("name points donationCount bloodGroup");

    return NextResponse.json(topDonors);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
