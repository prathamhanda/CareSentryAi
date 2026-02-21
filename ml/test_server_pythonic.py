from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import tempfile
from werkzeug.utils import secure_filename
from openai import OpenAI
from dotenv import load_dotenv
import traceback
import time

load_dotenv()

app = Flask(__name__)
cors_origin_raw = os.getenv(
    "CORS_ORIGIN",
    "http://localhost:5173,https://cai.pratham.codes/",
)
origins = [o.strip() for o in cors_origin_raw.split(",") if o.strip()]
CORS(app, resources={r"/*": {"origins": origins}})

def _get_api_key():
    # Support common environment variable names across providers.
    # GitHub Models examples frequently use GITHUB_TOKEN.
    return (
        os.getenv("GITHUB_API_KEY")
        or os.getenv("GITHUB_TOKEN")
        or os.getenv("GH_TOKEN")
        or os.getenv("OPENAI_API_KEY")
    )

def _get_api_key_source():
    for name in ("GITHUB_API_KEY", "GITHUB_TOKEN", "GH_TOKEN", "OPENAI_API_KEY"):
        if os.getenv(name):
            return name
    return None

ocr_model = os.getenv("OCR_MODEL", "openai/gpt-4o")

print("[ocr] OCR_MODEL:", ocr_model)
print("[ocr] API key set:", bool(_get_api_key()))

_health_validation_cache = {
    "checked_at": 0.0,
    "valid": None,
    "error": None,
    "source": None,
}

def encode_image(image_path):
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def _mime_from_filename(filename: str) -> str:
    name = (filename or "").lower()
    if name.endswith(".png"):
        return "image/png"
    if name.endswith(".webp"):
        return "image/webp"
    if name.endswith(".gif"):
        return "image/gif"
    return "image/jpeg"

@app.route('/',methods=["GET"])
def home():
    return "<h1>Hello, this is Flask Pythonic Backend responding</h1>"


@app.route('/health', methods=["GET"])
def health():
    api_key = _get_api_key()
    api_key_source = _get_api_key_source()
    now = time.time()

    # Validate the API key by performing a lightweight authenticated request.
    # Cache the result to avoid hitting the upstream service on every health probe.
    cache_ttl_seconds = int(os.getenv("HEALTH_VALIDATE_CACHE_TTL", "300"))
    should_refresh = (
        _health_validation_cache["valid"] is None
        or (now - float(_health_validation_cache["checked_at"] or 0.0)) > cache_ttl_seconds
        or _health_validation_cache.get("source") != api_key_source
    )

    api_key_valid = False
    api_key_error = None

    if not api_key:
        api_key_valid = False
        api_key_error = "API key missing"
    else:
        if should_refresh:
            try:
                client_local = OpenAI(
                    base_url="https://models.github.ai/inference",
                    api_key=api_key,
                )
                # GitHub Models inference endpoint supports chat completions; it does
                # not necessarily expose a models listing endpoint, so we validate
                # the key with a tiny authenticated completion.
                _ = client_local.chat.completions.create(
                    model=ocr_model,
                    messages=[{"role": "user", "content": "healthcheck"}],
                    temperature=0,
                    max_tokens=1,
                )
                _health_validation_cache.update({
                    "checked_at": now,
                    "valid": True,
                    "error": None,
                    "source": api_key_source,
                })
            except Exception as e:
                _health_validation_cache.update({
                    "checked_at": now,
                    "valid": False,
                    "error": str(e),
                    "source": api_key_source,
                })

        api_key_valid = bool(_health_validation_cache["valid"])
        api_key_error = _health_validation_cache.get("error")

    ok = bool(api_key) and bool(api_key_valid)
    status_code = 200 if ok else 503

    payload = {
        "ok": ok,
        "service": "ocr",
        "model": ocr_model,
        "has_api_key": bool(api_key),
        "api_key_source": api_key_source,
        "api_key_valid": bool(api_key_valid) if api_key else False,
    }
    if api_key_error:
        payload["api_key_error"] = str(api_key_error)[:800]
        if "unauthorized" in str(api_key_error).lower() or "401" in str(api_key_error):
            payload["hint"] = (
                "Create a GitHub Personal Access Token with 'models:read' permission "
                "and set it as GITHUB_TOKEN (preferred) or GITHUB_API_KEY on Render, then redeploy."
            )

    return jsonify(payload), status_code

@app.route('/extract', methods=['POST'])
def extract():
    try:
        # Refresh key at request time (useful if env changes between deploys)
        api_key = _get_api_key()
        if not api_key:
            return (
                jsonify({
                    "error": "API key is not set on the server",
                    "hint": "Set GITHUB_TOKEN (preferred) or GITHUB_API_KEY in Render environment variables and redeploy.",
                }),
                500,
            )

        # Expecting multipart/form-data with field 'image'
        if 'image' not in request.files:
            return jsonify({"error": "image file is required", "expected_field": "image"}), 400

        image_file = request.files['image']
        original_name = secure_filename(image_file.filename or 'upload.jpg')
        if not original_name:
            original_name = 'upload.jpg'

        if original_name.lower().endswith('.pdf'):
            return (
                jsonify({
                    "error": "PDF uploads are not supported by this OCR endpoint",
                    "hint": "Export the prescription as an image (JPG/PNG) and upload again.",
                }),
                400,
            )

        suffix = os.path.splitext(original_name)[1] or '.jpg'
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp_path = tmp.name
                image_file.save(tmp_path)
            base64_image = encode_image(tmp_path)
        finally:
            try:
                if tmp_path and os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except Exception:
                pass

        mime = _mime_from_filename(original_name)

        client_local = OpenAI(
            base_url="https://models.github.ai/inference",
            api_key=api_key,
        )

        response = client_local.chat.completions.create(
            model=ocr_model,
            messages=[
                {"role": "system", "content": "You are a medical OCR assistant. Extract prescriptions from images and return structured JSON with medicine, dosage, frequency, and time."},
                {"role": "user", "content": [
                    {"type": "text", "text": "Extract prescription details from this image."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime};base64,{base64_image}"
                        }
                    }
                ]}
            ],
            temperature=0
        )

        content = response.choices[0].message.content
        return jsonify({"result": content})
    except Exception as e:
        print("[ocr] /extract failed:", str(e))
        traceback.print_exc()

        detail = str(e)
        if "unauthorized" in detail.lower() or "401" in detail:
            return jsonify({
                "error": "Unauthorized",
                "hint": "Your GitHub token must have 'models:read' permission (GitHub Models). Update the Render env var and redeploy.",
                "detail": detail,
            }), 401

        return jsonify({
            "error": "OCR request failed",
            "detail": detail,
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", "5000"))
    app.run(host='0.0.0.0', port=port)
