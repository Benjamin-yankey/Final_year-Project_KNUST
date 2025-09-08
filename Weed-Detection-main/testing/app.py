from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import cv2
import numpy as np
import os
import time
import base64
from collections import Counter
from werkzeug.utils import secure_filename
import json
import threading
from queue import Queue
import tempfile
import shutil

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

# Video processing globals
video_processing_active = False
current_video_results = Queue()
processing_stats = {
    'frames_processed': 0,
    'total_detections': 0,
    'processing_time': 0,
    'fps': 0
}

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

def process_frame(frame):
    """Process single video frame with YOLO detection"""
    (H, W) = frame.shape[:2]
    
    # Create blob & forward pass
    blob = cv2.dnn.blobFromImage(frame, 1 / 255.0, (416, 416), swapRB=True, crop=False)
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
            # Classify as crop or weed and choose consistent colors
            detection_type = 'crop' if any(word in detected_label.lower() for word in ['crop', 'wheat', 'corn', 'soybean', 'rice', 'plant']) else 'weed'
            # Use exact brand colors (OpenCV expects BGR)
            # Crop green #2e8b57 -> RGB(46,139,87) => BGR(87,139,46)
            # Weed orange/red #ff5722 -> RGB(255,87,34) => BGR(34,87,255)
            color = (87, 139, 46) if detection_type == 'crop' else (34, 87, 255)

            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 3)
            label_text = f"{detection_type.upper()} {accuracy * 100:.1f}%"
            cv2.putText(frame, label_text, (x, max(y - 10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

            detections.append({
                'name': detected_label.capitalize(),
                'confidence': float(accuracy),
                'type': detection_type,
                'bbox': [x, y, w, h],
                'center': [x + w//2, y + h//2]  # Center point for spraying coordinates
            })
    
    processing_time = end - start
    return frame, detections, processing_time

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
            'processing_time': 0.5,
            'processed_image': image_base64
        }
        
        # Clean up
        os.remove(temp_path)
        
        response = jsonify(result)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Error: {str(e)}")
        error_response = jsonify({'error': str(e)})
        error_response.headers.add('Access-Control-Allow-Origin', '*')
        return error_response, 500

@app.route('/detect-video', methods=['POST', 'OPTIONS'])
def detect_video():
    """Process uploaded video file"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No video file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded video temporarily
        filename = secure_filename(file.filename)
        temp_video_path = f"temp_video_{filename}"
        file.save(temp_video_path)
        
        # Process video
        result = process_video_file(temp_video_path, filename)
        
        # Clean up
        os.remove(temp_video_path)
        if 'processed_video_path' in result and os.path.exists(result['processed_video_path']):
            # Convert processed video to base64
            with open(result['processed_video_path'], 'rb') as video_file:
                video_base64 = base64.b64encode(video_file.read()).decode('utf-8')
                result['processed_video'] = video_base64
            os.remove(result['processed_video_path'])
            del result['processed_video_path']
        
        response = jsonify(result)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Video processing error: {str(e)}")
        error_response = jsonify({'error': str(e)})
        error_response.headers.add('Access-Control-Allow-Origin', '*')
        return error_response, 500

def process_video_file(video_path, filename):
    """Process entire video file and return results"""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception("Could not open video file")
    
    # Get video properties
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Setup video writer for processed output (force MP4 container)
    name_root, _ = os.path.splitext(filename)
    output_path = f"processed_{name_root}.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    frame_detections = []
    total_detections = 0
    frames_processed = 0
    start_time = time.time()
    
    # Process every nth frame to optimize performance
    frame_skip = max(1, fps // 5)  # Process 5 frames per second max
    last_detections = []
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frames_processed += 1
        
        # Skip frames for performance
        if frames_processed % frame_skip == 0:
            processed_frame, detections, processing_time = process_frame(frame.copy())
            total_detections += len(detections)
            last_detections = detections

            frame_detections.append({
                'frame_number': frames_processed,
                'timestamp': frames_processed / fps,
                'detections': detections,
                'processing_time': processing_time
            })

            out.write(processed_frame)
        else:
            # Draw last detections on skipped frames for consistent overlays
            overlay_frame = frame.copy()
            for d in last_detections:
                x, y, w, h = d['bbox']
                detection_type = d.get('type', 'weed')
                color = (87, 139, 46) if detection_type == 'crop' else (34, 87, 255)
                cv2.rectangle(overlay_frame, (x, y), (x + w, y + h), color, 3)
                label_text = f"{detection_type.upper()} {d.get('confidence', 0) * 100:.1f}%"
                cv2.putText(overlay_frame, label_text, (x, max(y - 10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            out.write(overlay_frame)
    
    cap.release()
    out.release()
    
    processing_duration = time.time() - start_time
    
    # Calculate statistics
    crops = sum(len([d for d in frame['detections'] if d['type'] == 'crop']) for frame in frame_detections)
    weeds = sum(len([d for d in frame['detections'] if d['type'] == 'weed']) for frame in frame_detections)
    
    return {
        'filename': filename,
        'video_stats': {
            'duration': total_frames / fps,
            'fps': fps,
            'resolution': f"{width}x{height}",
            'total_frames': total_frames,
            'processed_frames': len(frame_detections),
            'processing_time': processing_duration
        },
        'detection_summary': {
            'total_detections': total_detections,
            'crops_detected': crops,
            'weeds_detected': weeds,
            'detection_density': total_detections / max(len(frame_detections), 1)
        },
        'frame_detections': frame_detections[-100:],  # Last 100 frames for display
        'processed_video_path': output_path,
        'spray_coordinates': generate_spray_coordinates(frame_detections)
    }

def generate_spray_coordinates(frame_detections):
    """Generate GPS-like coordinates for drone spraying"""
    spray_points = []
    
    for frame_data in frame_detections:
        weed_detections = [d for d in frame_data['detections'] if d['type'] == 'weed']
        
        for detection in weed_detections:
            # Convert pixel coordinates to relative coordinates (0-1 range)
            # In real implementation, you'd convert to actual GPS coordinates
            spray_points.append({
                'timestamp': frame_data['timestamp'],
                'relative_x': detection['center'][0] / 1920,  # Assuming 1920px width
                'relative_y': detection['center'][1] / 1080,  # Assuming 1080px height
                'confidence': detection['confidence'],
                'target_type': detection['type'],
                'size': detection['bbox'][2] * detection['bbox'][3]  # Area for spray intensity
            })
    
    return spray_points

@app.route('/process-folder', methods=['POST', 'OPTIONS'])
def process_folder():
    """Process all images in a folder path"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        data = request.get_json()
        if not data or 'folder_path' not in data:
            return jsonify({'error': 'No folder path provided'}), 400
        
        folder_path = data['folder_path']
        
        if not os.path.exists(folder_path):
            return jsonify({'error': 'Folder path does not exist'}), 400
        
        # Supported image extensions
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}
        
        # Find all image files
        image_files = []
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if any(file.lower().endswith(ext) for ext in image_extensions):
                    image_files.append(os.path.join(root, file))
        
        if not image_files:
            return jsonify({'error': 'No image files found in the specified folder'}), 400
        
        results = []
        total_detections = 0
        
        for image_path in image_files:
            processed_image, detections = process_image(image_path)
            
            if processed_image is not None:
                # Convert processed image to base64
                _, buffer = cv2.imencode('.jpg', processed_image)
                image_base64 = base64.b64encode(buffer).decode('utf-8')
                
                summary = Counter([d['type'] for d in detections])
                total_detections += len(detections)
                
                results.append({
                    'filename': os.path.basename(image_path),
                    'detections': detections,
                    'summary': dict(summary),
                    'total_detections': len(detections),
                    'processed_image': image_base64
                })
        
        response_data = {
            'folder_path': folder_path,
            'total_images': len(image_files),
            'processed_images': len(results),
            'total_detections': total_detections,
            'results': results
        }
        
        response = jsonify(response_data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        print(f"Folder processing error: {str(e)}")
        error_response = jsonify({'error': str(e)})
        error_response.headers.add('Access-Control-Allow-Origin', '*')
        return error_response, 500

@app.route('/video-stats', methods=['GET'])
def get_video_stats():
    """Get current video processing statistics"""
    response = jsonify(processing_stats)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'YOLO model ready', 'video_support': True})

if __name__ == '__main__':
    print("WeedWise Detection Server Starting...")
    print(" Server will run on: http://localhost:5000")
    print(" Video detection enabled for drone applications")
    app.run(debug=True, port=5000, threaded=True)