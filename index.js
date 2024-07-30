const express = require('express');
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
  "BORROWING_1", "BORROWING_2", "BORROWING_3"
];
// Load grammar rules
let grammarRules = loadGrammarJson();

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

// Function to check text against custom rules
const checkTextAgainstRules = (text, rules) => {
  let matches = [];

  rules.forEach(rule => {
    rule.pattern.forEach(pattern => {
      const regex = new RegExp(pattern.regex, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        let replacements = [];
        
        rule.suggestions.forEach(suggestion => {
          const suggestionText = suggestion.text.replace('$1', match[1]);
          if (suggestion.condition) {
            if (eval(`'${match[1]}'.${suggestion.condition}`)) {
              replacements.push({ value: suggestionText });
            }
          } else {
            replacements.push({ value: suggestionText });
          }
        });

        matches.push({
          message: rule.message.replace('$1', match[1]),
          shortMessage: '',
          replacements: replacements,
          offset: match.index,
          length: match[0].length,
          context: {
            text: text,
            offset: match.index,
            length: match[0].length
          },
          sentence: text,
          rule: {
            id: rule.id,
            description: rule.name
          }
        });
      }
    });
  });

  return { matches };
};

// Route for /api/v2/check with POST method
app.post('/api/v2/check', (req, res) => {
  const { text, language } = req.body;

  console.log('Received request:', { text, language });

  if (!text || !language) {
    return res.status(400).json({ error: 'Missing text or language' });
  }

  try {
    const result = checkTextAgainstRules(text, grammarRules);
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
