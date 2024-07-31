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
    return result.rules || [];
  } catch (error) {
    console.error('Error reading or parsing grammar.json:', error);
    return [];
  }
};

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
        let suggestions = [];

        rule.suggestions.forEach(suggestion => {
          let suggestionText = suggestion.text;
          if (match[1]) {
            suggestionText = suggestionText.replace('$1', match[1]);
          }

          if (!suggestion.condition || eval(`'${match[1]}'.${suggestion.condition}`)) {
            suggestions.push(suggestionText);
          }
        });

        matches.push({
          message: match[1] ? rule.message.replace('$1', match[1]) : rule.message,
          shortMessage: '',
          replacements: suggestions, // Simplified replacements to suggestions array
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
