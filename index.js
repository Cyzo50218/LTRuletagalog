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
        // Exact match for tokens
        regex = new RegExp(`\\b${patternObj.token.value}\\b`, 'gi');
      } else if (patternObj.regex) {
        // Regex pattern
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

        // Check for repeated words without space and handle accordingly
        if (rule.id === "PAGUULIT_E") {
          const repeatedWithoutSpacePattern = /\b(\w+)\1\b/;
          const textWithoutSpaces = text.replace(/\s+/g, '');

          if (repeatedWithoutSpacePattern.test(textWithoutSpaces)) {
            // Skip if it involves repeated words without space
            continue;
          }
        }else if (rule.id === "PAGUULIT_O") {
          const repeatedWithoutSpacePattern = /\b(\w+)\1\b/;
          const textWithoutSpaces = text.replace(/\s+/g, '');

          if (repeatedWithoutSpacePattern.test(textWithoutSpaces)) {
            // Skip if it involves repeated words without space
            continue;
          }
        }

        // Handle Spanish word exceptions
        if (rule.id.startsWith("ESPANYOL1")) {
          const espanyolPattern = new RegExp(`\\b${match[0]}\\b`, 'i');
          if (espanyolPattern.test(text)) {
            suggestions = rule.suggestions; // Use the suggestions from the rule
          }
        }else if (rule.id.startsWith("ESPANYOL2")) {
  const espanyolPattern = new RegExp(`\\b${match[0]}\\b`, 'i');
  if (espanyolPattern.test(text)) {
    suggestions = rule.suggestions; // Use the suggestions from the rule
  }
} else if (rule.id.startsWith("ESPANYOL3")) {
          const espanyolPattern = new RegExp(`\\b${match[0]}\\b`, 'i');
          if (espanyolPattern.test(text)) {
            suggestions = rule.suggestions; // Use the suggestions from the rule
          }
        }else if (rule.id.startsWith("ESPANYOL4")) {
  const espanyolPattern = new RegExp(`\\b${match[0]}\\b`, 'i');
  if (espanyolPattern.test(text)) {
    suggestions = rule.suggestions; // Use the suggestions from the rule
  }
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



app.post('/api/v2/check', async (req, res) => {
  const { text, language } = req.body;

  console.log('Received text:', text);
  console.log('Received language:', language);

  if (!text || !language) {
    return res.status(400).json({ error: 'Missing text or language' });
  }

  try {
    // Check if grammarRules is defined and is an array
    if (!Array.isArray(grammarRules)) {
      throw new Error('grammarRules is not an array or is undefined');
    }

    console.log('Number of grammar rules:', grammarRules.length);

    const result = checkTextAgainstRules(text, grammarRules);

    if (result.matches && result.matches.length > 0) {
      console.log('Number of matches found:', result.matches.length);
      console.log('Check result:', JSON.stringify(result, null, 2));
      return res.json(result);
    } else {
      console.log('No matches found. Looking up Language Tool API...')
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
