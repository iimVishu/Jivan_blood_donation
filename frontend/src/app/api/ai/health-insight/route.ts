import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { hemoglobin, bloodPressure, weight, pulse } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Act as a friendly medical assistant for a blood donor.
      Analyze these health stats recorded after a blood donation:
      - Hemoglobin: ${hemoglobin} g/dL
      - Blood Pressure: ${bloodPressure}
      - Weight: ${weight} kg
      - Pulse: ${pulse} bpm

      Provide a very short (max 2 sentences) personalized health tip or positive reinforcement based on these numbers. 
      Focus on nutrition or hydration if any value is borderline, otherwise give a general "Keep it up!" message.
      Do not give medical advice or diagnosis. Keep it encouraging.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ insight: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate insight" },
      { status: 500 }
    );
  }
}
