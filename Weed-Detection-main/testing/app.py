from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import os
import time
import base64
from collections import Counter
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, origins="*", allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

@app.route('/')
def serve_html():
    return send_from_directory('.', 'crop_weed_detector.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# Your existing YOLO setup
labelsPath = 'obj.names'
LABELS = open(labelsPath).read().strip().split("\n")

weightsPath = 'crop_weed_detection.weights'
configPath = 'crop_weed.cfg'
COLORS = np.random.randint(0, 255, size=(len(LABELS), 3), dtype="uint8")

print("[INFO] Loading YOLO model...")
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

def process_image(image_path):
    """Process single image with YOLO detection"""
    image = cv2.imread(image_path)
    if image is None:
        return None, None
    
    (H, W) = image.shape[:2]
    
    # Create blob & forward pass
    blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (512, 512), swapRB=True, crop=False)
    net.setInput(blob)
    start = time.time()
    layerOutputs = net.forward(ln)
    end = time.time()
    
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
    
    detections = []
    
    # Draw boxes and collect detection data
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
            
            detections.append({
                'name': detected_label.capitalize(),
                'confidence': float(accuracy),
                'type': 'crop' if any(word in detected_label.lower() for word in ['crop', 'wheat', 'corn', 'soybean', 'rice', 'plant']) else 'weed',
                'bbox': [x, y, w, h]
            })
    
    return image, detections

@app.route('/detect', methods=['POST', 'OPTIONS'])
def detect_objects():
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        temp_path = f"temp_{filename}"
        file.save(temp_path)
        
        # Process image with YOLO
        processed_image, detections = process_image(temp_path)
        
        if processed_image is None:
            os.remove(temp_path)
            return jsonify({'error': 'Could not process image'}), 400
        
        # Convert processed image to base64
        _, buffer = cv2.imencode('.jpg', processed_image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Summary statistics
        summary = Counter([d['type'] for d in detections])
        
        result = {
            'filename': filename,
            'detections': detections,
            'summary': dict(summary),
            'total_detections': len(detections),
            'processing_time': 0.5,  # You can add actual timing
            'processed_image': image_base64
        }
        
        # Clean up
        os.remove(temp_path)
        
        response = jsonify(result)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Error: {str(e)}")  # Debug print
        error_response = jsonify({'error': str(e)})
        error_response.headers.add('Access-Control-Allow-Origin', '*')
        return error_response, 500

@app.route('/')
def index():
    return '''
    <!DOCTYPE html>
    <html>
    <head><title>Crop Detection</title></head>
    <body>
        <h1>Crop & Weed Detection</h1>
        <input type="file" id="fileInput" multiple accept=".jpg,.jpeg,.png">
        <button onclick="uploadFiles()">Upload & Detect</button>
        <div id="results"></div>
        
        <script>
        async function uploadFiles() {
            const files = document.getElementById('fileInput').files;
            const results = document.getElementById('results');
            results.innerHTML = '<h3>Processing...</h3>';
            
            for (let file of files) {
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                    const response = await fetch('/detect', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    results.innerHTML += `
                        <div style="margin: 20px; padding: 20px; border: 1px solid #ccc;">
                            <h3>${result.filename}</h3>
                            <img src="data:image/jpeg;base64,${result.processed_image}" style="max-width: 500px;">
                            <p>Detections: ${result.total_detections}</p>
                            <ul>
                                ${result.detections.map(d => `<li>${d.name}: ${(d.confidence*100).toFixed(1)}% (${d.type})</li>`).join('')}
                            </ul>
                        </div>
                    `;
                } catch (error) {
                    results.innerHTML += `<p>Error processing ${file.name}: ${error}</p>`;
                }
            }
        }
        </script>
    </body>
    </html>
    '''

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'YOLO model ready'})

if __name__ == '__main__':
    print("🌱 Crop & Weed Detection Server Starting...")
    print("📍 Server will run on: http://localhost:5000")
    app.run(debug=True, port=5000)