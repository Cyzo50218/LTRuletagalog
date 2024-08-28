const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  try {
  
    const genAI = new GoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract data from the request body
    const { ruleDesc, errorsTextarea, suggestionText } = req.body;

    // Make the request to Gemini AI
    const result = await model.generateContent([
      `Which of these suggestions is the best for fixing the error in this text: "${errorsTextarea}" based on the rule: "${ruleDesc}"?`,
      suggestionText.join(', ')
    ]);

    const bestSuggestion = result.response.text();

  
    res.status(200).json({ bestSuggestion });
  } catch (error) {
    console.error("Error calling Gemini AI:", error);
    res.status(500).json({ error: "Failed to generate suggestion" });
  }
}
