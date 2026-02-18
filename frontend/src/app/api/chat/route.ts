import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import BloodBank from "@/models/BloodBank";
import Appointment from "@/models/Appointment";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { message, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    await dbConnect();

    // Fetch blood banks for context
    const bloodBanks = await BloodBank.find({}, 'name _id address.city');
    const banksContext = bloodBanks.map(b => `${b.name} (ID: ${b._id}, City: ${b.address?.city})`).join("\n");

    const systemPrompt = `
      You are a helpful assistant for a blood donation system.
      Current Date: ${new Date().toISOString().split('T')[0]}
      
      Available Blood Banks:
      ${banksContext}

      You can help users book appointments.
      1. If the user wants to book an appointment, ask for the Blood Bank Name and the Date (YYYY-MM-DD).
      2. If you have both the Blood Bank Name (matched to an ID) and the Date, you MUST output a JSON object strictly in this format:
      
      {"action": "book_appointment", "bloodBankId": "EXACT_ID_FROM_LIST", "date": "YYYY-MM-DD", "bankName": "NAME_OF_BANK"}
      
      Do not include any other text with the JSON. Just the JSON string.
      If the user is just chatting, respond normally.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to assist users with blood donation and appointments." }]
        },
        ...(history || [])
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Check for JSON action
    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
        const actionData = JSON.parse(cleanText);
        
        if (actionData.action === 'book_appointment') {
          if (!session) {
            return NextResponse.json({ response: "I can help you book that, but you need to be logged in first. Please sign in and try again." });
          }

          // Create Appointment
          await Appointment.create({
            donor: session.user.id,
            bloodBank: actionData.bloodBankId,
            date: new Date(actionData.date),
            status: 'pending',
            notes: 'Booked via ChatBot'
          });

          return NextResponse.json({ response: `✅ Success! I have booked your appointment at ${actionData.bankName} for ${actionData.date}.` });
        }
      }
    } catch (e) {
      // Not JSON or failed to parse, treat as normal text
    }

    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Error generating response:", error);
    
    // Handle specific API quota errors
    if (error?.status === 429 || error?.message?.includes('quota')) {
      return NextResponse.json(
        { 
          error: "The AI service is currently at capacity. Please try again in a few moments.",
          response: "I'm experiencing high demand right now. Please try again in a minute or two. 🙏" 
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to generate response",
        response: "I'm having trouble connecting right now. Please try again later." 
      },
      { status: 500 }
    );
  }
}
