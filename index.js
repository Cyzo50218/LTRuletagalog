const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Resolve the correct path to grammar.xml
const grammarPath = path.join(__dirname, 'config', 'grammar.xml');
if (!fs.existsSync(grammarPath)) {
    console.error(`Grammar file not found at path: ${grammarPath}`);
    process.exit(1);
}
const grammarData = fs.readFileSync(grammarPath, 'utf8');

const LANGUAGE_TOOL_API_URL = 'https://api.languagetool.org/v2/check';

// Add a route for the root URL
app.get('/', (req, res) => {
    res.send('LanguageTool Proxy Server is running.');
});

// Add a route for /v2/check
app.post('/v2/check', async (req, res) => {
    const { text, language } = req.body;

    try {
        // Ensure the language code matches the grammar rules
        const response = await axios.post(LANGUAGE_TOOL_API_URL, new URLSearchParams({
            text: text,
            language: language, // Should match the language code in grammar.xml
            customRules: grammarData // Ensure custom rules are correctly formatted
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
        res.json(response.data);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
