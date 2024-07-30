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
