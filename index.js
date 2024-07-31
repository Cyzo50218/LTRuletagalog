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
    let pattern;
    if (rule.pattern) {
      if (Array.isArray(rule.pattern)) {
        pattern = rule.pattern.map(p => p.regex || p.token?.value).filter(Boolean);
      } else if (typeof rule.pattern === 'object') {
        pattern = [rule.pattern.regex || rule.pattern.token?.value].filter(Boolean);
      }
    } else if (rule.patterns) {
      pattern = rule.patterns.map(p => p.regex).filter(Boolean);
    }

    if (!pattern || pattern.length === 0) {
      console.warn(`No valid pattern found for rule: ${rule.id}`);
      return;
    }

    pattern.forEach(p => {
      const regex = new RegExp(p, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        let suggestions = [];

        if (rule.suggestions) {
          rule.suggestions.forEach(suggestion => {
            if (typeof suggestion === 'string') {
              suggestions.push(suggestion);
            } else if (suggestion.text) {
              let suggestionText = suggestion.text;
              for (let i = 1; i < match.length; i++) {
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
          sentence: text,
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
