from groundwater.constant.training_pipeline import SAVED_MODEL_DIR, MODEL_FILE_NAME
import sys
from groundwater.exception.exception import GroundwaterException
from groundwater.logging.logger import logging

class GroundwaterModel:
    def __init__(self, preprocessor, model):
        try:
            self.preprocessor = preprocessor
            self.model = model
            logging.info("GroundwaterModel wrapper initialized")
        except Exception as e:
            raise GroundwaterException(e, sys)

    def predict(self, x):
        try:
            logging.info("Starting prediction")

            x_transform = self.preprocessor.transform(x)
            y_hat = self.model.predict(x_transform)

            logging.info("Prediction completed")

            return y_hat

        except Exception as e:
            raise GroundwaterException(e, sys)


