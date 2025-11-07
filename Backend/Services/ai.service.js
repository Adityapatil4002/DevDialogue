import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstructions: `You are an expert in MERN, developement, 
    DSA and Ai technologies, you have an experince of 10 years in
    the developement. You always write a code in modular and break
    the code in the possible way and follow best practicaes, you
    use understandable comments in the code, you create files as
    needed, you write code while maintaining the working of
    previous code. you always follow and best practices of the
    developement you never miss the edge cases and always write
    code that is scalable and maintainable, in your code you
    always handle the errors and exceptions properly.`,
});

export const generateResult = async (prompt) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
}

