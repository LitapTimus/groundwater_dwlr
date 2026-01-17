import pandas as pd
from typing import List, Dict

class HotspotDetector:

    @staticmethod
    def top_hotspots(
        df: pd.DataFrame,
        region_col: str,
        top_n: int = 10
    ) -> List[Dict]:
        """
        Ranks regions by risk score:
        risk_score = avg_stress_index * (critical_pct / 100)
        """

        results = []

        for region, group in df.groupby(region_col):
            total = len(group)

            zone_counts = group["zone"].value_counts().to_dict()

            critical_count = zone_counts.get("CRITICAL", 0) + zone_counts.get("OVER_EXPLOITED", 0)

            critical_pct = (critical_count / total) * 100 if total > 0 else 0

            avg_stress = group["stress_index"].mean()

            risk_score = avg_stress * (critical_pct / 100)

            results.append({
                "region": str(region),
                "total_records": int(total),
                "avg_stress_index": round(avg_stress, 4),
                "critical_percentage": round(critical_pct, 2),
                "risk_score": round(risk_score, 4),
                "zone_counts": zone_counts
            })

        # Sort descending by risk_score
        results = sorted(results, key=lambda x: x["risk_score"], reverse=True)

        return results[:top_n]
