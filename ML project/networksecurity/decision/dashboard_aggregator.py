import pandas as pd
from typing import Dict

class DashboardAggregator:

    @staticmethod
    def zone_distribution(df: pd.DataFrame) -> Dict:
        zone_counts = df["zone"].value_counts().to_dict()

        total = len(df)

        zone_percent = {
            zone: round((count / total) * 100, 2)
            for zone, count in zone_counts.items()
        }

        return {
            "total_records": total,
            "zone_counts": zone_counts,
            "zone_percentages": zone_percent
        }

    @staticmethod
    def stress_summary(df: pd.DataFrame) -> Dict:
        return {
            "avg_stress_index": round(df["stress_index"].mean(), 4),
            "max_stress_index": round(df["stress_index"].max(), 4),
            "min_stress_index": round(df["stress_index"].min(), 4),
            "median_stress_index": round(df["stress_index"].median(), 4),
        }

    @staticmethod
    def full_summary(df: pd.DataFrame) -> Dict:
        zone_stats = DashboardAggregator.zone_distribution(df)
        stress_stats = DashboardAggregator.stress_summary(df)

        # Risk level logic
        critical_pct = zone_stats["zone_percentages"].get("CRITICAL", 0) + \
                       zone_stats["zone_percentages"].get("OVER_EXPLOITED", 0)

        if critical_pct > 50:
            overall_status = "SEVERE"
        elif critical_pct > 25:
            overall_status = "HIGH_RISK"
        elif critical_pct > 10:
            overall_status = "MODERATE_RISK"
        else:
            overall_status = "STABLE"

        return {
            "overall_status": overall_status,
            "zone_statistics": zone_stats,
            "stress_statistics": stress_stats,
        }
    @staticmethod   
    def summary_by_region(df: pd.DataFrame, region_col: str) -> dict:
        result = {}

        for region, group in df.groupby(region_col):
            zone_counts = group["zone"].value_counts().to_dict()
            total = len(group)

            zone_percent = {
                zone: round((count / total) * 100, 2)
                for zone, count in zone_counts.items()
            }

            stress_stats = {
                "avg_stress_index": round(group["stress_index"].mean(), 4),
                "max_stress_index": round(group["stress_index"].max(), 4),
                "min_stress_index": round(group["stress_index"].min(), 4),
            }

            # Risk logic
            critical_pct = zone_percent.get("CRITICAL", 0) + zone_percent.get("OVER_EXPLOITED", 0)

            if critical_pct > 50:
                overall_status = "SEVERE"
            elif critical_pct > 25:
                overall_status = "HIGH_RISK"
            elif critical_pct > 10:
                overall_status = "MODERATE_RISK"
            else:
                overall_status = "STABLE"

            result[str(region)] = {
                "total_records": total,
                "overall_status": overall_status,
                "zone_counts": zone_counts,
                "zone_percentages": zone_percent,
                "stress_statistics": stress_stats,
            }

        return result
