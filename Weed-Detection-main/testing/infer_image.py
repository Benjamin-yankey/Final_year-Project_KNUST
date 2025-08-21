import argparse
import base64
import json
import os
import sys
import time
from collections import Counter

import cv2
import numpy as np


def resolve_path(relative_path: str) -> str:
	"""Resolve a path relative to this script's directory."""
	script_dir = os.path.dirname(os.path.abspath(__file__))
	return os.path.join(script_dir, relative_path)


def load_yolo(config_path: str, weights_path: str):
	if not os.path.exists(config_path):
		raise FileNotFoundError(f"YOLO config not found: {config_path}")
	if not os.path.exists(weights_path):
		raise FileNotFoundError(
			f"YOLO weights not found: {weights_path}. Please place weights in the 'testing' folder as crop_weed_detection.weights"
		)
	return cv2.dnn.readNetFromDarknet(config_path, weights_path)


def get_output_layers(net) -> list:
	layer_names = net.getLayerNames()
	try:
		# OpenCV >= 4.2 returns array of arrays
		return [layer_names[i[0] - 1] for i in net.getUnconnectedOutLayers()]
	except Exception:
		# Fallback for different return types
		return [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]


def annotate_and_serialize(image: np.ndarray, boxes, class_ids, confidences, labels):
	for idx in range(len(boxes)):
		x, y, w, h = boxes[idx]
		label_idx = class_ids[idx]
		label = labels[label_idx] if 0 <= label_idx < len(labels) else str(label_idx)
		confidence = confidences[idx]
		# Color by class id
		color = (int(37 * (label_idx + 3) % 255), int(17 * (label_idx + 7) % 255), int(29 * (label_idx + 11) % 255))
		cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
		cv2.putText(
			image,
			f"{label}:{confidence:.2f}",
			(x, y - 10 if y - 10 > 10 else y + 20),
			cv2.FONT_HERSHEY_SIMPLEX,
			0.6,
			color,
			2,
		)

	# Encode annotated image to base64 (JPEG)
	success, buffer = cv2.imencode('.jpg', image)
	if not success:
		raise RuntimeError("Failed to encode annotated image")
	return base64.b64encode(buffer.tobytes()).decode('utf-8')


def run_inference(image_path: str, config_path: str, weights_path: str, names_path: str, conf_thresh: float = 0.5, nms_thresh: float = 0.5):
	if not os.path.exists(image_path):
		raise FileNotFoundError(f"Input image not found: {image_path}")

	labels = open(names_path).read().strip().splitlines()
	net = load_yolo(config_path, weights_path)
	ln = get_output_layers(net)

	image = cv2.imread(image_path)
	if image is None:
		raise ValueError("Failed to read input image. Ensure it is a valid image file.")
	(H, W) = image.shape[:2]

	blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (512, 512), swapRB=True, crop=False)
	net.setInput(blob)
	start_time = time.time()
	layer_outputs = net.forward(ln)
	inference_time_s = time.time() - start_time

	boxes, confidences, class_ids = [], [], []
	for output in layer_outputs:
		for detection in output:
			scores = detection[5:]
			class_id = int(np.argmax(scores))
			confidence = float(scores[class_id])
			if confidence >= conf_thresh:
				box = detection[0:4] * np.array([W, H, W, H])
				(centerX, centerY, width, height) = box.astype("int")
				x = int(centerX - (width / 2))
				y = int(centerY - (height / 2))
				boxes.append([x, y, int(width), int(height)])
				confidences.append(confidence)
				class_ids.append(class_id)

	idxs = cv2.dnn.NMSBoxes(boxes, confidences, conf_thresh, nms_thresh)
	selected = []
	if len(idxs) > 0:
		for i in idxs.flatten():
			selected.append(i)

	final_boxes = [boxes[i] for i in selected]
	final_confs = [float(confidences[i]) for i in selected]
	final_class_ids = [int(class_ids[i]) for i in selected]

	annotated_b64 = annotate_and_serialize(image.copy(), final_boxes, final_class_ids, final_confs, labels)

	detections = []
	for i in range(len(final_boxes)):
		x, y, w, h = final_boxes[i]
		detections.append({
			"label": labels[final_class_ids[i]] if 0 <= final_class_ids[i] < len(labels) else str(final_class_ids[i]),
			"confidence": round(final_confs[i], 4),
			"box": [int(x), int(y), int(w), int(h)]
		})

	counts = Counter([d["label"] for d in detections])
	avg_conf = round(float(np.mean(final_confs)), 4) if final_confs else 0.0

	return {
		"success": True,
		"inference_time_s": round(inference_time_s, 4),
		"num_detections": len(detections),
		"counts": counts,
		"detections": detections,
		"annotated_image_base64": annotated_b64,
		"labels": labels,
		"conf_threshold": conf_thresh,
		"nms_threshold": nms_thresh,
	}


def main():
	parser = argparse.ArgumentParser(description="Weed detection inference on a single image")
	parser.add_argument("--image", required=True, help="Path to input image")
	parser.add_argument("--config", default=resolve_path("crop_weed.cfg"), help="Path to YOLO config")
	parser.add_argument("--weights", default=resolve_path("crop_weed_detection.weights"), help="Path to YOLO weights")
	parser.add_argument("--names", default=resolve_path("obj.names"), help="Path to class names file")
	parser.add_argument("--conf", type=float, default=0.5, help="Confidence threshold")
	parser.add_argument("--nms", type=float, default=0.5, help="NMS threshold")
	args = parser.parse_args()

	try:
		result = run_inference(
			image_path=args.image,
			config_path=args.config,
			weights_path=args.weights,
			names_path=args.names,
			conf_thresh=args.conf,
			nms_thresh=args.nms,
		)
		print(json.dumps(result))
	except Exception as e:
		print(json.dumps({"success": False, "error": str(e)}))
		sys.exit(1)


if __name__ == "__main__":
	main()