// Backend/debug-ai.js
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function testConnection() {
  console.log("--- DEBUGGING AI CONNECTION ---");

  // 1. Check if Key exists
  const key = process.env.GOOGLE_AI_KEY;
  if (!key) {
    console.error("❌ ERROR: GOOGLE_AI_KEY is missing from process.env");
    console.error("   -> Check your .env file location and spelling.");
    return;
  }

  console.log(
    `✅ API Key detected: ${key.substring(0, 8)}... (Length: ${key.length})`
  );

  // 2. Try to verify the model availability using raw Fetch (bypassing SDK quirks)
  console.log("\n--- TESTING RAW API ACCESS ---");
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("❌ API REQUEST FAILED:");
      console.error(JSON.stringify(data.error, null, 2));
    } else {
      console.log("✅ API Connection Successful! Available Models:");
      const modelNames = data.models.map((m) => m.name.replace("models/", ""));
      console.log(modelNames.join(", "));

      // Check if our desired models exist
      if (modelNames.includes("gemini-1.5-flash")) {
        console.log("\n✅ 'gemini-1.5-flash' IS available.");
      } else {
        console.log("\n⚠️ 'gemini-1.5-flash' is NOT in the list.");
      }
    }
  } catch (err) {
    console.error("❌ NETWORK ERROR:", err.message);
  }
}

testConnection();
