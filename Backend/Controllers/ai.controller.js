import * as ai from "../Services/ai.service.js";

// ─────────────────────────────────────────────────────────────
//  GET /ai/get-result?prompt=...
//
//  Protected by:
//    1. authUser middleware     → req.user is populated
//    2. aiHttpRateLimiter       → 20 req / user / hour
// ─────────────────────────────────────────────────────────────
export const getResult = async (req, res) => {
  try {
    const { prompt } = req.query;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    const result = await ai.generateResult(prompt);
    res.send(result);
  } catch (error) {
    console.error("AI Controller Error:", error);
    res.status(500).json({ message: error.message });
  }
};
