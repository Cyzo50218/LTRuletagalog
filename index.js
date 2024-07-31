const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const grammarPath = path.join(__dirname, 'config', 'grammar.json');

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

let grammarRules = loadGrammarJson();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.send('LanguageTool Proxy Server is running.');
});

const checkTextAgainstRules = (text, rules) => {
  let matches = [];

  rules.forEach(rule => {
    if (!rule.pattern) {
      console.warn(`Rule ${rule.id} has no pattern defined.`);
      return;
    }

    rule.pattern.forEach(patternObj => {
      let regex;
      if (patternObj.token && patternObj.token.value) {
        // If token value is provided, create a regex to match it exactly
        regex = new RegExp(`\\b${patternObj.token.value}\\b`, 'gi');
      } else if (patternObj.regex) {
        // If regex is provided, use it directly
        regex = new RegExp(patternObj.regex, 'gi');
      } else {
        console.warn(`Invalid pattern in rule ${rule.id}`);
        return;
      }

      let match;
      while ((match = regex.exec(text)) !== null) {
        let suggestions = [];

        if (rule.suggestions) {
          rule.suggestions.forEach(suggestion => {
            if (typeof suggestion === 'string') {
              suggestions.push(suggestion);
            } else if (suggestion.text) {
              let suggestionText = suggestion.text;
              for (let i = 0; i < match.length; i++) {
                suggestionText = suggestionText.replace(`$${i}`, match[i] || '');
              }
              suggestions.push(suggestionText);
            }
          });
        }

        matches.push({
          message: rule.message,
          shortMessage: rule.name || '',
          replacements: suggestions,
          offset: match.index,
          length: match[0].length,
          context: {
            text: text.slice(Math.max(0, match.index - 20), match.index + match[0].length + 20),
            offset: Math.min(20, match.index),
            length: match[0].length
          },
          sentence: text.slice(
            Math.max(0, text.lastIndexOf('.', match.index) + 1),
            text.indexOf('.', match.index + match[0].length) + 1
          ),
          rule: {
            id: rule.id,
            description: rule.description || rule.name
          }
        });
      }
    });
  });

  return { matches };
};
app.post('/api/v2/check', (req, res) => {
  const { text, language } = req.body;

  console.log('Received text:', text);
  console.log('Received language:', language);

  if (!text || !language) {
    return res.status(400).json({ error: 'Missing text or language' });
  }

  try {
    console.log('Number of grammar rules:', grammarRules.length);
    const result = checkTextAgainstRules(text, grammarRules);
    console.log('Number of matches found:', result.matches.length);
    console.log('Check result:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
