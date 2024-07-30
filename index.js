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
        // Convert custom rules to LanguageTool's expected format
        const customRules = grammarRules.map(rule => {
            // Make sure to handle cases where properties might be undefined
            const id = rule.id || '';
            const name = rule.name || '';
            const pattern = rule.pattern && rule.pattern.token ? rule.pattern.token.join(' ') : '';
            const message = rule.message || '';
            const example = rule.example ? rule.example.correction : '';
            return { id, name, pattern, message, example };
        });

        console.log('Grammar rules:', JSON.stringify(grammarRules, null, 2));
        console.log('Custom rules:', JSON.stringify(customRules, null, 2));

        const response = await axios.post(LANGUAGE_TOOL_API_URL, new URLSearchParams({
            text: text,
            language: language,
            customRules: JSON.stringify(customRules) // Convert to JSON string
        }), {
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
