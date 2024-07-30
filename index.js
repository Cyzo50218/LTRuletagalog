const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Resolve the correct path to grammar.xml
const grammarPath = path.join(__dirname, 'config', 'grammar.xml');
if (!fs.existsSync(grammarPath)) {
    console.error(`Grammar file not found at path: ${grammarPath}`);
    process.exit(1);
}
const grammarData = fs.readFileSync(grammarPath, 'utf8');

const LANGUAGE_TOOL_API_URL = 'https://api.languagetool.org/v2/check';

app.post('/v2/check', async (req, res) => {
    const { text, language } = req.body;

    try {
        const response = await axios.post(LANGUAGE_TOOL_API_URL, {

                                          
