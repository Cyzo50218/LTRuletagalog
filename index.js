const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Resolve the path to grammar.xml
const grammarPath = path.join(__dirname, 'config', 'grammar.xml');

// Parse the grammar.xml file
const parseGrammarXml = async (filePath) => {
    try {
        const xmlData = fs.readFileSync(filePath, 'utf8');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);
        console.log('Parsed XML:', result); // Debugging log
        return result.rules.rule || [];
    } catch (error) {
        console.error('Error reading or parsing grammar.xml:', error);
        return [];
    }
};

// Load and parse grammar rules
let grammarRules = [];
parseGrammarXml(grammarPath).then(rules => {
    grammarRules = rules;
});

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
    console.log('Loaded grammar rules:', grammarRules); // Debugging log

    if (!text || !language) {
        return res.status(400).json({ error: 'Missing text or language' });
    }

    try {
        // Convert custom rules to LanguageTool's expected format
        const customRules = grammarRules.map(rule => {
            // Make sure to handle cases where properties might be undefined
            const id = rule.id ? rule.id[0] : '';
            const name = rule.name ? rule.name[0] : '';
            const pattern = rule.pattern ? rule.pattern[0].token.join(' ') : '';
            const message = rule.message ? rule.message[0] : '';
            const example = rule.example ? rule.example[0].correction[0] : '';
            return { id, name, pattern, message, example };
        });

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
        console.error('Error processing request:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
