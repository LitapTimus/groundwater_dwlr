from networksecurity.constant.training_pipeline import SAVED_MODEL_DIR, MODEL_FILE_NAME
import sys
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging

class NetworkModel:
    def __init__(self, preprocessor, model):
        try:
            self.preprocessor = preprocessor
            self.model = model
            logging.info("NetworkModel wrapper initialized")
        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def predict(self, x):
        try:
            logging.info("Starting prediction")

            x_transform = self.preprocessor.transform(x)
            y_hat = self.model.predict(x_transform)

            logging.info("Prediction completed")

            return y_hat

        except Exception as e:
            raise NetworkSecurityException(e, sys)
