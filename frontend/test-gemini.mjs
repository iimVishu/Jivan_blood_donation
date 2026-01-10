import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success:", result.response.text());
  } catch (error) {
    console.error("Error details:", error);
  }
}

listModels();
