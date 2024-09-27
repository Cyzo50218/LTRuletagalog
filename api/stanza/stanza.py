from flask import Flask, request, jsonify
import stanza

# Initialize Stanza pipeline for Filipino
stanza.download('tl')  # Download Filipino language model
nlp = stanza.Pipeline('tl')  # Initialize Filipino pipeline

# Initialize Flask app
app = Flask(__name__)

@app.route('/v2/check/stanza/', methods=['POST'])
def process_text():
    text = request.data.decode('utf-8')
    doc = nlp(text)
    tokens = []
    for sentence in doc.sentences:
        for word in sentence.words:
            tokens.append({'word': word.text, 'pos': word.upos})  # Use upos for universal POS tags
    return jsonify(tokens)

# The handler that Vercel will call
def handler(event, context):
    return app(event, context)
