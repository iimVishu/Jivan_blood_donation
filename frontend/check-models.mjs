import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Currently the Node SDK doesn't expose listModels directly easily in all versions, 
// but we can try to key off a simple request to a known working model 
// or I can just try to "guess" by checking if gemini-pro works.

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ Success with ${modelName}`);
    } catch (error) {
        console.log(`❌ Failed with ${modelName}: ${error.message.split('\n')[0]}`);
    }
}

async function listModelsFromApi() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Listing models using raw fetch...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => {
                if(m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                     console.log(` - ${m.name} (methods: ${m.supportedGenerationMethods})`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

async function run() {
    // await listModelsFromApi();
    await testModel("gemini-flash-latest");
}

run();
