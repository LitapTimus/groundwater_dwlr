import pandas as pd
from typing import Dict, List

class TrendAnalyzer:

    @staticmethod
    def yearly_trend(
        df: pd.DataFrame,
        date_col: str,
        value_col: str,
    ) -> List[Dict]:
        df[date_col] = pd.to_datetime(df[date_col])

        df["year"] = df[date_col].dt.year

        grouped = df.groupby("year")[value_col].mean().reset_index()

        grouped = grouped.sort_values("year")

        return grouped.to_dict(orient="records")

    @staticmethod
    def monthly_trend(
        df: pd.DataFrame,
        date_col: str,
        value_col: str,
    ) -> List[Dict]:
        df[date_col] = pd.to_datetime(df[date_col])

        df["year_month"] = df[date_col].dt.to_period("M").astype(str)

        grouped = df.groupby("year_month")[value_col].mean().reset_index()

        grouped = grouped.sort_values("year_month")

        return grouped.to_dict(orient="records")

    @staticmethod
    def trend_by_region(
        df: pd.DataFrame,
        date_col: str,
        value_col: str,
        region_col: str,
    ) -> Dict[str, List[Dict]]:
        df[date_col] = pd.to_datetime(df[date_col])

        df["year"] = df[date_col].dt.year

        result = {}

        for region, group in df.groupby(region_col):
            grouped = group.groupby("year")[value_col].mean().reset_index()
            grouped = grouped.sort_values("year")
            result[str(region)] = grouped.to_dict(orient="records")

        return result


