from flask import Flask, request, jsonify, make_response
import stanza
import os
import requests
import zipfile

# Initialize Flask app
app = Flask(__name__)

# Path to store the model in Vercel's environment (temporary storage)
MODEL_DIR = '/tmp/stanza_models/tl'

# Google Cloud Storage URL for your Stanza Tagalog model
GCS_MODEL_URL = 'https://storage.googleapis.com/tamana_bucket/stanza_models/tl.zip'

def download_model_from_gcs():
    """Download the model from Google Cloud Storage if not present locally."""
    if not os.path.exists(MODEL_DIR):
        print("Model not found locally, downloading from Google Cloud Storage...")
        response = requests.get(GCS_MODEL_URL, stream=True)
        zip_path = '/tmp/tl.zip'
        with open(zip_path, 'wb') as f:
            f.write(response.content)
        
        # Unzip the model files
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall('/tmp/stanza_models')

        print("Model downloaded and extracted.")

# Initialize Stanza pipeline for Tagalog
download_model_from_gcs()  # Download model from GCS if necessary
nlp = stanza.Pipeline('tl', model_dir='/tmp/stanza_models')

@app.route('/v2/check/stanza/', methods=['POST'])
def process_text():
    text = request.data.decode('utf-8')
    doc = nlp(text)
    tokens = [{'word': word.text, 'pos': word.upos} for sentence in doc.sentences for word in sentence.words]
    
    response = make_response(jsonify(tokens))
    response.headers['Vary'] = 'Cookie'  # Set the Vary header to avoid caching issues
    return response

def handler(event, context):
    return app(event, context)
