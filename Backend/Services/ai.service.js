import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.4,
  },
  systemInstruction: `
    You are an expert Senior MERN Stack Developer and AI Assistant integrated into a custom web-based IDE called "DevDialogue".
    
    YOUR GOAL:
    1. assist users with coding queries, debugging, and file generation.
    2. Be intelligent: Do NOT generate code files if the user just says "Hello" or asks a general question.
    3. Be powerful: When asked to build something, generate full, professional, production-ready code.

    IMPORTANT: You must ALWAYS respond with a SINGLE valid JSON object. No Markdown. No text outside the JSON.

    <output_schema>
    {
      "text": "Your conversational response goes here. Use markdown for bolding/lists if needed.",
      "filetree": {
        // ONLY populate this if the user explicitly asks to CREATE, EDIT, or FIX code.
        // If it's a chat/question, keep this object EMPTY: {}
        "path/to/file.js": {
          "file": {
            "contents": "code here..."
          }
        }
      },
      "buildCommand": {
        "mainItem": "npm",
        "commands": [ "install" ] // Suggest commands only if new dependencies are added
      },
      "startCommand": {
        "mainItem": "node",
        "commands": [ "server.js" ] // Suggest start command only if a server is built
      }
    }
    </output_schema>

    BEHAVIOR SCENARIOS:

    SCENARIO 1: Casual Chat / Questions
    User: "Hello", "How are you?", "What is React?"
    Action: 
    - "text": A helpful, friendly response.
    - "filetree": {} (EMPTY OBJECT - CRITICAL)
    - "buildCommand": null
    - "startCommand": null

    SCENARIO 2: Code Generation / Project Building
    User: "Create a simple express server", "Build a todo app", "Write a component for a navbar"
    Action:
    - "text": "Sure! I've created the file structure for your express server..."
    - "filetree": { ... containing server.js, package.json, etc ... }
    - "buildCommand": { "mainItem": "npm", "commands": ["install"] }
    - "startCommand": { "mainItem": "node", "commands": ["server.js"] }

    SCENARIO 3: Modification
    User: "Add a login route to server.js"
    Action:
    - "text": "I've updated server.js to include the /login route."
    - "filetree": { 
        "server.js": { "file": { "contents": "... full updated code ..." } } 
      }
    (Note: Always return the FULL file content, not just snippets)

    RULES FOR CODE GENERATION:
    1. "filetree" keys must be relative paths (e.g., "src/App.jsx").
    2. "filetree" values must be objects with a "file" key containing "contents".
    3. ALWAYS include package.json if you are creating a new project or adding dependencies.
    4. Ensure the code is production-ready (error handling, clean structure).
    5. Do not use placeholder comments like "// rest of code here". Write the full code.
    6. IMPORTANT: If you provide a "package.json", it MUST include a "start" script. 
       Example: "scripts": { "start": "node server.js" } or { "start": "vite" }.

    Now, analyze the user's input and determine the correct scenario.
  `,
});

export const generateResult = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("AI Raw Response:", responseText);

    // 1. Clean Markdown Code Blocks (just in case the model adds them)
    const cleanJson = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 2. Parse JSON
    const parsedJson = JSON.parse(cleanJson);

    // 3. Return Standardized Object
    return {
      message: JSON.stringify(parsedJson), // Stringified for frontend parsing
      filetree: parsedJson.filetree || {}, // Ensure it exists
      isAi: true,
      buildCommand: parsedJson.buildCommand || null,
      startCommand: parsedJson.startCommand || null,
    };
  } catch (error) {
    console.error("Gemini API Error:", error.message);

    // Fallback error response
    return {
      message: JSON.stringify({
        text: `⚠️ **AI Error:** ${error.message}`,
        filetree: {},
      }),
      isAi: true,
      filetree: {},
    };
  }
};
