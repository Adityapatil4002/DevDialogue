import * as ai from "../Services/ai.service.js";

export const getResult = async (req, res) => {
  try {
    const { prompt } = req.query;
    const result = await ai.generateResult(prompt);
    // Result is already an object now, so just send it
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};
