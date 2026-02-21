from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import tempfile
from werkzeug.utils import secure_filename
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
cors_origin_raw = os.getenv(
    "CORS_ORIGIN",
    "http://localhost:5173,https://care-sentry-ai.vercel.app",
)
origins = [o.strip() for o in cors_origin_raw.split(",") if o.strip()]
CORS(app, resources={r"/*": {"origins": origins}})

github_api_key = os.getenv("GITHUB_API_KEY")

# Authenticate with GitHub Models API
client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key=github_api_key,
)

def encode_image(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

@app.route('/',methods=["GET"])
def home():
    return "<h1>Hello, this is Flask Pythonic Backend responding</h1>"


@app.route('/health', methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "service": "ocr",
    }), 200

@app.route('/extract', methods=['POST'])
def extract():
    try:
        # Expecting multipart/form-data with field 'image'
        if 'image' not in request.files:
            return jsonify({"error": "image file is required"}), 400
        image_file = request.files['image']
        temp_dir = tempfile.gettempdir()
        filename = secure_filename(image_file.filename or 'upload.jpg')
        tmp_path = os.path.join(temp_dir, filename)
        image_file.save(tmp_path)
        base64_image = encode_image(tmp_path)

        response = client.chat.completions.create(
            model="openai/gpt-4o",
            messages=[
                {"role": "system", "content": "You are a medical OCR assistant. Extract prescriptions from images and return structured JSON with medicine, dosage, frequency, and time."},
                {"role": "user", "content": [
                    {"type": "text", "text": "Extract prescription details from this image."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]}
            ],
            temperature=0
        )

        content = response.choices[0].message.content
        return jsonify({"result": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", "5000"))
    app.run(host='0.0.0.0', port=port)
