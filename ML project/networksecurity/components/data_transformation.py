import sys
import os
import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from networksecurity.constant.training_pipeline import TARGET_COLUMN

from networksecurity.entity.artifact_entity import (
    DataTransformationArtifact,
    DataValidationArtifact
)

from networksecurity.entity.config_entity import DataTransformationConfig
from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.utils.main_utils.utils import save_numpy_array_data, save_object


class DataTransformation:
    def __init__(self, data_validation_artifact: DataValidationArtifact,
                 data_transformation_config: DataTransformationConfig):
        try:
            self.data_validation_artifact = data_validation_artifact
            self.data_transformation_config = data_transformation_config
        except Exception as e:
            raise NetworkSecurityException(e, sys)

    @staticmethod
    def read_data(file_path) -> pd.DataFrame:
        try:
            return pd.read_csv(file_path)
        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def get_data_transformer_object(self, dataframe: pd.DataFrame) -> ColumnTransformer:
        """
        Automatically builds preprocessing pipeline for:
        - Numerical columns
        - Categorical columns
        """
        try:
            logging.info("Building automatic preprocessing pipeline")

            # Separate feature types
            numerical_columns = dataframe.select_dtypes(include=["int64", "float64"]).columns.tolist()
            categorical_columns = dataframe.select_dtypes(include=["object", "category", "bool"]).columns.tolist()

            logging.info(f"Numerical columns: {numerical_columns}")
            logging.info(f"Categorical columns: {categorical_columns}")

            # Remove target if present
            if TARGET_COLUMN in numerical_columns:
                numerical_columns.remove(TARGET_COLUMN)
            if TARGET_COLUMN in categorical_columns:
                categorical_columns.remove(TARGET_COLUMN)

            # Pipelines
            num_pipeline = Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler())
            ])

            cat_pipeline = Pipeline(steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("encoder", OneHotEncoder(handle_unknown="ignore"))
            ])

            preprocessor = ColumnTransformer(
                transformers=[
                    ("num_pipeline", num_pipeline, numerical_columns),
                    ("cat_pipeline", cat_pipeline, categorical_columns)
                ],
                remainder="drop"
            )

            return preprocessor

        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def initiate_data_transformation(self) -> DataTransformationArtifact:
        logging.info("Entered initiate_data_transformation method of DataTransformation class")
        try:
            train_df = DataTransformation.read_data(self.data_validation_artifact.valid_train_file_path)
            test_df = DataTransformation.read_data(self.data_validation_artifact.valid_test_file_path)

            # Split features and target
            input_feature_train_df = train_df.drop(columns=[TARGET_COLUMN], axis=1)
            target_feature_train_df = train_df[TARGET_COLUMN]

            input_feature_test_df = test_df.drop(columns=[TARGET_COLUMN], axis=1)
            target_feature_test_df = test_df[TARGET_COLUMN]

            # Build preprocessor
            preprocessor = self.get_data_transformer_object(train_df)

            logging.info("Fitting preprocessing pipeline on training data")

            preprocessor_object = preprocessor.fit(input_feature_train_df)

            transformed_input_train_feature = preprocessor_object.transform(input_feature_train_df)
            transformed_input_test_feature = preprocessor_object.transform(input_feature_test_df)

            # ===============================
            # Convert sparse to dense safely
            # ===============================
            if hasattr(transformed_input_train_feature, "toarray"):
              transformed_input_train_feature = transformed_input_train_feature.toarray()

            if hasattr(transformed_input_test_feature, "toarray"):
                transformed_input_test_feature = transformed_input_test_feature.toarray()

            # ===============================
            # Save X and y separately
            # ===============================
            train_arr = {
            "X": transformed_input_train_feature,
            "y": np.array(target_feature_train_df)
        }

            test_arr = {
            "X": transformed_input_test_feature,
            "y": np.array(target_feature_test_df)
        }

            
            # Save arrays
            save_object(
            self.data_transformation_config.transformed_train_file_path, train_arr
        )

            save_object(
            self.data_transformation_config.transformed_test_file_path, test_arr
        )

        # Save preprocessor
            save_object(
            self.data_transformation_config.transformed_object_file_path,
            preprocessor_object
        )

        # Save for inference
            os.makedirs("final_model", exist_ok=True)
            save_object("final_model/preprocessor.pkl", preprocessor_object)

            data_transformation_artifact = DataTransformationArtifact(
            transformed_object_file_path=self.data_transformation_config.transformed_object_file_path,
            transformed_train_file_path=self.data_transformation_config.transformed_train_file_path,
            transformed_test_file_path=self.data_transformation_config.transformed_test_file_path
        )

            logging.info("Data transformation completed successfully")

            return data_transformation_artifact

        except Exception as e:
            raise NetworkSecurityException(e, sys)
