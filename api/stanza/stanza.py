from flask import Flask, request, jsonify
import stanza
import os

app = Flask(__name__)

# Ensure the model is downloaded at runtime instead of at deployment
@app.before_first_request
def setup_stanza():
    if not os.path.exists(stanza.models.common.DEFAULT_MODEL_DIR):
        stanza.download('tl')  # Download Filipino language model only when needed
    global nlp
    nlp = stanza.Pipeline('tl')

@app.route('/v2/check/stanza/', methods=['POST'])
def process_text():
    text = request.data.decode('utf-8')
    doc = nlp(text)
    tokens = []
    for sentence in doc.sentences:
        for word in sentence.words:
            tokens.append({'word': word.text, 'pos': word.upos})
    return jsonify(tokens)

def handler(event, context):
    return app(event, context)
