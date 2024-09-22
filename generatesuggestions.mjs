const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
    // Log the incoming request for debugging
  console.log("Received request:", req.method, req.body);

  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const googleapikey;
    // Ensure the environment variable is defined
    if (!process.env.VERCEL_GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not defined');
    }

googleapikey = "AIzaSyBAkDBEZfYMkZMedcNgWklhAWhEPbDrAbs";

    const genAI = new GoogleGenerativeAI({ apiKey: googleapikey });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Extract data from the request body
    const { ruleDesc, errorsTextarea, suggestionText } = req.body;
    console.log("Extracted data:", { ruleDesc, errorsTextarea, suggestionText });

    // Make the request to Gemini AI
    const result = await model.generateContent([
      `Which of these suggestions is the best for fixing the error in this text: "${errorsTextarea}" based on the rule: "${ruleDesc}"?`,
      suggestionText.join(', ')
    ]);

    const bestSuggestion = result.response.text();
    console.log("Best suggestion:", bestSuggestion);

    // Send the best suggestion as the response
    res.status(200).json({ bestSuggestion });
  } catch (error) {
    // Log any errors and send a 500 response
    console.error("Error calling Gemini AI:", error);
    res.status(500).json({ error: "Failed to generate suggestion" });
  }
}
