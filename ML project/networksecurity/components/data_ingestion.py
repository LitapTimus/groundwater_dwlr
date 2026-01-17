from networksecurity.exception.exception import NetworkSecurityException
from networksecurity.logging.logger import logging
from networksecurity.entity.config_entity import DataIngestionConfig
from networksecurity.entity.artifact_entity import DataIngestionArtifact

import os
import sys
import numpy as np
import pandas as pd
import pymongo
from sklearn.model_selection import train_test_split
from dotenv import load_dotenv

from networksecurity.constant.training_pipeline import FILE_NAME

load_dotenv()

MONGO_DB_URL = os.getenv("MONGO_DB_URL")


class DataIngestion:
    def __init__(self, data_ingestion_config: DataIngestionConfig):
        try:
            self.data_ingestion_config = data_ingestion_config
        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def export_collection_as_dataframe(self) -> pd.DataFrame:
        """
        Read data either from:
        - Local CSV file (if exists)
        - Else MongoDB (fallback)
        """
        try:
            # ============================
            # 1. Try local dataset first
            # ============================
            if os.path.exists(FILE_NAME):
                logging.info(f"Reading dataset from local file: {FILE_NAME}")
                df = pd.read_csv(FILE_NAME)
            else:
                # ============================
                # 2. Fallback to MongoDB
                # ============================
                logging.info("Local dataset not found. Reading from MongoDB.")

                database_name = self.data_ingestion_config.database_name
                collection_name = self.data_ingestion_config.collection_name

                if MONGO_DB_URL is None:
                    raise Exception("MONGO_DB_URL is not set and local dataset not found.")

                self.mongo_client = pymongo.MongoClient(MONGO_DB_URL)
                collection = self.mongo_client[database_name][collection_name]

                df = pd.DataFrame(list(collection.find()))

                if "_id" in df.columns:
                    df = df.drop(columns=["_id"], axis=1)

            # ============================
            # Basic cleanup
            # ============================
            df.replace({"na": np.nan}, inplace=True)

            logging.info(f"Dataset loaded successfully with shape: {df.shape}")

            return df

        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def export_data_into_feature_store(self, dataframe: pd.DataFrame) -> pd.DataFrame:
        try:
            feature_store_file_path = self.data_ingestion_config.feature_store_file_path

            dir_path = os.path.dirname(feature_store_file_path)
            os.makedirs(dir_path, exist_ok=True)

            logging.info(f"Saving feature store at: {feature_store_file_path}")

            dataframe.to_csv(feature_store_file_path, index=False, header=True)

            return dataframe

        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def split_data_as_train_test(self, dataframe: pd.DataFrame):
        try:
            train_set, test_set = train_test_split(
                dataframe,
                test_size=self.data_ingestion_config.train_test_split_ratio,
                random_state=42
            )

            logging.info("Performed train test split on the dataframe")

            dir_path = os.path.dirname(self.data_ingestion_config.training_file_path)
            os.makedirs(dir_path, exist_ok=True)

            logging.info("Exporting train and test datasets")

            train_set.to_csv(
                self.data_ingestion_config.training_file_path,
                index=False,
                header=True
            )

            test_set.to_csv(
                self.data_ingestion_config.testing_file_path,
                index=False,
                header=True
            )

            logging.info("Train and test datasets exported successfully")

        except Exception as e:
            raise NetworkSecurityException(e, sys)

    def initiate_data_ingestion(self) -> DataIngestionArtifact:
        try:
            dataframe = self.export_collection_as_dataframe()
            dataframe = self.export_data_into_feature_store(dataframe)
            self.split_data_as_train_test(dataframe)

            data_ingestion_artifact = DataIngestionArtifact(
                trained_file_path=self.data_ingestion_config.training_file_path,
                test_file_path=self.data_ingestion_config.testing_file_path
            )

            logging.info("Data ingestion completed successfully")

            return data_ingestion_artifact

        except Exception as e:
            raise NetworkSecurityException(e, sys)
