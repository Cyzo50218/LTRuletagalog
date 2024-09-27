from flask import Flask, request, jsonify, make_response
import stanza

# Initialize Flask app
app = Flask(__name__)

# Initialize Stanza pipeline for Filipino
stanza.download('tl')
nlp = stanza.Pipeline('tl')

@app.route('/v2/check/stanza/', methods=['POST'])
def process_text():
    text = request.data.decode('utf-8')
    doc = nlp(text)
    tokens = []
    for sentence in doc.sentences:
        for word in sentence.words:
            tokens.append({'word': word.text, 'pos': word.upos})
    
    response = make_response(jsonify(tokens))
    response.headers['Vary'] = 'Cookie'  # Set the Vary header to avoid caching issues
    return response

def handler(event, context):
    return app(event, context)
