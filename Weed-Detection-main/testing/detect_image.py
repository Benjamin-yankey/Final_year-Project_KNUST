import cv2
import numpy as np
import time
import os
from collections import Counter
import matplotlib.pyplot as plt

#  Input folder containing images
input_folder = input("Enter path to folder with images: ").strip()

if not os.path.exists(input_folder):
    print(" Folder does not exist. Exiting...")
    exit()

#  Supported image formats
image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff']

#  Output folder
output_folder = "results_detected"
os.makedirs(output_folder, exist_ok=True)

#  Load labels
labelsPath = 'obj.names'
LABELS = open(labelsPath).read().strip().split("\n")

# Load YOLO model
weightsPath = 'crop_weed_detection.weights'
configPath = 'crop_weed.cfg'
COLORS = np.random.randint(0, 255, size=(len(LABELS), 3), dtype="uint8")

print("[INFO]     : Loading YOLO model from disk...")
net = cv2.dnn.readNetFromDarknet(configPath, weightsPath)

# Confidence and threshold
confi = 0.5
thresh = 0.5

# Get YOLO output layers
ln = net.getLayerNames()
try:
    ln = [ln[i[0] - 1] for i in net.getUnconnectedOutLayers()]
except IndexError:
    ln = [ln[i - 1] for i in net.getUnconnectedOutLayers()]

# Process each image in folder
for filename in os.listdir(input_folder):
    if not any(filename.lower().endswith(ext) for ext in image_extensions):
        continue

    image_path = os.path.join(input_folder, filename)
    image = cv2.imread(image_path)
    if image is None:
        print(f" Could not read image: {filename}")
        continue

    print(f"\nProcessing: {filename}")
    (H, W) = image.shape[:2]

    # Create blob & forward pass
    blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (512, 512), swapRB=True, crop=False)
    net.setInput(blob)
    start = time.time()
    layerOutputs = net.forward(ln)
    end = time.time()
    print(f"[INFO]     : YOLO took {end - start:.6f} seconds")

    boxes = []
    confidences = []
    classIDs = []

    for output in layerOutputs:
        for detection in output:
            scores = detection[5:]
            classID = np.argmax(scores)
            confidence = scores[classID]
            if confidence > confi:
                box = detection[0:4] * np.array([W, H, W, H])
                (centerX, centerY, width, height) = box.astype("int")
                x = int(centerX - (width / 2))
                y = int(centerY - (height / 2))
                boxes.append([x, y, int(width), int(height)])
                confidences.append(float(confidence))
                classIDs.append(classID)

    idxs = cv2.dnn.NMSBoxes(boxes, confidences, confi, thresh)

    # Draw boxes
    if len(idxs) > 0:
        for i in idxs.flatten():
            (x, y) = (boxes[i][0], boxes[i][1])
            (w, h) = (boxes[i][2], boxes[i][3])
            detected_label = LABELS[classIDs[i]]
            accuracy = confidences[i]
            color = [int(c) for c in COLORS[classIDs[i]]]

            cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
            text = f"{detected_label.upper()} : {accuracy:.2f}"
            cv2.putText(image, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

            print(f"[OUTPUT]   : {detected_label.upper()} ({accuracy:.2f})")

    # Summary of labels
    if classIDs:
        summary = Counter([LABELS[i] for i in classIDs])
        print("Summary:")
        for label, count in summary.items():
            print(f"  - {label.capitalize()}: {count} detected")

    # Save output
    output_path = os.path.join(output_folder, f"detected_{filename}")
    cv2.imwrite(output_path, image)
    print(f"Saved to: {output_path}")

print("\nBatch detection completed.")
