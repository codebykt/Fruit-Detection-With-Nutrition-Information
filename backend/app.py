import json

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
from ultralytics import YOLO
import base64
import numpy as np

app = Flask(__name__)
CORS(app)

# Load your custom YOLO model
model = YOLO("best-food.pt")

# Load plant information JSON file
with open('info.json', 'r') as f:
    food_info = json.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image in the request"})

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({"error": "No image selected"})

    # Read the image
    image = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)

    # Perform object detection on the image
    results = model.predict(image, verbose=False)
    result = results[0]  # Assuming there is only one detection result

    # Initialize an empty list to store detected object information
    detected_objects = []
    predicted_ids = []

    # Iterate through detected boxes and extract object information
    for box in result.boxes:
        class_id = box.cls[0].item()
        predicted_ids.append(int(class_id))
        class_name = result.names[class_id]
        confidence = box.conf.item()
        detected_objects.append({"class_name": class_name, "confidence": confidence})

        # Calculate smaller bounding box dimensions
        x1, y1, x2, y2 = [round(x) for x in box.xyxy[0].tolist()]
        box_width = x2 - x1
        box_height = y2 - y1
        smaller_box_width = int(box_width * 0.8)  # Decrease width by 20%
        smaller_box_height = int(box_height * 0.8)  # Decrease height by 20%
        x1_new = x1 + (box_width - smaller_box_width) // 2
        y1_new = y1 + (box_height - smaller_box_height) // 2
        x2_new = x1_new + smaller_box_width
        y2_new = y1_new + smaller_box_height

        # Draw smaller bounding box and label on the image
        cv2.rectangle(image, (x1_new, y1_new), (x2_new, y2_new), (0, 255, 0), 2)
        cv2.putText(image, f"{class_name} ({confidence:.2f})", (x1_new, y1_new - 10), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 0, 255), 2)

    # Convert the image to base64-encoded string
    _, buffer = cv2.imencode('.jpg', image)
    image_str = base64.b64encode(buffer).decode('utf-8')

    return jsonify({"detected_objects": detected_objects, "detected_ids": predicted_ids, "image": image_str})

@app.route("/classes", methods=["GET"])
def get_classes():
    all_classes = model.names
    return jsonify({"classes": all_classes})

if __name__ == "__main__":
    app.run(debug=True)
