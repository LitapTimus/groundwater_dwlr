from groundwater.components.data_ingestion import DataIngestion
from groundwater.components.data_validation import DataValidation
from groundwater.components.data_transformation import DataTransformation
from groundwater.exception.exception import GroundwaterException
from groundwater.logging.logger import logging
from groundwater.entity.config_entity import DataIngestionConfig,DataValidationConfig,DataTransformationConfig
from groundwater.entity.config_entity import TrainingPipelineConfig
from groundwater.pipeline.training_pipeline import TrainingPipeline

import sys

if __name__=='__main__':
    try:
        

        pipeline = TrainingPipeline()
        pipeline.run_pipeline()


    except Exception as e:
           raise GroundwaterException(e,sys)


