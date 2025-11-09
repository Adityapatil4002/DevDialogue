import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",

  // --- FIX: Moved 'systemInstruction' out of 'generationConfig' ---
  generationConfig: {
    responseMimeType: "application/json",
    // 'systemInstruction' was incorrectly placed here
  },

  systemInstruction: `You are an expert in MERN, developement, 
    DSA and Ai technologies, you have an experince of 10 years in
    the developement. You always write a code in modular and break
    the code in the possible way and follow best practicaes, you
    use understandable comments in the code, you create files as
    needed, you write code while maintaining the working of
    previous code. you always follow and best practices of the
    developement you never miss the edge cases and always write
    code that is scalable and maintainable, in your code you
    always handle the errors and exceptions properly.
    You always write code in the way that it is easy to read and

    Examples:

    <example>
    user: Create an express application
    response: {
        "text": "This is your file tree structure of the express server."
        "filetree": {
        "app.js": {
            content: "
            import express from 'express';
            const app = express();

            app.get('/', (req, res) => {
            res.send('Hello World!');
            });
            app.listen(3000, () => {
            console.log('Server listening on port 3000!');
            });
            "
        },
        "package.json": {
            content: "
                "name": "express-app",
                "version": "1.0.0",
              
                "main": "app.js",
                "scripts": {
                "start": "node app.js"
                },
                "keywords": [],
              
                "author": "",
                "license": "ISC",
                "description": "A simple Express application",
                "dependencies": {
                "express": "^4.17.1"
D
                }
            ",
            "buildCommand": {
                mainItem: "npm",
                commands: ["install"],  
            },

            "startCommand": {
                mainItem: "node",
                commands: ["app.js"]
            }
        }

        }

        }
    }
    </example>

    <example>
        user: Hello
        response: {
            "text" : "Hello, How can I help you today?"
}

    </example>

`,
  // --- END OF FIX ---
});

export const generateResult = async (prompt) => {
  console.log(`Sending prompt to Gemini: "${prompt}"`);
  try {
    const result = await model.generateContent(prompt);
    // You are asking for JSON, so you must parse it before returning text
    const response = result.response;
    const jsonString = response.text();
    const parsedJson = JSON.parse(jsonString);

    // Return the text part of the JSON
    return parsedJson.text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return "Sorry, I couldn't process that request.";
  }
};
