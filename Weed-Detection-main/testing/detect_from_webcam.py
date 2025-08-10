import cv2
import numpy as np
import time
import os

# === CONFIG ===
CONFIDENCE_THRESHOLD = 0.5
NMS_THRESHOLD = 0.4
INPUT_WIDTH = 512
INPUT_HEIGHT = 512
YOLO_CONFIG = "crop_weed.cfg"
YOLO_WEIGHTS = "crop_weed_detection.weights"
LABELS_PATH = "obj.names"

# === LOAD CLASS LABELS ===
LABELS = open(LABELS_PATH).read().strip().split("\n")
COLORS = np.random.randint(0, 255, size=(len(LABELS), 3), dtype="uint8")

# === LOAD YOLO MODEL ===
print("[INFO] Loading YOLO weights and configuration...")
net = cv2.dnn.readNetFromDarknet(YOLO_CONFIG, YOLO_WEIGHTS)



ln = net.getLayerNames()
ln = [ln[i[0] - 1] if isinstance(i, np.ndarray) else ln[i - 1] for i in net.getUnconnectedOutLayers()]

# === START VIDEO CAPTURE ===
print("[INFO] Accessing webcam...")
cap = cv2.VideoCapture(2)  # Use 0, 1, or 2 depending on your webcam index

if not cap.isOpened():
    raise IOError("ERROR: Cannot access webcam.")

cv2.namedWindow("Real-Time Detection", cv2.WINDOW_NORMAL)

print("[INFO] Starting real-time detection. Press ESC to exit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to read from webcam.")
        break

    # === Brightness Adjustment (Optional) ===
    frame = cv2.convertScaleAbs(frame, alpha=1.5, beta=50)

    (H, W) = frame.shape[:2]

    # === Blob + YOLO Inference ===
    blob = cv2.dnn.blobFromImage(frame, 1 / 255.0, (INPUT_WIDTH, INPUT_HEIGHT), swapRB=True, crop=False)
    net.setInput(blob)

    start = time.time()
    layer_outputs = net.forward(ln)
    end = time.time()

    print(f"\n[INFO] Inference time: {end - start:.2f} seconds")

    boxes, confidences, class_ids = [], [], []

    for output in layer_outputs:
        for detection in output:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]

            if confidence > CONFIDENCE_THRESHOLD:
                box = detection[0:4] * np.array([W, H, W, H])
                (cx, cy, bw, bh) = box.astype("int")
                x = int(cx - bw / 2)
                y = int(cy - bh / 2)

                boxes.append([x, y, int(bw), int(bh)])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    idxs = cv2.dnn.NMSBoxes(boxes, confidences, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)

    if len(idxs) > 0:
        for i in idxs.flatten():
            (x, y, w, h) = boxes[i]
            color = [int(c) for c in COLORS[class_ids[i]]]
            label = f"{LABELS[class_ids[i]]}: {confidences[i]:.2f}"

            # === Draw bounding box and label ===
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            # === Print to terminal ===
            print(f"[DETECTED] {LABELS[class_ids[i]]} with confidence {confidences[i]:.2f} at [{x}, {y}, {w}, {h}]")
    else:
        print("[INFO] No objects detected.")

    # === Show live detection ===
    cv2.imshow("Real-Time Detection", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == 27:  # ESC key
        print("[INFO] Exiting program...")
        break

# === Cleanup ===
cap.release()
cv2.destroyAllWindows()
print("[INFO] Cleanup complete. Goodbye.")
