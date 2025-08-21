import os
import tempfile
import json
import importlib.util
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.environ.get("MODEL_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "testing")))
INFER_SCRIPT = os.path.join(MODEL_DIR, "infer_image.py")
CONFIG_PATH = os.path.join(MODEL_DIR, "crop_weed.cfg")
WEIGHTS_PATH = os.path.join(MODEL_DIR, "crop_weed_detection.weights")
NAMES_PATH = os.path.join(MODEL_DIR, "obj.names")

# Load run_inference from infer_image.py
if not os.path.exists(INFER_SCRIPT):
	raise FileNotFoundError(f"Inference script not found: {INFER_SCRIPT}")

spec = importlib.util.spec_from_file_location("infer_image", INFER_SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
run_inference = getattr(module, "run_inference")

@app.before_request
def log_request():
	app.logger.info(f"{request.method} {request.path} headers={dict(request.headers)}")

@app.get("/api/health")
def health():
	return jsonify({"status": "OK"}), 200

@app.get("/api/ai-status")
def ai_status():
	return jsonify({
		"files": {
			"infer_image.py": os.path.exists(INFER_SCRIPT),
			"cfg": os.path.exists(CONFIG_PATH),
			"weights": os.path.exists(WEIGHTS_PATH),
			"names": os.path.exists(NAMES_PATH),
		},
		"model_dir": MODEL_DIR
	}), 200

@app.post("/api/detect-image")
def detect_image():
	try:
		if "image" not in request.files:
			return jsonify({"success": False, "message": "No file part 'image'"}), 400
		file = request.files["image"]
		if file.filename == "":
			return jsonify({"success": False, "message": "Empty filename"}), 400

		if not os.path.exists(WEIGHTS_PATH):
			return jsonify({"success": False, "message": f"Weights not found at {WEIGHTS_PATH}"}), 500

		with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1] or ".jpg") as tmp:
			file.save(tmp.name)
			tmp_path = tmp.name

		result = run_inference(
			image_path=tmp_path,
			config_path=CONFIG_PATH,
			weights_path=WEIGHTS_PATH,
			names_path=NAMES_PATH,
			conf_thresh=float(os.environ.get("YOLO_CONF", 0.25)),
			nms_thresh=float(os.environ.get("YOLO_NMS", 0.45)),
		)
		return jsonify(result), 200
	except Exception as e:
		trace = traceback.format_exc()
		app.logger.error(f"Inference error: {e}\n{trace}")
		return jsonify({"success": False, "message": "Inference error", "error": str(e), "trace": trace.splitlines()[-5:]}), 500
	finally:
		try:
			os.remove(locals().get('tmp_path', ''))
		except Exception:
			pass

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=5001, debug=True)