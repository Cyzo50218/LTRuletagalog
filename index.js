const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Resolve the path to grammar.json
const grammarPath = path.join(__dirname, 'config', 'grammar.json');

// Load and parse grammar.json file
const loadGrammarJson = () => {
  try {
    const jsonData = fs.readFileSync(grammarPath, 'utf8');
    const result = JSON.parse(jsonData);
    console.log('Parsed JSON:', result); // Debugging log
    return result.rules || [];
  } catch (error) {
    console.error('Error reading or parsing grammar.json:', error);
    return [];
  }
};
// Add this constant at the top of your file, after other imports
const enabledRuleIds = [
    "SPELLING_1", "SPELLING_2", "SPELLING_3", "SPELLING_4", "SPELLING_5",
    "ORTHOGRAPHY_1", "ORTHOGRAPHY_2", "ORTHOGRAPHY_3", "ORTHOGRAPHY_4", "ORTHOGRAPHY_5",
    "SYLLABICATION_1", "SYLLABICATION_2", "SYLLABICATION_3", "SYLLABICATION_4", "SYLLABICATION_5",
    "BORROWING_1", "BORROWING_2", "BORROWING_3", "BORROWING_4", "BORROWING_5",
    "REPETITION_1", "REPETITION_2", "REPETITION_3", "REPETITION_4", "REPETITION_5",
    "HYPHENS_1", "HYPHENS_2", "HYPHENS_3", "HYPHENS_4", "HYPHENS_5",
    "PUNCTUATION_1", "PUNCTUATION_2", "PUNCTUATION_3", "PUNCTUATION_4", "PUNCTUATION_5"
];

// Load grammar rules
let grammarRules = loadGrammarJson();

// URL for LanguageTool API
const LANGUAGE_TOOL_API_URL = 'https://api.languagetool.org/v2/check';

// Enable CORS for all routes (optional, useful for testing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Root route for server status
app.get('/', (req, res) => {
  res.send('LanguageTool Proxy Server is running.');
});

// Route for /api/v2/check with POST method
app.post('/api/v2/check', async (req, res) => {
  const { text, language } = req.body;

  console.log('Received request:', { text, language });

  if (!text || !language) {
    return res.status(400).json({ error: 'Missing text or language' });
  }

  try {
    const customRules = grammarRules.map(rule => {
      return {
        id: rule.id || '',
        description: rule.name || '',
        pattern: rule.pattern ? JSON.stringify(rule.pattern) : '',
        message: rule.message || '',
        shortMessage: '',
        url: ''
      };
    });

   
    const requestData = new URLSearchParams({
      text: text,
      language: language,
      enabledRules: enabledRuleIds.join(','), // Join the ids with commas
      disabledRules: ''
    });

    
    const response = await axios.post(LANGUAGE_TOOL_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error processing request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
