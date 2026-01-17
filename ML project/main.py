from networksecurity.components.data_ingestion import DataIngestion
from networksecurity.components.data_validation import DataValidation
from networksecurity.components.data_transformation import DataTransformation
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.entity.config_entity import DataIngestionConfig,DataValidationConfig,DataTransformationConfig
from networksecurity.entity.config_entity import TrainingPipelineConfig
from networksecurity.pipeline.training_pipeline import TrainingPipeline

import sys

if __name__=='__main__':
    try:
        

        pipeline = TrainingPipeline()
        pipeline.run_pipeline()


    except Exception as e:
           raise NetworkSecurityException(e,sys)
