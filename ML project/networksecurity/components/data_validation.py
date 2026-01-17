from networksecurity.entity.artifact_entity import DataIngestionArtifact, DataValidationArtifact
from networksecurity.entity.config_entity import DataValidationConfig
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.constant.training_pipeline import SCHEMA_FILE_PATH
from scipy.stats import ks_2samp
import pandas as pd
import os, sys
from networksecurity.utils.main_utils.utils import read_yaml_file, write_yaml_file


class DataValidation:
    def __init__(self, data_ingestion_artifact: DataIngestionArtifact,
                 data_validation_config: DataValidationConfig):

        try:
            self.data_ingestion_artifact = data_ingestion_artifact
            self.data_validation_config = data_validation_config

            # Load schema if exists, else None
            if os.path.exists(SCHEMA_FILE_PATH):
                self._schema_config = read_yaml_file(SCHEMA_FILE_PATH)
                logging.info("Schema loaded from existing schema.yaml")
            else:
                self._schema_config = None
                logging.info("No schema.yaml found. Will auto-generate schema.")

        except Exception as e:
            raise NetworkSecurityException(e, sys)

    @staticmethod
    def read_data(file_path) -> pd.DataFrame:
        try:
            return pd.read_csv(file_path)
        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def _generate_and_save_schema(self, dataframe: pd.DataFrame):
        """
        Auto-generate schema from dataframe and save to schema.yaml
        """
        try:
            schema = {col: str(dtype) for col, dtype in dataframe.dtypes.items()}

            dir_path = os.path.dirname(SCHEMA_FILE_PATH)
            if dir_path:
                os.makedirs(dir_path, exist_ok=True)

            write_yaml_file(SCHEMA_FILE_PATH, schema, replace=True)
            self._schema_config = schema

            logging.info(f"Schema auto-generated and saved at: {SCHEMA_FILE_PATH}")

        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def validate_columns(self, dataframe: pd.DataFrame) -> bool:
        try:
            # If no schema yet → create it from this dataframe
            if self._schema_config is None:
                self._generate_and_save_schema(dataframe)
                return True

            schema_columns = set(self._schema_config.keys())
            dataframe_columns = set(dataframe.columns)

            missing_columns = schema_columns - dataframe_columns
            extra_columns = dataframe_columns - schema_columns

            if missing_columns:
                logging.error(f"Missing columns: {missing_columns}")
                return False

            if extra_columns:
                logging.warning(f"Extra columns found (allowed): {extra_columns}")

            return True

        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def detect_dataset_drift(self, base_df, current_df, threshold=0.05) -> bool:
        try:
            status = True
            report = {}

            for column in base_df.columns:
                if column not in current_df.columns:
                    continue

                d1 = base_df[column]
                d2 = current_df[column]

                # Only numeric columns
                if not pd.api.types.is_numeric_dtype(d1):
                    continue

                is_same_dist = ks_2samp(d1.dropna(), d2.dropna())

                if threshold <= is_same_dist.pvalue:
                    is_found = False
                else:
                    is_found = True
                    status = False

                report.update({
                    column: {
                        "p_value": float(is_same_dist.pvalue),
                        "drift_status": is_found
                    }
                })

            drift_report_file_path = self.data_validation_config.drift_report_file_path

            dir_path = os.path.dirname(drift_report_file_path)
            os.makedirs(dir_path, exist_ok=True)

            write_yaml_file(file_path=drift_report_file_path, content=report, replace=True)

            logging.info(f"Drift report saved at: {drift_report_file_path}")

            return status

        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def initiate_data_validation(self) -> DataValidationArtifact:
        try:
            train_file_path = self.data_ingestion_artifact.trained_file_path
            test_file_path = self.data_ingestion_artifact.test_file_path

            train_dataframe = DataValidation.read_data(train_file_path)
            test_dataframe = DataValidation.read_data(test_file_path)

            # ============================
            # Column validation
            # ============================
            train_status = self.validate_columns(train_dataframe)
            test_status = self.validate_columns(test_dataframe)

            if not train_status or not test_status:
                raise Exception("Column validation failed.")

            # ============================
            # Drift detection
            # ============================
            drift_status = self.detect_dataset_drift(
                base_df=train_dataframe,
                current_df=test_dataframe
            )

            # ============================
            # Save validated data
            # ============================
            dir_path = os.path.dirname(self.data_validation_config.valid_train_file_path)
            os.makedirs(dir_path, exist_ok=True)

            train_dataframe.to_csv(
                self.data_validation_config.valid_train_file_path,
                index=False,
                header=True
            )

            test_dataframe.to_csv(
                self.data_validation_config.valid_test_file_path,
                index=False,
                header=True
            )

            data_validation_artifact = DataValidationArtifact(
                validation_status=drift_status,
                valid_train_file_path=self.data_validation_config.valid_train_file_path,
                valid_test_file_path=self.data_validation_config.valid_test_file_path,
                invalid_train_file_path=None,
                invalid_test_file_path=None,
                drift_report_file_path=self.data_validation_config.drift_report_file_path,
            )

            logging.info("Data validation completed successfully")

            return data_validation_artifact

        except Exception as e:
            raise NetworkSecurityException(e, sys)
