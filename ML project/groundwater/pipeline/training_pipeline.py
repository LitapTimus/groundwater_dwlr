import os
import sys

from groundwater.exception.exception import GroundwaterException
from groundwater.logging.logger import logging

from groundwater.components.data_ingestion import DataIngestion
from groundwater.components.data_validation import DataValidation
from groundwater.components.data_transformation import DataTransformation
from groundwater.components.model_trainer import ModelTrainer

from groundwater.entity.config_entity import (
    TrainingPipelineConfig,
    DataIngestionConfig,
    DataValidationConfig,
    DataTransformationConfig,
    ModelTrainerConfig,
)

from groundwater.entity.artifact_entity import (
    DataIngestionArtifact,
    DataValidationArtifact,
    DataTransformationArtifact,
    ModelTrainerArtifact,
)

from groundwater.constant.training_pipeline import TRAINING_BUCKET_NAME

# S3 is optional
try:
    from groundwater.cloud.s3_syncer import S3Sync
    S3_AVAILABLE = True
except Exception:
    S3_AVAILABLE = False


class TrainingPipeline:
    def __init__(self):
        self.training_pipeline_config = TrainingPipelineConfig()

        if S3_AVAILABLE and TRAINING_BUCKET_NAME:
            self.s3_sync = S3Sync()
        else:
            self.s3_sync = None
            logging.info("S3 sync is disabled. Running in local-only mode.")

    def start_data_ingestion(self) -> DataIngestionArtifact:
        try:
            data_ingestion_config = DataIngestionConfig(
                training_pipeline_config=self.training_pipeline_config
            )

            logging.info("Starting data ingestion")

            data_ingestion = DataIngestion(
                data_ingestion_config=data_ingestion_config
            )

            data_ingestion_artifact = data_ingestion.initiate_data_ingestion()

            logging.info(f"Data ingestion completed: {data_ingestion_artifact}")

            return data_ingestion_artifact

        except Exception as e:
            raise GroundwaterException(e, sys)

    def start_data_validation(
        self, data_ingestion_artifact: DataIngestionArtifact
    ) -> DataValidationArtifact:
        try:
            data_validation_config = DataValidationConfig(
                training_pipeline_config=self.training_pipeline_config
            )

            data_validation = DataValidation(
                data_ingestion_artifact=data_ingestion_artifact,
                data_validation_config=data_validation_config,
            )

            logging.info("Starting data validation")

            data_validation_artifact = data_validation.initiate_data_validation()

            logging.info(f"Data validation completed: {data_validation_artifact}")

            return data_validation_artifact

        except Exception as e:
            raise GroundwaterException(e, sys)

    def start_data_transformation(
        self, data_validation_artifact: DataValidationArtifact
    ) -> DataTransformationArtifact:
        try:
            data_transformation_config = DataTransformationConfig(
                training_pipeline_config=self.training_pipeline_config
            )

            data_transformation = DataTransformation(
                data_validation_artifact=data_validation_artifact,
                data_transformation_config=data_transformation_config,
            )

            logging.info("Starting data transformation")

            data_transformation_artifact = (
                data_transformation.initiate_data_transformation()
            )

            logging.info(
                f"Data transformation completed: {data_transformation_artifact}"
            )

            return data_transformation_artifact

        except Exception as e:
            raise GroundwaterException(e, sys)

    def start_model_trainer(
        self, data_transformation_artifact: DataTransformationArtifact
    ) -> ModelTrainerArtifact:
        try:
            model_trainer_config = ModelTrainerConfig(
                training_pipeline_config=self.training_pipeline_config
            )

            model_trainer = ModelTrainer(
                data_transformation_artifact=data_transformation_artifact,
                model_trainer_config=model_trainer_config,
            )

            logging.info("Starting model training")

            model_trainer_artifact = model_trainer.initiate_model_trainer()

            logging.info(f"Model training completed: {model_trainer_artifact}")

            return model_trainer_artifact

        except Exception as e:
            raise GroundwaterException(e, sys)

    # ===============================
    # Optional: S3 Sync
    # ===============================
    def sync_model_to_s3(self):
        try:
            if self.s3_sync is None:
                logging.info("Skipping S3 sync (not configured).")
                return

            model_dir = self.training_pipeline_config.model_dir

            if not os.path.exists(model_dir):
                raise FileNotFoundError(f"Model directory not found: {model_dir}")

            aws_bucket_url = (
                f"s3://{TRAINING_BUCKET_NAME}/final_model/{self.training_pipeline_config.timestamp}"
            )

            logging.info(f"Syncing model to S3: {aws_bucket_url}")

            self.s3_sync.sync_folder_to_s3(
                folder=model_dir,
                aws_bucket_url=aws_bucket_url,
            )

        except Exception as e:
            raise GroundwaterException(f"{type(e).__name__}: {e}", sys)

    # ===============================
    # Run Full Pipeline
    # ===============================
    def run_pipeline(self) -> ModelTrainerArtifact:
        try:
            logging.info("========== PIPELINE STARTED ==========")

            data_ingestion_artifact = self.start_data_ingestion()

            data_validation_artifact = self.start_data_validation(
                data_ingestion_artifact=data_ingestion_artifact
            )

            data_transformation_artifact = self.start_data_transformation(
                data_validation_artifact=data_validation_artifact
            )

            model_trainer_artifact = self.start_model_trainer(
                data_transformation_artifact=data_transformation_artifact
            )

            # Optional cloud sync
            self.sync_model_to_s3()

            logging.info("========== PIPELINE COMPLETED ==========")

            return model_trainer_artifact

        except Exception as e:
            raise GroundwaterException(f"{type(e).__name__}: {e}", sys)


