const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Load grammar.xml from /config/grammar.xml
const grammarPath = path.join(__dirname, '..', 'config', 'grammar.xml');
const grammarData = fs.readFileSync(grammarPath, 'utf8');

const LANGUAGE_TOOL_API_URL = 'https://api.languagetool.org/v2/check';

app.post('/api/v2/check', async (req, res) => {
    const { text, language } = req.body;

    try {
        const response = await axios.post(LANGUAGE_TOOL_API_URL, {
            text,
            language,
            customRules: grammarData
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
