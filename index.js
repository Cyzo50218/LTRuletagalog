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
        const customRules = grammarRules.map(rule => {
            return {
                id: rule.id || '',
                description: rule.name || '',
                pattern: rule.pattern ? JSON.stringify(rule.pattern) : '',
                message: rule.message || '',
                shortMessage: '',
                url: '',
                category: rule.category || {
                    id: 'CUSTOM',
                    name: 'Custom Rules'
                }
            };
        });

        console.log('Grammar rules:', JSON.stringify(grammarRules, null, 2));
        console.log('Custom rules:', JSON.stringify(customRules, null, 2));

        const requestData = new URLSearchParams({
            text: text,
            language: language,
            enabledOnly: 'false', // This enables all rules
            disabledRules: '',
            disabledCategories: '',
            ...customRules.reduce((acc, rule, index) => {
                acc[`rule_${index}_id`] = rule.id;
                acc[`rule_${index}_description`] = rule.description;
                acc[`rule_${index}_pattern`] = rule.pattern;
                acc[`rule_${index}_message`] = rule.message;
                acc[`rule_${index}_shortMessage`] = rule.shortMessage;
                acc[`rule_${index}_url`] = rule.url;
                acc[`rule_${index}_category`] = JSON.stringify(rule.category);
                return acc;
            }, {})
        });

        console.log('Sending to LanguageTool API:', requestData.toString());

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
