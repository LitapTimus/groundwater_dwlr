import os
import sys
import json
import numpy as np

from groundwater.exception.exception import GroundwaterException
from groundwater.logging.logger import logging

from groundwater.entity.artifact_entity import (
    DataTransformationArtifact,
    ModelTrainerArtifact,
)

from groundwater.entity.config_entity import ModelTrainerConfig
from groundwater.utils.ml_utils.model.estimator import GroundwaterModel
from groundwater.utils.main_utils.utils import save_object, load_object

from groundwater.utils.ml_utils.metric.classification_metric import (
    get_classification_score,
)

from sklearn.metrics import accuracy_score, r2_score
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor


class ModelTrainer:
    def __init__(
        self,
        model_trainer_config: ModelTrainerConfig,
        data_transformation_artifact: DataTransformationArtifact,
    ):
        try:
            self.model_trainer_config = model_trainer_config
            self.data_transformation_artifact = data_transformation_artifact
        except Exception as e:
            raise GroundwaterException(e, sys)

    def _detect_problem_type(self, y):
        unique_values = np.unique(y)
        if len(unique_values) <= 20:
            return "classification"
        return "regression"

    def train_model(self, X_train, y_train, X_test, y_test):

        problem_type = self._detect_problem_type(y_train)
        logging.info(f"Detected problem type: {problem_type}")

        # ===============================
        # Models
        # ===============================
        if problem_type == "classification":
            models = {
                "LogisticRegression": LogisticRegression(max_iter=1000, n_jobs=-1),
                "RandomForest": RandomForestClassifier(n_estimators=50, n_jobs=-1),
                "DecisionTree": DecisionTreeClassifier(),
            }
        else:
            models = {
                "LinearRegression": LinearRegression(),
                "RandomForestRegressor": RandomForestRegressor(n_estimators=50, n_jobs=-1),
                "DecisionTreeRegressor": DecisionTreeRegressor(),
            }

        # ===============================
        # Train all models & collect metrics
        # ===============================
        leaderboard = {}
        trained_models = {}

        for name, model in models.items():
            logging.info(f"Training model: {name}")

            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            if problem_type == "classification":
                score = accuracy_score(y_test, y_pred)
            else:
                score = r2_score(y_test, y_pred)

            leaderboard[name] = float(score)
            trained_models[name] = model

            logging.info(f"{name} score: {score}")

        # ===============================
        # Select best model
        # ===============================
        best_model_name = max(leaderboard, key=leaderboard.get)
        best_model = trained_models[best_model_name]
        best_score = leaderboard[best_model_name]

        logging.info(f"Best model selected: {best_model_name} with score {best_score}")

        # ===============================
        # Save leaderboard
        # ===============================
        metrics_dir = self.model_trainer_config.model_trainer_dir
        os.makedirs(metrics_dir, exist_ok=True)

        metrics_path = os.path.join(metrics_dir, "metrics.json")

        with open(metrics_path, "w") as f:
            json.dump(leaderboard, f, indent=4)

        logging.info(f"All model metrics saved at: {metrics_path}")
        logging.info(f"Leaderboard: {leaderboard}")

        # ===============================
        # Metrics for best model
        # ===============================
        if problem_type == "classification":
            train_pred = best_model.predict(X_train)
            test_pred = best_model.predict(X_test)

            train_metric = get_classification_score(y_train, train_pred)
            test_metric = get_classification_score(y_test, test_pred)
        else:
            train_metric = None
            test_metric = None

        # ===============================
        # Load preprocessor
        # ===============================
        preprocessor = load_object(
            self.data_transformation_artifact.transformed_object_file_path
        )

        # ===============================
        # Save final model
        # ===============================
        os.makedirs(os.path.dirname(self.model_trainer_config.trained_model_file_path), exist_ok=True)

        network_model = GroundwaterModel(
            preprocessor=preprocessor,
            model=best_model,
        )

        save_object(
            self.model_trainer_config.trained_model_file_path,
            network_model,
        )

        os.makedirs("final_model", exist_ok=True)
        save_object("final_model/model.pkl", network_model)

        model_trainer_artifact = ModelTrainerArtifact(
            trained_model_file_path=self.model_trainer_config.trained_model_file_path,
            train_metric_artifact=train_metric,
            test_metric_artifact=test_metric,
        )

        logging.info(f"Model training completed successfully: {model_trainer_artifact}")

        return model_trainer_artifact

    def initiate_model_trainer(self) -> ModelTrainerArtifact:
        try:
            train_data = load_object(self.data_transformation_artifact.transformed_train_file_path)
            test_data = load_object(self.data_transformation_artifact.transformed_test_file_path)

            X_train, y_train = train_data["X"], train_data["y"]
            X_test, y_test = test_data["X"], test_data["y"]

            return self.train_model(X_train, y_train, X_test, y_test)

        except Exception as e:
            raise GroundwaterException(e, sys)


