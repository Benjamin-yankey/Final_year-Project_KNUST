import cv2
import os
import numpy as np
import time
from tkinter import Tk, filedialog

# === Load labels and YOLO model ===
labelsPath = 'obj.names'
LABELS = open(labelsPath).read().strip().split("\n")
weightsPath = 'crop_weed_detection.weights'
configPath = 'crop_weed.cfg'

COLORS = np.random.randint(0, 255, size=(len(LABELS), 3), dtype="uint8")
print("[INFO] Loading YOLO from disk...")
net = cv2.dnn.readNetFromDarknet(configPath, weightsPath)

# === Get YOLO output layers ===
ln = net.getLayerNames()
try:
    ln = [ln[i[0] - 1] for i in net.getUnconnectedOutLayers()]
except IndexError:
    ln = [ln[i - 1] for i in net.getUnconnectedOutLayers()]

# === Confidence & threshold parameters ===
CONFIDENCE = 0.5
THRESHOLD = 0.5


Tk().withdraw()  # Hide main tkinter window
video_path = filedialog.askopenfilename(title="Select a video for detection", filetypes=[("MP4 files", "*.mp4"), ("All files", "*.*")])

if not video_path:
    print("No video selected. Exiting...")
    exit()

# To use a webcam instead, uncomment the following line:
cap = cv2.VideoCapture(0)



cap = cv2.VideoCapture(video_path)

# === Main loop ===
while True:
    ret, image = cap.read()
    if not ret:
        print("[INFO] End of video or failed to read.")
        break

    (H, W) = image.shape[:2]
    blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (512, 512), swapRB=True, crop=False)
    net.setInput(blob)
    layerOutputs = net.forward(ln)

    boxes = []
    confidences = []
    classIDs = []

    for output in layerOutputs:
        for detection in output:
            scores = detection[5:]
            classID = np.argmax(scores)
            confidence = scores[classID]
            if confidence > CONFIDENCE:
                box = detection[0:4] * np.array([W, H, W, H])
                (centerX, centerY, width, height) = box.astype("int")
                x = int(centerX - (width / 2))
                y = int(centerY - (height / 2))
                boxes.append([x, y, int(width), int(height)])
                confidences.append(float(confidence))
                classIDs.append(classID)

    idxs = cv2.dnn.NMSBoxes(boxes, confidences, CONFIDENCE, THRESHOLD)

    if len(idxs) > 0:
        for i in idxs.flatten():
            (x, y) = (boxes[i][0], boxes[i][1])
            (w, h) = (boxes[i][2], boxes[i][3])
            color = [int(c) for c in COLORS[classIDs[i]]]
            cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
            label = f"{LABELS[classIDs[i]]}: {confidences[i]:.2f}"
            cv2.putText(image, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            print("Predicted →", LABELS[classIDs[i]])

    cv2.imshow('YOLO Detection', image)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):
        print("[INFO] Quitting...")
        break

cap.release()
cv2.destroyAllWindows()
