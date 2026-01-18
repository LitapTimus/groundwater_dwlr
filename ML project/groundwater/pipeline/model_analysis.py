
import sys
import os
import pandas as pd
import numpy as np
from groundwater.utils.main_utils.utils import load_object
from groundwater.exception.exception import GroundwaterException
from groundwater.logging.logger import logging
from groundwater.entity.artifact_entity import DataTransformationArtifact

class ModelAnalysis:
    def __init__(self):
        # We need to find the artifacts. Assuming standard path structure from training.
        # This is a bit hacky but efficient for this specific codebase structure.
        self.artifact_dir = os.path.join(os.getcwd(), "artifacts")
        self.model_path = os.path.join("final_model", "model.pkl")

    def get_analysis_data(self):
        try:
            # 1. Load Model
            if not os.path.exists(self.model_path):
                 raise Exception("Model not found. Please train first.")
            
            groundwater_model = load_object(self.model_path)
            model = groundwater_model.model # The actual sklearn estimator
            
            # 2. Load Test Data
            # We look for the latest data_transformation artifact
            # For simplicity in this demo, we can just reload the 'test.npy' if we know where it is,
            # OR we can assume the user wants analysis on the *Transform* artifacts.
            
            # Better approach: We saved independent X_test and y_test in 'artifacts/data_transformation/transformed/test.npy' usually?
            # Let's check the code: Save object saves a dict {'X':..., 'y':...}
            
            # Correct Path Structure: artifacts/<timestamp>/data_transformation/transformed/test.npy
            
            # 1. Find the latest run folder in artifacts/
            if not os.path.exists(self.artifact_dir):
                 return {"error": "No run artifacts found."}
            
            # Filter only directories that look like timestamps (start with 20)
            runs = [d for d in os.listdir(self.artifact_dir) if d.startswith('20')]
            if not runs:
                 return {"error": "No run folders found."}
                 
            latest_run = sorted(runs)[-1]
            
            # 2. Construct path to test.npy
            test_path = os.path.join(self.artifact_dir, latest_run, "data_transformation", "transformed", "test.npy")
            
            if not os.path.exists(test_path):
                 return {"error": "Test data not found."}
                 
            test_data = load_object(test_path)
            X_test = test_data["X"]
            y_test = test_data["y"]
            
            # 3. Predict
            y_pred = model.predict(X_test)
            
            # 4. Prepare Response Data
            
            # Graph 1: Actual vs Predicted
            # Randomly sample if too large (e.g. max 500 points) to keep UI fast
            n_points = len(y_test)
            indices = np.random.choice(n_points, size=min(500, n_points), replace=False)
            
            scatter_data = []
            residuals = []
            
            for i in indices:
                actual = float(y_test[i])
                predicted = float(y_pred[i])
                resid = actual - predicted
                
                scatter_data.append({
                    "actual": round(actual, 2),
                    "predicted": round(predicted, 2)
                })
                residuals.append(round(resid, 2))
                
            # Graph 3: Feature Importance
            # Check if model has feature_importances_
            feature_imp_data = []
            if hasattr(model, "feature_importances_"):
                # We need feature names. 
                # The preprocessor is in groundwater_model.preprocessor
                # Getting feature names from ColumnTransformer is tricky but possible.
                # For now, let's try to map indices or just generic names if names fail.
                
                try:
                    # Attempt to get feature names
                    preprocessor = groundwater_model.preprocessor
                    feature_names = preprocessor.get_feature_names_out()
                except:
                    feature_names = [f"Feature_{i}" for i in range(len(model.feature_importances_))]
                
                importances = model.feature_importances_
                
                # Combine and Sort
                imp_list = []
                for name, imp in zip(feature_names, importances):
                    # Clean generic sklearn names like "num_pipeline__"
                    clean_name = name.replace("num_pipeline__", "").replace("cat_pipeline__", "")
                    imp_list.append({"name": clean_name, "value": float(imp)})
                    
                # Top 10
                imp_list = sorted(imp_list, key=lambda x: x['value'], reverse=True)[:10]
                feature_imp_data = imp_list
                
            elif hasattr(model, "coef_"):
                 # Linear Model coefficients
                 pass # Similar logic could be added for coefficients
            
            return {
                "scatter": scatter_data,
                "residuals": residuals,
                "feature_importance": feature_imp_data,
                "metrics": {
                    "r2": round(model.score(X_test, y_test), 4) # Simple R2
                }
            }

        except Exception as e:
            raise GroundwaterException(e, sys)
