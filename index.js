const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Load grammar.xml
const grammarPath = path.join(__dirname, 'config', 'grammar.xml');
const grammarData = fs.readFileSync(grammarPath, 'utf8');

// Start Ngrok and obtain the public URL
ngrok.connect({ 
    addr: 8010,
    authtoken: process.env.NGROK_AUTHTOKEN // Use environment variable for authtoken
}).then(url => {
    console.log(`Ngrok tunnel opened at: ${url}`);

    app.post('/v2/check', async (req, res) => {
        const { text, language } = req.body;

        try {
            const response = await axios.post(`${url}/v2/check`, {
                text,
                language,
                customRules: grammarData // Send the grammar data to the LanguageTool server
            });

            res.json(response.data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    app.listen(port, () => {
        console.log(`Proxy server running on port ${port}`);
    });
}).catch(error => {
    console.error(`Failed to start Ngrok: ${error.message}`);
    process.exit(1);
});
