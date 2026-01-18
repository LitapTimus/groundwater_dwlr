import yaml
from groundwater.exception.exception import GroundwaterException
from groundwater.logging.logger import logging
import os, sys
import numpy as np
import pickle

from sklearn.metrics import r2_score
from sklearn.model_selection import GridSearchCV


def read_yaml_file(file_path: str) -> dict:
    try:
        with open(file_path, "rb") as yaml_file:
            return yaml.safe_load(yaml_file)
    except Exception as e:
        raise GroundwaterException(e, sys) from e


def write_yaml_file(file_path: str, content: object, replace: bool = False) -> None:
    try:
        if replace and os.path.exists(file_path):
            os.remove(file_path)

        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, "w") as file:
            yaml.dump(content, file)

    except Exception as e:
        raise GroundwaterException(e, sys)


def save_numpy_array_data(file_path: str, array: np.array):
    try:
        dir_path = os.path.dirname(file_path)
        os.makedirs(dir_path, exist_ok=True)

        with open(file_path, "wb") as file_obj:
            np.save(file_obj, array)

    except Exception as e:
        raise GroundwaterException(e, sys) from e


def save_object(file_path: str, obj: object) -> None:
    try:
        logging.info(f"Saving object at: {file_path}")
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, "wb") as file_obj:
            pickle.dump(obj, file_obj)

        logging.info("Object saved successfully")

    except Exception as e:
        raise GroundwaterException(e, sys) from e


def load_object(file_path: str) -> object:
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file: {file_path} does not exist")

        logging.info(f"Loading object from: {file_path}")

        with open(file_path, "rb") as file_obj:
            return pickle.load(file_obj)

    except Exception as e:
        raise GroundwaterException(e, sys) from e


def load_numpy_array_data(file_path: str) -> np.array:
    try:
        with open(file_path, "rb") as file_obj:
            return np.load(file_obj)

    except Exception as e:
        raise GroundwaterException(e, sys) from e


def evaluate_models(X_train, y_train, X_test, y_test, models, param):
    """
    Generic model evaluation (currently regression-based scoring).
    Later we will auto-switch this to classification/regression.
    """
    try:
        report = {}

        for model_name in models:
            model = models[model_name]
            para = param.get(model_name, {})

            logging.info(f"Tuning and training model: {model_name}")

            gs = GridSearchCV(model, para, cv=3, n_jobs=-1)
            gs.fit(X_train, y_train)

            model.set_params(**gs.best_params_)
            model.fit(X_train, y_train)

            y_test_pred = model.predict(X_test)

            test_model_score = r2_score(y_test, y_test_pred)

            report[model_name] = test_model_score

            logging.info(f"{model_name} test score: {test_model_score}")

        return report

    except Exception as e:
        raise GroundwaterException(e, sys)


