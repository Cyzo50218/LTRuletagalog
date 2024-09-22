const axios = require("axios");

module.exports = async function handler(req, res) {
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
    const openaiApiKey = process.env.VERCEL_OPENAPI_KEY; // Use your OpenAI API key from environment variables
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not defined');
    }

    // Extract data from the request body
    const { ruleDesc, errorsTextarea, fulltext } = req.body;
    console.log("Extracted data:", { ruleDesc, errorsTextarea, fulltext });
    // Make the request to OpenAI's API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo", // Use the appropriate model
        messages: [
          {
            role: "user",
            content: `Recreate the tagalog sentence that is best for fixing the whole errors on the whole sentence and recreate the tagalog sentence based on the rule and by fixing or changing the words that has been mentioned as error: Full text: "${fulltext}". and the errors mentioned: ""${errorsTextarea}" and based on the rule or description: "${ruleDesc}"? `
          }
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const bestSuggestion = response.data.choices[0].message.content; // Extract the best suggestion
    console.log("Best suggestion:", bestSuggestion);

    // Send the best suggestion as the response
    res.status(200).json({ bestSuggestion });
  } catch (error) {
    // Log any errors and send a 500 response
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: "Failed to generate suggestion" });
  }
};
