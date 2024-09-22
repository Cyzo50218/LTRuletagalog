const express = require('express');
const rateLimit = require('express-rate-limit');
const axios = require("axios");

// Create an instance of the rate limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per window (1 minute)
  message: 'Too many requests, please try again later.'
});

const app = express();
app.use(apiLimiter); // Apply rate limiting to all requests

module.exports = async function handler(req, res) {
  console.log("Received request:", req.method, req.body);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const openaiApiKey = process.env.VERCEL_OPENAPI_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not defined');
    }

    const { ruleDesc, errorsTextarea, suggestionText } = req.body;
    console.log("Extracted data:", { ruleDesc, errorsTextarea, suggestionText });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Which is is the best for fixing the error in this text using Tagalog Language and based on its rule: "${errorsTextarea}" and based on the rule: "${ruleDesc}"? `
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

    const bestSuggestion = response.data.choices[0].message.content;
    console.log("Best suggestion:", bestSuggestion);

    res.status(200).json({ bestSuggestion });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    if (error.response && error.response.status === 429) {
      // Specific handling for rate limit errors
      res.status(429).json({ error: 'Too many requests, please try again later.' });
    } else {
      res.status(500).json({ error: "Failed to generate suggestion" });
    }
  }
};
