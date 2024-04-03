import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import object_info from './data/info.json'; 

const PredictPage = () => {
    const [file, setFile] = useState(null);
    const [detectedObjects, setDetectedObjects] = useState([]);
    const [imageSrc, setImageSrc] = useState(null);
    const [detectedIds, setDetectedIds] = useState([]);
    const [totalCalories, setTotalCalories] = useState(0);
    const [totalProtein, setTotalProtein] = useState(0);
    const [totalFat, setTotalFat] = useState(0);
    const [totalCarbohydrates, setTotalCarbohydrates] = useState(0);
    const [totalFiber, setTotalFiber] = useState(0);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (file == null) {
            alert("Please select an image");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        fetch('http://localhost:5000/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setDetectedObjects(data.detected_objects);
            setImageSrc(`data:image/jpeg;base64,${data.image}`);
            setDetectedIds(data.detected_ids);

            let totalCalories = 0;
            let totalProtein = 0;
            let totalFat = 0;
            let totalCarbohydrates = 0;
            let totalFiber = 0;

            // Loop through detected objects and sum up nutrition information
            console.log(detectedIds);
            data.detected_objects.forEach((object, index) => {
                const objectId = detectedIds[index];
                console.log(object_info.classes[objectId]);
                if (object_info.classes[objectId]) {
                    const nutritionInfo = object_info.classes[objectId].plant_info.nutrition_info;
                    console.log(nutritionInfo);
                    totalCalories += nutritionInfo.calories_per_100g;
                    totalProtein += nutritionInfo.protein_per_100g;
                    totalFat += nutritionInfo.fat_per_100g;
                    totalCarbohydrates += nutritionInfo.carbohydrates_per_100g;
                    totalFiber += nutritionInfo.fiber_per_100g;
                }
            });

            setTotalCalories(totalCalories);
            setTotalProtein(totalProtein);
            setTotalFat(totalFat);
            setTotalCarbohydrates(totalCarbohydrates);
            setTotalFiber(totalFiber);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Object Detection</h5>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <input type="file" className="form-control-file mb-2" name="image" onChange={handleFileChange} />
                                </div>
                                <button type="submit" className="btn btn-primary">Upload</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {imageSrc && (
                <div className="row justify-content-center mt-5">
                    <div className="col-md-12">
                        <div className="card">
                            <img className="card-img-top" src={imageSrc} alt="Uploaded" />
                        </div>
                    </div>
                </div>
            )}

            {detectedObjects.map((object, index) => (
                <div key={index} className="row justify-content-around mt-5">
                    <div className="col-10 md-3">
                        <div className="card mb-8">
                            <div className="card-body">
                                <h5 className="card-title">Detected Object {index + 1}</h5>
                                <p className="card-text"><strong>Class Name:</strong> {object.class_name}</p>
                                <p className="card-text"><strong>Confidence:</strong> {object.confidence}</p>
                                <h5 className="card-subtitle mb-2 text-muted"><strong>Nutrition Information:</strong></h5>
                                {object_info.classes[detectedIds[index]] && (
                                    <div>
                                        <p><strong>Scientific Name:</strong> {object_info.classes[detectedIds[index]].plant_info.scientific_name}</p>
                                        <p><strong>Common Names:</strong> {object_info.classes[detectedIds[index]].plant_info.common_names.join(', ')}</p>
                                        <p><strong>Description:</strong> {object_info.classes[detectedIds[index]].plant_info.description}</p>
                                        <p><strong>Calories per 100g:</strong> {object_info.classes[detectedIds[index]].plant_info.nutrition_info.calories_per_100g}</p>
                                        <p><strong>Protein per 100g:</strong> {object_info.classes[detectedIds[index]].plant_info.nutrition_info.protein_per_100g}</p>
                                        <p><strong>Fat per 100g:</strong> {object_info.classes[detectedIds[index]].plant_info.nutrition_info.fat_per_100g}</p>
                                        <p><strong>Carbohydrates per 100g:</strong> {object_info.classes[detectedIds[index]].plant_info.nutrition_info.carbohydrates_per_100g}</p>
                                        <p><strong>Fiber per 100g:</strong> {object_info.classes[detectedIds[index]].plant_info.nutrition_info.fiber_per_100g}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Display total nutrition */}
            <div className="row justify-content-center mt-5">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Total Nutrition</h5>
                            <p className="card-text"><strong>Total Calories:</strong> {totalCalories}</p>
                            <p className="card-text"><strong>Total Protein:</strong> {totalProtein}</p>
                            <p className="card-text"><strong>Total Fat:</strong> {totalFat}</p>
                            <p className="card-text"><strong>Total Carbohydrates:</strong> {totalCarbohydrates}</p>
                            <p className="card-text"><strong>Total Fiber:</strong> {totalFiber}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictPage;
